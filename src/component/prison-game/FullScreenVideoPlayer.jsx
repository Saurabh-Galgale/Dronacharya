// src/component/prison-game/FullScreenVideoPlayer.jsx
import React from 'react';
import { Box } from '@mui/material';
import { VIDEO_FILES } from '../../config/prisonGame';

const FullScreenVideoPlayer = ({ currentVideo, onEnded }) => {
  const baseUrl = import.meta.env.VITE_PRISON_GAME_ASSETS_URL;
  const videoSrc = baseUrl && VIDEO_FILES[currentVideo] ? `${baseUrl}${VIDEO_FILES[currentVideo]}` : '';

  const isLoop = currentVideo === 'idle' || currentVideo === 'coverBefore' || currentVideo === 'coverAfter';

  if (!videoSrc) {
    return null; // Don't render anything if there's no source
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
        backgroundColor: 'black', // Add a black background as a fallback
      }}
    >
      <video
        key={videoSrc} // This is the crucial part to force re-mount on src change
        onEnded={onEnded}
        loop={isLoop}
        playsInline
        muted // Muted is essential for autoplay
        autoPlay
        src={videoSrc}
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
