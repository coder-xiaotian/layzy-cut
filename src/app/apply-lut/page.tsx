"use client";
import VideoUploader from "@/components/video-uploader";
import { fetchFile } from "@ffmpeg/ffmpeg";
import {
  Button,
  Container,
  LinearProgress,
  Stack,
  TextField
} from "@mui/material";
import { saveAs } from "file-saver";
import { useSnackbar } from "notistack";
import { ChangeEvent, useContext, useState } from "react";
import { FFmpegContext } from "../providers";

export default function ApplyLUT() {
  const { enqueueSnackbar } = useSnackbar();
  const { ffmpeg } = useContext(FFmpegContext);
  const [videoFiles, setVideoFiles] = useState([]);
  const [lutFile, setLUTFile] = useState<File>();
  const [currentExportProcess, setCurrentExportProcess] = useState<number>(null);
  const [currentExportName, setCurrentExportName] = useState("")
  async function handleExport() {
    ffmpeg.setProgress(({ ratio }: any) => {
      setCurrentExportProcess(Number((ratio * 100).toFixed()));
    });

    for (let i = 0; i < videoFiles.length; i++) {
      const file = videoFiles[i];
      setCurrentExportName(file.name)
      ffmpeg.FS("writeFile", file.name, await fetchFile(file));
      ffmpeg.FS("writeFile", `lut.cube`, await fetchFile(lutFile));
      const outputFile = `output_${file.name}`;
      await ffmpeg.run(
        "-i",
        file.name,
        "-vf",
        `lut3d=lut.cube,format=yuv420p`,
        "-c:a",
        "copy",
        "-preset",
        "ultrafast",
        outputFile
      );
      // ffmpeg -i DJI_0991.MOV -vf lut3d="DJI Mavic 3 D-Log to Rec.709 vivid V1.cube",format=yuv420p -c:a copy -c:v libx264 -preset slow -crf 18  output.MOV
      const data = ffmpeg.FS("readFile", outputFile);
      saveAs(new Blob([data.buffer], { type: "video/*" }), outputFile);
      enqueueSnackbar(`${file.name}导出完成！`, {variant: "success"});
      setCurrentExportProcess(null);
    }
  }

  return (
    <Container maxWidth="sm">
      <Stack className="mt-2">
        <VideoUploader videoFiles={videoFiles} onChange={setVideoFiles} />
        <TextField
          className="mt-2"
          label="LUT文件"
          focused
          type="file"
          value={lutFile ? `C:\\fakepath\\${lutFile.name}` : ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setLUTFile(e.target.files[0])
          }
          inputProps={{ accept: ".3dl,.cube,.dat,.m3d,.csp" }}
          InputProps={{ disabled: !videoFiles.length }}
        />
        {currentExportProcess && (
          <div className="flex justify-between items-center">
            <LinearProgress
              className="grow"
              color="success"
              variant="determinate"
              value={currentExportProcess}
            />
            <span>
              {currentExportName} {currentExportProcess}%
            </span>
          </div>
        )}
        <Button
          disabled={!videoFiles.length || !lutFile}
          className="mt-2"
          variant="contained"
          onClick={handleExport}
        >
          导出
        </Button>
      </Stack>
    </Container>
  );
}
