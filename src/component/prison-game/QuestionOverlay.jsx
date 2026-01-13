// src/component/prison-game/QuestionOverlay.jsx
import React from 'react';
import { Box, Button, Typography, Grid } from '@mui/material';

const QuestionOverlay = ({ question, onSubmit }) => {
  if (!question) {
    return null;
  }

  const { questionText, options } = question;

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '40%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
      }}
    >
      <Typography variant="h6" textAlign="center" mb={2}>
        {questionText}
      </Typography>
      <Grid container spacing={2}>
        {options.map((option, index) => (
          <Grid item xs={6} key={index}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => onSubmit(index)}
              sx={{
                backgroundColor: '#8A2BE2', // A game-like purple
                '&:hover': {
                  backgroundColor: '#9932CC',
                },
                fontSize: '0.8rem',
                height: '56px',
              }}
            >
              {option}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default QuestionOverlay;
