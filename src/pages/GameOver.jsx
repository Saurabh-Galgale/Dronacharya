// src/pages/GameOver.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { recordPrisonGameWin } from '../services/api';
import FullScreenVideoPlayer from '../component/prison-game/FullScreenVideoPlayer';

const GameOver = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const gameStatus = location.state?.status; // 'win' or 'fail'

  // Derive sequence directly from props/state, avoids useEffect for state setting
  const videoSequence = gameStatus === 'win'
    ? ['win', 'winEnd']
    : gameStatus === 'fail'
      ? ['fail', 'failEnd']
      : [];

  useEffect(() => {
    // Use useEffect only for the side-effect of navigation
    if (!gameStatus) {
      navigate('/prison-game');
    }
  }, [gameStatus, navigate]);

  const handleVideoEnd = async () => {
    // If the 'win' video just finished, call the API
    if (videoSequence[currentVideoIndex] === 'win') {
      try {
        await recordPrisonGameWin(1); // attemptsTaken is hardcoded to 1 as requested
      } catch (error) {
        console.error("Failed to record win:", error);
        // Even if API fails, continue the flow
      }
    }

    const nextIndex = currentVideoIndex + 1;
    if (nextIndex < videoSequence.length) {
      setCurrentVideoIndex(nextIndex);
    } else {
      // End of sequence, navigate back to lobby
      navigate('/prison-game');
    }
  };

  if (videoSequence.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <FullScreenVideoPlayer
        currentVideo={videoSequence[currentVideoIndex]}
        onEnded={handleVideoEnd}
      />
    </Box>
  );
};

export default GameOver;
