"use client";

import Image from "next/image";

export interface YouTubeContainerProps {
  videoId?: string;
  title?: string;
}

export default function YouTubeContainer({
  videoId = "ixQ289VcOqk",
  title = "YouTube",
}: YouTubeContainerProps) {
  const youtubeUrl = `https://www.youtube.com/channel/UCQqCvopOoJeeUEOC4ZjEOzA`;

  return (
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block w-full max-w-[531px] h-auto mx-auto cursor-pointer transition-transform hover:scale-[1.02]"
      style={{ aspectRatio: '9/16', maxHeight: '650px' }}
    >
      <Image
        src="/assets/cornice_youtubez.svg"
        alt={title}
        fill
        className="object-contain"
        sizes="(max-width: 768px) 100vw, 531px"
        quality={90}
        priority
      />
    </a>
  );
}

