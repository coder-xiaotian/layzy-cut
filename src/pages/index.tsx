import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { getVideoMetadata } from "@/utils/video";
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { ChangeEvent, useRef, useState } from "react";
import { saveAs } from "file-saver";

let ffmpeg: any;
(async () => {
  ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();
})();
export default function Home() {
  const [subtitles, setSubtitles] = useState([]);
  const audioRef = useRef<File>(null);
  const [videoFiles, setVideoFiles] = useState<
    Array<(File & { previewUrl: string }) | null>
  >([null]);
  async function handleFileChange(
    { target: { files } }: ChangeEvent<HTMLInputElement>,
    i: number
  ) {
    for (let file of Array.from(files)) {
      const { name } = file;
      console.log("%c name: ", "color: red", name);
      ffmpeg.FS("writeFile", name, await fetchFile(file));
      await ffmpeg.run(
        "-i",
        name,
        "-y",
        "-f",
        "image2",
        "-frames",
        "1",
        "preview.jpg"
      );
      const data = ffmpeg.FS("readFile", "preview.jpg");
      // @ts-ignore
      file.previewUrl = URL.createObjectURL(new Blob([data.buffer]));
      ffmpeg.FS("unlink", "preview.jpg");
      videoFiles.unshift(file as any);
    }
    setVideoFiles([...videoFiles]);
  }

  const [progressValue, setProgressValue] = useState(null);
  async function handleGenerate() {
    setProgressValue(0);
    // 写入字体文件
    ffmpeg.FS(
      "writeFile",
      `tmp/fonts`,
      await fetchFile(`/YeZiGongChangChuanQiuShaXingKai-2.ttf`)
    );

    const files = videoFiles.filter(Boolean);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const { width, height } = await getVideoMetadata(file);
      const outputWidth = width;
      const outputHeight = Math.round(width / (9 / 16));
      const y = Math.round(outputHeight / 2 - height / 2);
      const filters = [];
      filters.push(`pad=${outputWidth}:${outputHeight}:0:${y}:black`);
      if (subtitles.length) {
        const srt = `1
00:00:00,000 --> 00:00:10,000
${subtitles.join("\n")}`;
        ffmpeg.FS("writeFile", "sub.srt", await fetchFile(Buffer.from(srt)));
        filters.push(
          `subtitles=sub.srt:fontsdir=/tmp:force_style='Fontname=也字工厂川秋沙行楷 标准,Alignment=6,FontSize=16,OutlineColour=&H008fff,BorderStyle=3,WrapStyle=2'`
        );
      }
      const { name } = file;
      const cmd = ["-i", name];
      if (audioRef.current) {
        ffmpeg.FS(
          "writeFile",
          audioRef.current.name,
          await fetchFile(audioRef.current)
        );
        cmd.push(
          ...["-i", audioRef.current.name, "-map", "0:v", "-map", "1:a"]
        );
      }
      cmd.push(
        ...[
          "-vf",
          filters.join(","),
          "-ss",
          "0",
          "-to",
          "10",
          "-preset",
          "ultrafast",
          "-af",
          "volume=2.0",
          "output.mp4",
        ]
      );
      ffmpeg.setProgress((p: any) => {
        setProgressValue(p.ratio * (i + 1));
      });
      await ffmpeg.run(...cmd);
      const data = ffmpeg.FS("readFile", "output.mp4");
      saveAs(
        new Blob([data.buffer], { type: "video/mp4" }),
        `output${i + 1}.mp4`
      );
      ffmpeg.FS("unlink", "output.mp4");
    }

    setProgressValue(null);
  }

  return (
    <Container maxWidth="sm">
      <Box overflow={"auto"}>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          display="inline-flex"
        >
          {videoFiles.map((file, i) =>
            file ? (
              <Tooltip key={i} title={file.name} placement="top">
                <div className="relative shrink-0 flex flex-col w-[300px] h-[533px] bg-black">
                  <div className="relative z-10 flex flex-col items-center mt-2 text-[28px]">
                    {subtitles &&
                      subtitles.map((str, i) => (
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
                </div>
              </Tooltip>
            ) : (
              <VideoUploader key={i} onUpload={handleFileChange as any} />
            )
          )}
        </Stack>
      </Box>
      <Box>
        <TextField
          focused
          margin="dense"
          label="音频"
          type="file"
          onChange={(e: any) => (audioRef.current = e.target.files[0])}
        />
        <TextField
          focused
          margin="dense"
          multiline
          rows={4}
          label="字幕"
          value={subtitles.join("\n")}
          onChange={(e) => setSubtitles(e.target.value.split("\n"))}
        />
      </Box>
      <Button onClick={handleGenerate} variant="contained">
        生成短视频
      </Button>
      {progressValue !== null && (
        <LinearProgress color="success" value={progressValue} />
      )}
    </Container>
  );
}

function VideoUploader({ onUpload }: any) {
  const inputRef = useRef<HTMLInputElement>();
  return (
    <div
      onClick={() => inputRef.current.click()}
      className="cursor-pointer shrink-0 flex flex-col justify-center items-center w-[300px] h-[533px] bg-slate-100"
    >
      <FileUploadIcon className="text-slate-300" />
      <span className="text-slate-500">上传视频</span>
      <input
        ref={inputRef}
        className="invisible"
        type="file"
        onChange={onUpload}
        multiple
      />
    </div>
  );
}
