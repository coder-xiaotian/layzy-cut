import {ffmpeg, fetchFile} from "@/utils/ffmpeg"
import { getVideoMetadata } from "@/utils/video";
import { useRef, useState } from "react";

export default function Home() {
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [subtitles, setSubtitles] = useState([])
  const fileRef = useRef<File>(null)
  const audioRef = useRef<File>(null)
  async function handleFileChange({ target: { files } }: any) {
    fileRef.current = files[0] as File
    const { name } = fileRef.current;
    ffmpeg.FS('writeFile', name, await fetchFile(fileRef.current));
    await ffmpeg.run('-i', name, '-y', '-f', 'image2', '-frames', '1', 'preview.jpg');
    const data = ffmpeg.FS('readFile', 'preview.jpg');
    setPreviewUrl(URL.createObjectURL(new Blob([data.buffer])))
    ffmpeg.FS('unlink', 'preview.jpg')
  }
  async function handleGenerate() {
    const {width, height} = await getVideoMetadata(fileRef.current)
    const outputWidth = width
    const outputHeight = Math.round(width / (9 / 16))
    const y = Math.round(outputHeight / 2 - (height / 2))
    const filters = []
    filters.push(`pad=${outputWidth}:${outputHeight}:0:${y}:black`)
    if (subtitles.length) {
      const srt = `1
00:00:00,000 --> 00:00:10,000
${subtitles.join('\n')}`
      console.log(srt)
      ffmpeg.FS("writeFile", "sub.srt", await fetchFile(Buffer.from(srt)))
      ffmpeg.FS('writeFile', `tmp/Microso`, await fetchFile("http://localhost:3000/Microsoft Sans Serif.ttf")); 
      filters.push(`subtitles=sub.srt:fontsdir=/tmp:force_style='Fontname=Microsoft Sans Serif,Alignment=6,FontSize=16,OutlineColour=&H008fff,BorderStyle=3,BoxBorderRadius=25,WrapStyle=2'`)
    }
    const {name} = fileRef.current
    const cmd = ['-i', name]
    if (audioRef.current) {
      // ffmpeg -i "$input_video_path" -i "$audio_path" -map 0:v -map 1:a -vf "$padding_filter,$text" -preset ultrafast -af "volume=2.0" "$output_path"
      ffmpeg.FS("writeFile", audioRef.current.name, await fetchFile(audioRef.current))
      cmd.push(...['-i', audioRef.current.name, '-map', '0:v', '-map', '1:a'])
    }
    cmd.push(...['-vf', filters.join(','), '-ss', '0', '-to', '10', '-preset', 'ultrafast', '-af', 'volume=2.0', 'output.mp4'])
    await ffmpeg.run(...cmd);
    const data = ffmpeg.FS('readFile', 'output.mp4');
    window.open(URL.createObjectURL(new Blob([data.buffer], {type: 'video/mp4'})), '_blank')
  }

  return (
    <div className="flex flex-col items-center h-full">
      <div>
        <span>上传视频：</span>
        <input type="file" onChange={handleFileChange}/>
      </div>
      <div>
        <span>音频：</span>
        <input type="file" onChange={e => audioRef.current = e.target.files[0]}/>
      </div>
      <div>
        <span>字幕：</span>
        <textarea className="border border-slate-500" 
          value={subtitles.join('\n')} 
          onChange={e => setSubtitles(e.target.value.split('\n'))}></textarea>
      </div>
      {previewUrl && (
        <div>
          <span>预览：</span>
          <div className="relative flex flex-col w-[300px] h-[533px] bg-black">
            <div className="flex flex-col items-center mt-2 text-[28px]">
              {subtitles && subtitles.map((str, i) => (
                <span key={i} className="bg-[#ef8900] text-white">{str}</span>
              ))}
            </div>
            <img className="absolute top-1/2 -translate-y-1/2" src={previewUrl} alt="preview"/>
            <div></div>
          </div>
        </div>
      )}
      {previewUrl && (
        <button className="mt-2 border border-slate-300 bg-sky-400 hover:bg-sky-300"
          onClick={handleGenerate}
        >生成短视频</button>
      )}
    </div>
  )
}
