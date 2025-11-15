"use client";

import { useState } from "react";
import Image from "next/image";

export interface YouTubeContainerProps {
  videoId: string;
  title?: string;
}

export default function YouTubeContainer({
  videoId,
  title = "Video",
}: YouTubeContainerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Container with YouTube background */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl">
        {/* Background SVG */}
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          {!isPlaying ? (
            <>
              {/* YouTube thumbnail and play button */}
              <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
                {/* YouTube Background SVG */}
                <div className="absolute inset-0 opacity-20">
                  <Image
                    src="/assets/youtube_background.svg"
                    alt="YouTube background"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Play button */}
                <button
                  onClick={handlePlay}
                  className="relative z-10 transition-transform hover:scale-110 duration-300"
                  aria-label="Play video"
                >
                  <Image
                    src="/assets/youtube_playbutton.svg"
                    alt="Play"
                    width={100}
                    height={100}
                    className="drop-shadow-2xl"
                  />
                </button>
              </div>
            </>
          ) : (
            /* YouTube iframe when playing */
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://youtube.com/shorts/ixQ289VcOqk?si=8yM3blQgSdf9-XE5`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </div>
  );
}

