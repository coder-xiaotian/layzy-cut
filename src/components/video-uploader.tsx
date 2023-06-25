import { Box, IconButton, Stack, Tooltip } from "@mui/material";
import { ChangeEvent, useContext, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { FFmpegContext } from "@/app/providers";
import { getVideoMetadata } from "@/utils/video";
import { fetchFile } from "@ffmpeg/ffmpeg";
import TimeFormat from "hh-mm-ss"
import { VideoFile } from "@/app/tiktok/types";

type VideoUploaderProps = {
  subtitles?: string[]
  videoFiles: VideoFile[]
  onChange: any
}
export default function VideoUploader({subtitles = [], videoFiles, onChange}: VideoUploaderProps) {
  const {ffmpeg} = useContext(FFmpegContext)

  async function handleFileChange({
    target: { files },
  }: ChangeEvent<HTMLInputElement>) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i] as VideoFile;

      const {width, height, duration} = await getVideoMetadata(file)
      const d = Number(duration.toFixed())
      file.width = width;
      file.height = height;
      file.duration = d;

      ffmpeg.FS("writeFile", file.name, await fetchFile(file));
      await ffmpeg.run(
        "-i",
        file.name,
        "-y",
        "-f",
        "image2",
        "-frames",
        "1",
        "preview.jpg"
      );
      const data = ffmpeg.FS("readFile", "preview.jpg");
      file.previewUrl = URL.createObjectURL(new Blob([data.buffer]));
      ffmpeg.FS("unlink", "preview.jpg");
      ffmpeg.FS("unlink", file.name);
      videoFiles.push(file as any);
    }
    onChange([...videoFiles]);
  }

  return (
    <Box overflow={"auto"} className="pt-3">
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        display="inline-flex"
      >
        {videoFiles.map((file, i) => (
          <Preview
            key={i}
            file={file}
            subtitles={subtitles}
            onDelete={() => {
              videoFiles.splice(i, 1);
              onChange([...videoFiles]);
            }}
          />
        ))}
        <Uploader onUpload={handleFileChange as any} />
      </Stack>
    </Box>
  );
}

function Preview({ file, subtitles, onDelete }: any) {
  return (
    <Tooltip title={`${file.name} ${TimeFormat.fromS(file.duration, "hh:mm:ss")}`} placement="top">
      <div className="group relative shrink-0 flex flex-col w-[300px] h-[533px] bg-black border-2 hover:border-green-500">
        <div className="relative z-10 flex flex-col items-center mt-2 text-[28px]">
          {subtitles &&
            subtitles.map((str: string, i: number) => (
              <span key={i} className="bg-[#ef8900] text-white">
                {str}
              </span>
            ))}
        </div>
        <img
          className="absolute top-1/2 w-full -translate-y-1/2"
          src={file.previewUrl}
          alt="preview"
        />
        <div></div>
        <Tooltip title="删除">
          <IconButton
            size="small"
            className="invisible group-hover:visible !absolute z-20 top-0 right-0 
                        translate-x-1/2 -translate-y-1/2"
            color="error"
            onClick={onDelete}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </div>
    </Tooltip>
  );
}

function Uploader({ onUpload }: any) {
  const inputRef = useRef<HTMLInputElement>();
  return (
    <div
      onClick={() => inputRef.current.click()}
      className="cursor-pointer shrink-0 flex flex-col justify-center items-center w-[300px] h-[533px] bg-slate-100"
    >
      <FileUploadIcon className="text-slate-300 text-5xl" />
      <span className="text-slate-500">点击上传视频</span>
      <input
        ref={inputRef}
        className="invisible"
        type="file"
        onChange={onUpload}
        multiple
        accept="video/*"
      />
    </div>
  );
}
