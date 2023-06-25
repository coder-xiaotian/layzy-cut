"use client";
import { createFFmpeg, FFmpeg } from "@ffmpeg/ffmpeg";
import { createTheme, ThemeProvider } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { createContext, useEffect, useMemo, useState } from "react";

const theme = createTheme({
  components: {
    // Name of the component
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },
    MuiTooltip: {
      defaultProps: {
        placement: "top",
      },
    },
  },
});

export const FFmpegContext = getContext(useFFmpeg);
function useFFmpeg() {
  const [ffmpeg, setFFmpeg] = useState<FFmpeg>(null);
  useEffect(() => {
    const f = createFFmpeg({
      log: true,
      corePath: `${location.protocol}${location.host}/ffmpeg-core.js`,
    });
    f.load().then(() => {
      setFFmpeg(f);
    });
  }, []);
  const ffmpegValues = useMemo(
    () => ({
      loading: !ffmpeg,
      ffmpeg,
    }),
    [ffmpeg]
  );

  return ffmpegValues;
}
export default function Providers({ children }: any) {
  const ffmpegValues = useFFmpeg();
  return (
    <FFmpegContext.Provider value={ffmpegValues}>
      <SnackbarProvider maxSnack={3}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </SnackbarProvider>
    </FFmpegContext.Provider>
  );
}

export function getContext<T>(
  func: (...args: any[]) => T,
  initialValue: T | undefined = undefined
) {
  return createContext(initialValue as T);
}
