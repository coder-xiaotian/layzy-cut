import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "懒人剪辑视频 - 快速剪辑工具",
  applicationName: "LazyCut",
  description:
    "懒人剪辑视频是一个高效的在线工具，让你能够快速剪辑和编辑视频。节省时间，轻松实现你的视频编辑需求！",
  viewport: {
    initialScale: 1,
    width: "device-width",
  },
  keywords: [
    "ffmpeg",
    "douyin",
    "tiktok",
    "video cut",
    "next.js",
    "react",
    "剪辑",
    "快速剪辑",
    "LUT",
    "auto LUT",
    "批量 LUT",
    "batch LUT",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
