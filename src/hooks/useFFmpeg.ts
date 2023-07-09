import { VideoFile } from "@/app/tiktok/types";
import {
  FFmpeg,
  ProgressCallback,
  createFFmpeg,
  fetchFile,
} from "@ffmpeg/ffmpeg";
import { useEffect, useRef, useState } from "react";

let ffmpeg: FFmpeg;
export function useFFmpeg() {
  const [loading, setLoading] = useState(false);
  const callbackQueueRef = useRef<((...args: any[]) => any)[]>([]);
  useEffect(() => {
    if (ffmpeg) return;

    const f = createFFmpeg({
      log: true,
      corePath: `${location.protocol}${location.host}/ffmpeg-core.js`,
    });
    f.load().then(async () => {
      ffmpeg = f;
      if (!callbackQueueRef.current.length) return;

      setTimeout(async () => {
        while (callbackQueueRef.current.length) {
          const cb = callbackQueueRef.current.pop();
          await cb();
        }
      });
    });
  }, []);

  return {
    loading,
    runCommand(...args: string[]) {
      if (ffmpeg) {
        return ffmpeg.run(...args);
      }

      return new Promise<void>((resolve) => {
        setLoading(true);
        callbackQueueRef.current.unshift(async () => {
          await ffmpeg.run(...args);
          setLoading(false);
          resolve();
        });
      });
    },
    async readFile(path: string) {
      if (ffmpeg) {
        return ffmpeg.FS("readFile", path);
      }

      return new Promise<Uint8Array>((resolve) => {
        setLoading(true);
        callbackQueueRef.current.unshift(async () => {
          const file = ffmpeg.FS("readFile", path);
          setLoading(false);
          resolve(file);
        });
      });
    },
    async writeFile(path: string, url: string | VideoFile | Buffer | File) {
      if (ffmpeg) {
        return ffmpeg.FS("writeFile", path, await fetchFile(url));
      }

      return new Promise<void>((resolve) => {
        setLoading(true);
        callbackQueueRef.current.unshift(async () => {
          ffmpeg.FS("writeFile", path, await fetchFile(url));
          setLoading(false);
          resolve();
        });
      });
    },
    async deleteFile(path: string) {
      if (ffmpeg) {
        return ffmpeg.FS("unlink", path);
      }

      return new Promise<void>((resolve) => {
        setLoading(true);
        callbackQueueRef.current.unshift(async () => {
          ffmpeg.FS("unlink", path);
          setLoading(false);
          resolve();
        });
      });
    },
    async setProgress(cb: ProgressCallback) {
      if (ffmpeg) {
        return ffmpeg.setProgress(cb);
      }

      return new Promise<void>((resolve) => {
        setLoading(true);
        callbackQueueRef.current.unshift(async () => {
          ffmpeg.setProgress(cb);
          setLoading(false);
          resolve();
        });
      });
    },
  };
}
