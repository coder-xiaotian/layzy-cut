import {createFFmpeg, fetchFile} from '@ffmpeg/ffmpeg'

const ffmpeg = createFFmpeg({ log: true, corePath: `http://localhost:3000/ffmpeg-core.js`});
(async () => {
  await ffmpeg.load();
})()

export {ffmpeg, fetchFile}