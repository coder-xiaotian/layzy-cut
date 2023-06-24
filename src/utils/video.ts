export function getVideoMetadata(videoFile: File) {
  const p = new Promise<{width: number, height: number, duration: number}>((resolve) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);
    video.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(video.src)
      resolve({width: video.videoWidth, height: video.videoHeight, duration: video.duration})
    });
  })

  return p
}