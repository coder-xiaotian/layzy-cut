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
    MuiSkeleton: {
      defaultProps: {
        variant: "rounded",
        animation: "wave"
      }
    }
  },
});

export default function Providers({ children }: any) {
  return (
      <SnackbarProvider maxSnack={3}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </SnackbarProvider>
  );
}

export function getContext<T>(
  func: (...args: any[]) => T,
  initialValue: T | undefined = undefined
) {
  return createContext(initialValue as T);
}
