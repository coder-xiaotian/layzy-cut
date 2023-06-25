"use client";
import AdbIcon from "@mui/icons-material/Adb";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Menu,
  MenuItem,
  SpeedDial,
  SpeedDialAction,
  Toolbar,
  Typography,
  SpeedDialIcon,
} from "@mui/material";
import AttachEmailIcon from "@mui/icons-material/AttachEmail";
import classNames from "classnames";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import Image from "next/image";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { useContext } from "react";
import { FFmpegContext } from "./providers";

export default function Template({ children }: any) {
  const router = useRouter();
  const selectedSegment = useSelectedLayoutSegment();
  const pages = [
    { name: "tiktok", label: "剪辑短视频" },
    { name: "apply-lut", label: "LUT调色" },
  ];
  const { loading } = useContext(FFmpegContext);

  function handleContact() {
    const a = document.createElement("a");
    a.style.display = "none";
    document.body.appendChild(a);
    a.href = "mailto:wanxiaotian888@gmail.com";
    a.click();
    a.parentNode.removeChild(a);
  }

  return (
    <div>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Image src="/logo.png" alt="logo" width="40" height="40" />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mx: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              LazyCut
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <PopupState variant="popover">
                {(popupState) => (
                  <>
                    <IconButton size="large" {...bindTrigger(popupState)}>
                      <MenuIcon />
                    </IconButton>
                    <Menu
                      {...bindMenu(popupState)}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                      }}
                      sx={{
                        display: { xs: "block", md: "none" },
                      }}
                    >
                      {pages.map((page) => (
                        <MenuItem
                          key={page.name}
                          className={classNames({
                            "!bg-slate-300": page.name === selectedSegment,
                          })}
                          onClick={() => router.push(`/${page.name}`)}
                        >
                          <Typography textAlign="center">
                            {page.label}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Menu>
                  </>
                )}
              </PopupState>
            </Box>
            <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href=""
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              LOGO
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {pages.map((page) => (
                <Button
                  key={page.name}
                  className={classNames("text-white", {
                    "!bg-blue-400": page.name === selectedSegment,
                  })}
                  onClick={() => router.push(`/${page.name}`)}
                >
                  {page.label}
                </Button>
              ))}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      {loading ? (
        <div className="text-center">
          <CircularProgress />
        </div>
      ) : children}
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
    </div>
  );
}
