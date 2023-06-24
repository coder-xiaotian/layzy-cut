"use client";
import { getVideoMetadata } from "@/utils/video";
import { fetchFile } from "@ffmpeg/ffmpeg";
import AttachEmailIcon from "@mui/icons-material/AttachEmail";
import CloseIcon from "@mui/icons-material/Close";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton, InputAdornment,
  LinearProgress, SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  TextField,
  Tooltip
} from "@mui/material";
import { saveAs } from "file-saver";
import { useSnackbar } from "notistack";
import { ChangeEvent, useContext, useRef, useState } from "react";
import { FFmpegContext } from "../template";
import { CutTime } from "./components";
import TimeFormat from "hh-mm-ss"

export default function TikTok() {
  const { loading, ffmpeg } = useContext(FFmpegContext);
  const { enqueueSnackbar } = useSnackbar();

  const [cutTimes, setCutTimes] = useState([0, 10]);
  const [firstVideoSecond, setFiestVideoSecond] = useState(0);
  const [subtitles, setSubtitles] = useState([]);
  const audioRef = useRef<File>(null);
  const [videoFiles, setVideoFiles] = useState<
    Array<(File & { previewUrl: string; width: number; height: number }) | null>
  >([null]);
  const isUploadedVideo = videoFiles.filter(Boolean).length > 0
  async function handleFileChange({
    target: { files },
  }: ChangeEvent<HTMLInputElement>) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i] as any;

      getVideoMetadata(file).then(({ width, height, duration }) => {
        duration = Number(duration.toFixed())
        file.width = width;
        file.height = height;
        file.duration = duration;
        if (i !== 0) return;

        setFiestVideoSecond(duration);
      });

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
${TimeFormat.fromS(cutTimes[0], "hh:mm:ss")},000 --> ${TimeFormat.fromS(cutTimes[1], "hh:mm:ss")},000
${subtitles.join("\n")}`;
        ffmpeg.FS("writeFile", "sub.srt", await fetchFile(Buffer.from(srt)));
        filters.push(
          `subtitles=sub.srt:fontsdir=/tmp:force_style='Fontname=也字工厂川秋沙行楷 标准,Alignment=6,FontSize=16,OutlineColour=&H82008fff,BorderStyle=3,WrapStyle=2'`
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
          String(cutTimes[0]),
          "-to",
          String(cutTimes[1]),
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

    ffmpeg.setProgress(() => {});
    setProgressValue(null);
    enqueueSnackbar("生成短视频成功！", { variant: "success" });
  }

  function handleContact() {
    const a = document.createElement("a");
    a.style.display = "none";
    document.body.appendChild(a);
    a.href = "mailto:wanxiaotian888@gmail.com";
    a.click();
    a.parentNode.removeChild(a);
  }

  return (
    <Container maxWidth="sm">
      {loading ? (
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
                  <VideoPreview
                    key={i}
                    file={file}
                    subtitles={subtitles}
                    onDelete={() => {
                      videoFiles.splice(i, 1);
                      setVideoFiles([...videoFiles]);
                    }}
                  />
                ) : (
                  <VideoUploader key={i} onUpload={handleFileChange as any} />
                )
              )}
            </Stack>
          </Box>
          <Stack className="mt-2">
            <Box>
              <span>剪辑</span>
              <CutTime
                disabled={!isUploadedVideo}
                max={firstVideoSecond}
                value={cutTimes}
                onChange={setCutTimes}
              />
            </Box>
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
          <Button disabled={!isUploadedVideo} onClick={handleGenerate} variant="contained">
            生成短视频
          </Button>
          <SpeedDial
            className="fixed right-4 bottom-4"
            icon={<SpeedDialIcon />}
            ariaLabel=""
          >
            <SpeedDialAction
              icon={<AttachEmailIcon />}
              tooltipTitle="联系我"
              onClick={handleContact}
            />
          </SpeedDial>
        </>
      )}
    </Container>
  );
}

function VideoPreview({ file, subtitles, onDelete }: any) {
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

function VideoUploader({ onUpload }: any) {
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
