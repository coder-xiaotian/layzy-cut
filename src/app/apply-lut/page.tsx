"use client";
import VideoUploader from "@/components/video-uploader";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import {
  Button,
  Container,
  LinearProgress,
  Stack,
  TextField
} from "@mui/material";
import { saveAs } from "file-saver";
import { useSnackbar } from "notistack";
import { ChangeEvent, useState } from "react";

export default function ApplyLUT() {
  const { enqueueSnackbar } = useSnackbar();
  const { runCommand, setProgress, readFile, writeFile, deleteFile } = useFFmpeg();
  const [videoFiles, setVideoFiles] = useState([]);
  const [lutFile, setLUTFile] = useState<File>();
  const [currentExportProcess, setCurrentExportProcess] = useState<number>(null);
  const [currentExportName, setCurrentExportName] = useState("")
  async function handleExport() {
    await setProgress(({ ratio }: any) => {
      setCurrentExportProcess(Number((ratio * 100).toFixed()));
    });

    for (let i = 0; i < videoFiles.length; i++) {
      const file = videoFiles[i];
      setCurrentExportName(file.name)
      await writeFile(file.name, file);
      await writeFile(`lut.cube`, lutFile);
      const outputFile = `output_${file.name}`;
      await runCommand(
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
      const data = await readFile(outputFile);
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
