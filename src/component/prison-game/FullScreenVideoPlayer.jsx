// src/component/prison-game/FullScreenVideoPlayer.jsx
import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { VIDEO_FILES } from '../../config/prisonGame';

const FullScreenVideoPlayer = ({ currentVideo, onEnded }) => {
  const videoRef = useRef(null);
  const baseUrl = import.meta.env.VITE_PRISON_GAME_ASSETS_URL;
  const videoSrc = baseUrl && VIDEO_FILES[currentVideo] ? `${baseUrl}${VIDEO_FILES[currentVideo]}` : '';

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = videoSrc;
      videoRef.current.play().catch(error => {
        // Autoplay is often blocked, but we can try.
        console.error("Video autoplay failed:", error);
      });
    }
  }, [videoSrc]);

  const isLoop = currentVideo === 'idle' || currentVideo === 'coverBefore' || currentVideo === 'coverAfter';

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
      }}
    >
      <video
        ref={videoRef}
        onEnded={onEnded}
        loop={isLoop}
        playsInline
        muted // Muted is often required for autoplay
        autoPlay
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
