"use client";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { SnackbarProvider } from "notistack";
import { createContext } from "react";

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
        animation: "wave",
      },
    },
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
