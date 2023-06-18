'use client'
import { createTheme, ThemeProvider } from '@mui/material';

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
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  )
}