'use client'
import { createTheme, ThemeProvider } from '@mui/material';
import {SnackbarProvider} from "notistack"

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