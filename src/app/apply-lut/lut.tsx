 
import React, { useState } from 'react';

function App() {
  const [video, setVideo] = useState(null);
  const [lut, setLut] = useState(null);
  const [appliedLut, setAppliedLut] = useState(null);

  const handleVideoUpload = (event) => {
    setVideo(event.target.files[0]);
  };

  const handleLutUpload = (event) => {
    setLut(event.target.files[0]);
  };

  const handleApplyLut = () => {
    if (!video || !lut) {
      alert("Please upload both a video and a LUT.");
      return;
    }
    const videoUrl = URL.createObjectURL(video);
    const lutUrl = URL.createObjectURL(lut);
    const videoElement = document.createElement("video");
    videoElement.src = videoUrl;
    videoElement.crossOrigin = "anonymous";
    const lutImage = new Image();
    lutImage.src = lutUrl;
    lutImage.crossOrigin = "anonymous";
    lutImage.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const lutCanvas = document.createElement("canvas");
      lutCanvas.width = lutImage.width;
      lutCanvas.height = lutImage.height;
      const lutContext = lutCanvas.getContext("2d");
      lutContext.drawImage(lutImage, 0, 0, lutCanvas.width, lutCanvas.height);
      const lutData = lutContext.getImageData(0, 0, lutCanvas.width, lutCanvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const lutIndex = (r + g + b) / 3;
        const lutR = lutData.data[lutIndex * 4];
        const lutG = lutData.data[lutIndex * 4 + 1];
        const lutB = lutData.data[lutIndex * 4 + 2];
        imageData.data[i] = lutR;
        imageData.data[i + 1] = lutG;
        imageData.data[i + 2] = lutB;
      }
      context.putImageData(imageData, 0, 0);
      const outputUrl = canvas.toDataURL();
      setAppliedLut(outputUrl);
    };
  };

  const handleExport = () => {
    if (!appliedLut) {
      alert("Please apply a LUT before exporting.");
      return;
    }
    const link = document.createElement("a");
    link.href = appliedLut;
    link.download = "output.mp4";
    link.click();
  };


  return (
    <div>
      <h1>Video LUT Processor</h1>
      <div>
        <label htmlFor="video-upload">Upload Video:</label>
        <input type="file" id="video-upload" onChange={handleVideoUpload} />
      </div>
      <div>
        <label htmlFor="lut-upload">Upload LUT:</label>
        <input type="file" id="lut-upload" onChange={handleLutUpload} />
      </div>
      <button onClick={handleApplyLut}>Apply LUT</button>
      <button onClick={handleExport}>Export</button>
    </div>
  );
}

export default App;

