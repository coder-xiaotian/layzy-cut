'use client'
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { createTheme, ThemeProvider } from '@mui/material';
import {SnackbarProvider} from "notistack"
import { createContext } from 'react';

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
        placement: "top"
      }
    }
  },
});

export default function Providers({children}: any) {
  return (
    <SnackbarProvider maxSnack={3}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </SnackbarProvider>
  )
}

export function getContext<T>(
  func: (...args: any[]) => T,
  initialValue: T | undefined = undefined,
) {
  return createContext(initialValue as T);
}