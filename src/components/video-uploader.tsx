import { VideoFile } from "@/app/tiktok/types";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import { getVideoMetadata } from "@/utils/video";
import CloseIcon from "@mui/icons-material/Close";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import TimeFormat from "hh-mm-ss";
import { ChangeEvent, useRef } from "react";
import Spin from "./spin";

type VideoUploaderProps = {
  subtitles?: string[];
  videoFiles: VideoFile[];
  onChange: any;
};
export default function VideoUploader({
  subtitles = [],
  videoFiles,
  onChange,
}: VideoUploaderProps) {
  const { loading, runCommand, writeFile, readFile, deleteFile } = useFFmpeg();

  async function handleFileChange({
    target: { files },
  }: ChangeEvent<HTMLInputElement>) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i] as VideoFile;

      const { width, height, duration } = await getVideoMetadata(file);
      const d = Number(duration.toFixed());
      file.width = width;
      file.height = height;
      file.duration = d;

      await writeFile(file.name, file);
      await runCommand(
        "-i",
        file.name,
        "-y",
        "-f",
        "image2",
        "-frames",
        "1",
        "preview.jpg"
      );
      const data = await readFile("preview.jpg");
      file.previewUrl = URL.createObjectURL(new Blob([data.buffer]));
      deleteFile("preview.jpg");
      deleteFile(file.name);
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
        <Uploader loading={loading} onUpload={handleFileChange as any} />
      </Stack>
    </Box>
  );
}

function Preview({ file, subtitles, onDelete }: any) {
  return (
    <Tooltip
      title={`${file.name} ${TimeFormat.fromS(file.duration, "hh:mm:ss")}`}
      placement="top"
    >
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
            className="invisible group-hover:visible !absolute z-10 top-0 right-0 
                        translate-x-1/2 -translate-y-1/2 bg-red-400 text-white"
            onClick={onDelete}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </div>
    </Tooltip>
  );
}

function Uploader({ loading, onUpload }: any) {
  const inputRef = useRef<HTMLInputElement>();
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onUpload(e);
    e.target.value = "";
  }

  return (
    <Spin spinning={loading}>
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
          onChange={handleChange}
          multiple
          accept="video/*"
        />
      </div>
    </Spin>
  );
}
