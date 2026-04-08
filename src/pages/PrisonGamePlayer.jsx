// src/pages/PrisonGamePlayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress } from '@mui/material';
import { startPrisonGame, refundPrisonGameAttempt } from '../services/api';
import FullScreenVideoPlayer from '../component/prison-game/FullScreenVideoPlayer';
import QuestionOverlay from '../component/prison-game/QuestionOverlay';

const PrisonGamePlayer = () => {
  const [isGameLoading, setIsGameLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentVideo, setCurrentVideo] = useState('intro'); // intro, idle, success, fail
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const gameStartedSuccessfully = useRef(false);

  useEffect(() => {
    const startGame = async () => {
      try {
        const data = await startPrisonGame();
        if (data && data.questions) {
          setQuestions(data.questions);
          gameStartedSuccessfully.current = true; // Mark that API call was a success
        } else {
          throw new Error("No questions received from server.");
        }
      } catch (error) {
        console.error("Failed to start game:", error);
        // Backend doesn't deduct an attempt on failure, so just navigate back
        navigate('/prison-game');
      } finally {
        setIsGameLoading(false);
      }
    };

    startGame();

    // Cleanup function to refund attempt if the client fails after a successful API call
    return () => {
      // Only refund if the API call was successful but the game didn't finish
      // (e.g., user closed the tab)
      if (gameStartedSuccessfully.current) {
         refundPrisonGameAttempt();
      }
    };
  }, [navigate]);

  const handleVideoEnd = () => {
    if (currentVideo === 'intro') {
      setCurrentVideo('idle');
    } else if (currentVideo === 'success') {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questions.length) {
        setCurrentQuestionIndex(nextIndex);
        setCurrentVideo('idle');
        setIsSubmitting(false);
      } else {
        // WIN!
        navigate('/prison-game/game-over', { state: { status: 'win' } });
      }
    } else if (currentVideo === 'fail') {
      // FAIL!
      navigate('/prison-game/game-over', { state: { status: 'fail' } });
    }
  };

  const handleAnswerSubmit = (selectedIndex) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const isCorrect = selectedIndex === questions[currentQuestionIndex]._co;
    setCurrentVideo(isCorrect ? 'success' : 'fail');
  };

  const skipIntro = () => {
    handleVideoEnd();
  }

  if (isGameLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <FullScreenVideoPlayer currentVideo={currentVideo} onEnded={handleVideoEnd} />

      {currentVideo === 'intro' && (
         <Button onClick={skipIntro} sx={{position: 'absolute', top: 20, right: 20, zIndex: 10}}>Skip</Button>
      )}

      {currentVideo === 'idle' && !isSubmitting && (
        <QuestionOverlay
          question={questions[currentQuestionIndex]}
          onSubmit={handleAnswerSubmit}
        />
      )}
    </Box>
  );
};

export default PrisonGamePlayer;
