#!/bin/bash

# Assign input arguments to variables
while getopts ":i:o:t:a:c:" opt; do
  case $opt in
    i) input_video_path="$OPTARG"
    ;;
    o) output_path="$OPTARG"
    ;;
    t) text+=("$OPTARG")
    ;;
    a) audio_path="$OPTARG"
    ;;
    c) clip_duration="$OPTARG"
    ;;
    \?) echo "Invalid option -$OPTARG" >&2
    ;;
  esac
done

# Check if input video file exists
if [ -z "$input_video_path" ]; then
    echo "Input video file is required"
    exit 1
elif [ ! -f "$input_video_path" ]; then
    echo "Input video file does not exist"
    exit 1
fi

# Check if output path is provided
if [ -z "$output_path" ]; then
    echo "Output path is required"
    exit 1
fi

# Check if audio file exists
if [ ! -z "$audio_path" ] && [ ! -f "$audio_path" ]; then
    echo "Audio file does not exist"
    exit 1
fi

if [[ $clip_duration == *":"* ]]; then
    clip_start=$(echo "$clip_duration" | cut -d ':' -f 1)
    clip_end=$(echo "$clip_duration" | cut -d ':' -f 2)
    clip_duration=$(echo "$clip_end - $clip_start" | bc)
else
    clip_start=0
    clip_end=$clip_duration
fi
# Create SRT file with same duration as video
echo "1" > sub.srt
if [ -z "$clip_duration" ]; then
    # Get video duration
    duration=$(ffprobe -i "$input_video_path" -show_entries format=duration -v quiet -of csv="p=0")
    echo "00:00:00,000 --> 00:00:$duration,000" >> sub.srt
else
    echo "00:00:$clip_start,000 --> 00:00:$clip_end,000" >> sub.srt
fi
for t in "${text[@]}"
do
    echo "$t" >> sub.srt
done

text="subtitles=sub.srt:force_style='Alignment=6,FontSize=16,OutlineColour=&H008fff,BorderStyle=3'"

# Get input video width and height
width=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=s=x:p=0 "$input_video_path")
height=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=s=x:p=0 "$input_video_path")
# Calculate output video width and height
output_width=$width
output_height=$(echo "scale=2;$width / (9/16)"|bc)
y=$(echo "scale=2;$output_height / 2 - ($height / 2)"|bc)
echo "output width: $output_width, output_height: $output_height"
# Create padding filter
padding_filter="pad=$output_width:$output_height:0:$y:black"
# Use ffmpeg to add the text overlay and padding to the input video
if [ -z "$audio_path" ]; then
    if [ -z "$clip_duration" ]; then
        ffmpeg -i "$input_video_path" -vf "$padding_filter,$text" -preset ultrafast -af "volume=2.0" "$output_path"
    else
        ffmpeg -i "$input_video_path" -vf "$padding_filter,$text" -ss "$clip_start" -to "$clip_end" -preset ultrafast -af "volume=2.0" "$output_path"
    fi
else
    if [ -z "$clip_duration" ]; then
        ffmpeg -i "$input_video_path" -i "$audio_path" -map 0:v -map 1:a -vf "$padding_filter,$text" -preset ultrafast -af "volume=2.0" "$output_path"
    else
        ffmpeg -i "$input_video_path" -i "$audio_path" -map 0:v -map 1:a -vf "$padding_filter,$text" -ss "$clip_start" -to "$clip_end" -preset ultrafast -af "volume=2.0" "$output_path"
    fi
fi

rm sub.srt
echo "Video editing complete"


