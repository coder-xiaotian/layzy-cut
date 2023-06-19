export function getVideoMetadata(videoFile: File) {
  const p = new Promise<{width: number, height: number}>((resolve) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);
    video.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(video.src)
      console.log(`Video width: ${video.videoWidth}px`);
      console.log(`Video height: ${video.videoHeight}px`);
      resolve({width: video.videoWidth, height: video.videoHeight})
    });
  })

  return p
}