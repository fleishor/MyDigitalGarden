---
date: 2024-11-20
title: Linux Kommandos zur Audio/Video Verwaltung
image: LinuxCommandLine.png
description: 
tags: 
- Linux
---

## Extract MP3 from video (MP4)

~~~bash
ffmpeg -i myvideo.mp4 -codec:a libmp3lame -q:a QUALITY audio.mp3
~~~

Specify the QUALITY in the 0-9 range, where 0 is best, 9 is worst, and 4 is the default value. A table presenting each FFmpeg VBR option is available [here](https://trac.ffmpeg.org/wiki/Encode/MP3) .

[FFmpeg: Extract Audio From Video In Original Format Or Converting It To MP3 Or Ogg Vorbis](https://www.linuxuprising.com/2019/11/ffmpeg-extract-audio-from-video-in.html)
