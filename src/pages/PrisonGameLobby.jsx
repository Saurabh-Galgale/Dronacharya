// src/pages/PrisonGameLobby.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { getPrisonGameInfo } from '../services/api';
import FullScreenVideoPlayer from '../component/prison-game/FullScreenVideoPlayer';
import WinnersList from '../component/prison-game/WinnersList';

const PrisonGameLobby = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [gameInfo, setGameInfo] = useState({
    remainingAttempts: 0,
    hasWon: false,
    winners: [],
  });
  const [showWinners, setShowWinners] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGameInfo = async () => {
      try {
        const data = await getPrisonGameInfo();
        setGameInfo(data);
      } catch (error) {
        console.error("Failed to fetch game info:", error);
        // Handle error state appropriately
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameInfo();
  }, []);

  const handleStartGame = () => {
    if (gameInfo.remainingAttempts > 0) {
      navigate('/prison-game/play');
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden', backgroundColor: 'black' }}>
      <FullScreenVideoPlayer currentVideo={gameInfo.hasWon ? 'coverAfter' : 'coverBefore'} />

      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {Array.from(new Array(gameInfo.remainingAttempts)).map((_, index) => (
          <FavoriteIcon key={index} sx={{ color: 'red' }} />
        ))}
      </Box>

      <Box sx={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 2, width: '80%' }}>
        {gameInfo.remainingAttempts > 0 ? (
          <Button variant="contained" onClick={handleStartGame} sx={{ bgcolor: '#FFA500', '&:hover': { bgcolor: '#FFC04D' }, color: 'black', fontWeight: 'bold' }}>
            {gameInfo.hasWon ? "It's difficult but let's try" : "Start Game"}
          </Button>
        ) : (
          <Typography sx={{ color: 'white', textAlign: 'center', bgcolor: 'rgba(0,0,0,0.5)', p: 1, borderRadius: 1 }}>
            Subscribe to get more attempts
          </Typography>
        )}

        <Button variant="outlined" onClick={() => setShowWinners(true)} sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: '#FFA500', color: '#FFA500' } }}>
          View Winners
        </Button>
      </Box>

      <WinnersList open={showWinners} winners={gameInfo.winners} onClose={() => setShowWinners(false)} />
    </Box>
  );
};

export default PrisonGameLobby;
