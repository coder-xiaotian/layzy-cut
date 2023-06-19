"use client";
import { createFFmpeg, fetchFile, FFmpeg } from "@ffmpeg/ffmpeg";
import { getVideoMetadata } from "@/utils/video";
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Tooltip,
  LinearProgress,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import CloseIcon from "@mui/icons-material/Close";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";

export default function Home() {
  const [cutSeconds, setCutSeconds] = useState(10)
  const [subtitles, setSubtitles] = useState([]);
  const audioRef = useRef<File>(null);
  const [loadingFFmpeg, setLoadingFFmpeg] = useState(true);
  const [videoFiles, setVideoFiles] = useState<
    Array<(File & { previewUrl: string }) | null>
  >([null]);
  const ffmpegRef = useRef<FFmpeg>();
  useEffect(() => {
    ffmpegRef.current = createFFmpeg({
      log: true,
      corePath: `${location.protocol}${location.host}/ffmpeg-core.js`,
    });
    ffmpegRef.current.load().then(() => {
      setLoadingFFmpeg(false);
    });
  }, []);
  async function handleFileChange(
    { target: { files } }: ChangeEvent<HTMLInputElement>,
    i: number
  ) {
    for (let file of Array.from(files)) {
      const { name } = file;
      console.log("%c name: ", "color: red", name);
      ffmpegRef.current.FS("writeFile", name, await fetchFile(file));
      await ffmpegRef.current.run(
        "-i",
        name,
        "-y",
        "-f",
        "image2",
        "-frames",
        "1",
        "preview.jpg"
      );
      const data = ffmpegRef.current.FS("readFile", "preview.jpg");
      // @ts-ignore
      file.previewUrl = URL.createObjectURL(new Blob([data.buffer]));
      ffmpegRef.current.FS("unlink", "preview.jpg");
      videoFiles.unshift(file as any);
    }
    setVideoFiles([...videoFiles]);
  }

  const [progressValue, setProgressValue] = useState(null);
  async function handleGenerate() {
    setProgressValue(0);
    // 写入字体文件
    ffmpegRef.current.FS(
      "writeFile",
      `tmp/fonts`,
      await fetchFile(
        `${location.protocol}${location.host}/YeZiGongChangChuanQiuShaXingKai-2.ttf`
      )
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
00:00:00,000 --> 00:00:${cutSeconds},000
${subtitles.join("\n")}`;
        ffmpegRef.current.FS(
          "writeFile",
          "sub.srt",
          await fetchFile(Buffer.from(srt))
        );
        filters.push(
          `subtitles=sub.srt:fontsdir=/tmp:force_style='Fontname=也字工厂川秋沙行楷 标准,Alignment=6,FontSize=16,OutlineColour=&H008fff,BorderStyle=3,WrapStyle=2'`
        );
      }
      const { name } = file;
      const cmd = ["-i", name];
      if (audioRef.current) {
        ffmpegRef.current.FS(
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
          String(cutSeconds),
          "-preset",
          "ultrafast",
          "-af",
          "volume=2.0",
          "output.mp4",
        ]
      );
      ffmpegRef.current.setProgress((p: any) => {
        setProgressValue(p.ratio * (i + 1));
      });
      await ffmpegRef.current.run(...cmd);
      const data = ffmpegRef.current.FS("readFile", "output.mp4");
      saveAs(
        new Blob([data.buffer], { type: "video/mp4" }),
        `output${i + 1}.mp4`
      );
      ffmpegRef.current.FS("unlink", "output.mp4");
    }

    setProgressValue(null);
  }

  return (
    <Container maxWidth="sm">
      {loadingFFmpeg ? (
        <div className="text-center">
          <CircularProgress />
        </div>
      ) : (
        <>
          <Box overflow={"auto"} className="pt-3">
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              display="inline-flex"
            >
              {videoFiles.map((file, i) =>
                file ? (
                  <Tooltip key={i} title={file.name} placement="top">
                    <div className="group relative shrink-0 flex flex-col w-[300px] h-[533px] bg-black border-2 hover:border-green-500">
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
                      <Tooltip title="删除">
                        <IconButton
                          size="small"
                          className="invisible group-hover:visible absolute z-20 top-0 right-0 
                        translate-x-1/2 -translate-y-1/2"
                          color="error"
                          onClick={() => {
                            videoFiles.splice(i, 1)
                            setVideoFiles([...videoFiles])
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </Tooltip>
                ) : (
                  <VideoUploader key={i} onUpload={handleFileChange as any} />
                )
              )}
            </Stack>
          </Box>
          <Stack className="mt-2">
            <TextField
              value={cutSeconds}
              type="number"
              onChange={e => setCutSeconds(Number(e.target.value))}
              label="剪辑前"
              focused
              InputProps={{
                endAdornment: <InputAdornment position="start">秒</InputAdornment>,
              }}
            />
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
          </Stack>
          {progressValue !== null && (
            <LinearProgress color="success" value={progressValue} />
          )}
          <Button onClick={handleGenerate} variant="contained">
            生成短视频
          </Button>
        </>
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
