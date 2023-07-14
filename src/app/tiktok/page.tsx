"use client";
import VideoUploader from "@/components/video-uploader";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import { getVideoMetadata } from "@/utils/video";
import {
  Box,
  Button,
  Container,
  LinearProgress,
  Stack,
  TextField,
} from "@mui/material";
import { saveAs } from "file-saver";
import TimeFormat from "hh-mm-ss";
import { useSnackbar } from "notistack";
import { useRef, useState } from "react";
import { CutTime } from "./components";
import { VideoFile } from "./types";

export default function TikTok() {
  const { runCommand, readFile, writeFile, deleteFile, setProgress } =
    useFFmpeg();
  const { enqueueSnackbar } = useSnackbar();

  const [cutTimes, setCutTimes] = useState([0, 10]);
  const [subtitles, setSubtitles] = useState([]);
  const audioRef = useRef<File>(null);
  const [videoFiles, setVideoFiles] = useState<Array<VideoFile>>([]);
  const firstVideoFile = videoFiles?.[0];

  const [progressValue, setProgressValue] = useState(null);
  async function handleGenerate() {
    setProgressValue(0);
    // 写入字体文件
    await writeFile(
      `tmp/fonts`,
      `${location.protocol}${location.host}/YeZiGongChangChuanQiuShaXingKai-2.ttf`
    );

    let subtitleFilters: string[] = [];
    if (subtitles.length) {
      const srt = `1
${TimeFormat.fromS(cutTimes[0], "hh:mm:ss")},000 --> ${TimeFormat.fromS(
        cutTimes[1],
        "hh:mm:ss"
      )},000
${subtitles.join("\n")}`;
      await writeFile("sub.srt", Buffer.from(srt));
      subtitleFilters = [
        `subtitles=sub.srt:fontsdir=/tmp:force_style='Fontname=也字工厂川秋沙行楷 标准,Alignment=6,FontSize=16,OutlineColour=&H82008fff,BorderStyle=3,WrapStyle=2'`,
      ];
    }
    const files = videoFiles.filter(Boolean);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const { width, height } = await getVideoMetadata(file);
      const outputWidth = width;
      const outputHeight = Math.round(width / (9 / 16));
      const y = Math.round(outputHeight / 2 - height / 2);
      const filters = [];
      filters.push(`pad=${outputWidth}:${outputHeight}:0:${y}:black`);
      filters.push(...subtitleFilters);

      await writeFile(file.name, file);
      const cmd = ["-i", file.name];
      if (audioRef.current) {
        await writeFile(audioRef.current.name, audioRef.current);
        cmd.push(
          ...["-i", audioRef.current.name, "-map", "0:v", "-map", "1:a"]
        );
      }
      const outputFile = `output_${file.name}`;
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
          "-c:v",
          "libx264",
          outputFile,
        ]
      );
      await setProgress((p: any) => {
        setProgressValue(p.ratio * (i + 1));
      });
      await runCommand(...cmd);
      const data = await readFile(outputFile);
      saveAs(
        new Blob([data.buffer], { type: "video/*" }),
        `output_${file.name}`
      );
      deleteFile(outputFile);
      deleteFile(file.name);
    }

    subtitles.length && deleteFile("sub.srt");
    audioRef.current && deleteFile(audioRef.current.name);
    setProgressValue(null);
    enqueueSnackbar("生成短视频成功！", { variant: "success" });
  }

  return (
    <Container maxWidth="sm">
      <VideoUploader
        subtitles={subtitles}
        videoFiles={videoFiles}
        onChange={setVideoFiles}
      />
      <Stack className="mt-2">
        <Box>
          <span>剪辑</span>
          <CutTime
            disabled={!firstVideoFile}
            max={firstVideoFile?.duration}
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
        {progressValue !== null && (
          <LinearProgress color="success" value={progressValue} />
        )}
        <Button
          disabled={!firstVideoFile}
          onClick={handleGenerate}
          variant="contained"
        >
          生成短视频
        </Button>
      </Stack>
    </Container>
  );
}
