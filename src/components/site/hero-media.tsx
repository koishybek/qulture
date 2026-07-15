"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type HeroMediaProps = {
  poster?: string;
  video?: string;
};

export function HeroMedia({ poster = "/media/hero/hero-poster.png", video = "/media/hero/hero-video.mp4" }: HeroMediaProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!reduceMotion && !videoFailed) {
      void videoRef.current?.play().catch(() => setVideoFailed(true));
    }
  }, [reduceMotion, videoFailed]);

  return (
    <div className="hero-media" aria-hidden="true">
      <Image fill priority alt="" className="hero-media__poster" sizes="100vw" src={poster} />
      {!reduceMotion && !videoFailed ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="hero-media__video"
          poster={poster}
          preload="metadata"
          onError={() => setVideoFailed(true)}
        >
          <source src={video} type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}

