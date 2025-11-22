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
    <div className="relative w-full max-w-[531px] h-auto mx-auto" style={{ aspectRatio: '531/763', maxHeight: '763px' }}>
      {/* Content Container - positioned behind the frame */}
      <div className="absolute top-[15%] left-[9.5%] right-[9.5%] bottom-[15%] flex justify-center items-center">
        <div className="relative w-full h-full flex justify-center items-center">
          {!isPlaying ? (
            <>
              {/* YouTube thumbnail and play button */}
              <div className="absolute inset-0 bg-black/90 flex items-center justify-center rounded-2xl overflow-hidden">
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
                    width={80}
                    height={80}
                    className="drop-shadow-2xl"
                  />
                </button>
              </div>
            </>
          ) : (
            /* YouTube iframe when playing */
            <iframe
              className="absolute inset-0 w-full h-full rounded-2xl"
              src={`https://youtube.com/shorts/ixQ289VcOqk?si=8yM3blQgSdf9-XE5`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </div>

      {/* Background Image - on top of content */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/assets/homepage_youtube.svg)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
    </div>
  );
}

