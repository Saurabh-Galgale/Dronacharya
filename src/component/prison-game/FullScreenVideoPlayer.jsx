// src/component/prison-game/FullScreenVideoPlayer.jsx
import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { VIDEO_FILES } from '../../config/prisonGame';

const FullScreenVideoPlayer = ({ currentVideo, onEnded }) => {
  const videoRef = useRef(null);
  const baseUrl = import.meta.env.VITE_PRISON_GAME_ASSETS_URL;
  const videoSrc = baseUrl && VIDEO_FILES[currentVideo] ? `${baseUrl}${VIDEO_FILES[currentVideo]}` : '';

  const isLoop = currentVideo === 'idle' || currentVideo === 'coverBefore' || currentVideo === 'coverAfter';

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && videoSrc) {
      // Set the source programmatically
      videoElement.src = videoSrc;

      // Attempt to play the video
      const playPromise = videoElement.play();

      if (playPromise !== undefined) {
        playPromise.then(_ => {
          // Autoplay started!
        }).catch(error => {
          // Autoplay was prevented.
          console.error("Autoplay prevented:", error);
          // We can't show a play button because it's a background,
          // but logging the error is important for debugging.
        });
      }
    }
  }, [videoSrc]); // Rerun this effect when the video source changes

  if (!videoSrc) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        overflow: 'hidden',
        backgroundColor: 'black',
      }}
    >
      <video
        ref={videoRef}
        onEnded={onEnded}
        loop={isLoop}
        playsInline // Crucial for iOS
        muted // Essential for autoplay
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </Box>
  );
};

export default FullScreenVideoPlayer;
