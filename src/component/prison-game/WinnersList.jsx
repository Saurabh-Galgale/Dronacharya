// src/component/prison-game/WinnersList.jsx
import React from 'react';
import { Drawer, Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';

const WinnersList = ({ winners, onClose, open }) => {
  return (
    <Drawer anchor="bottom" open={open} onClose={onClose}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" textAlign="center" gutterBottom>
          Top 5 Winners
        </Typography>
        <List>
          {winners && winners.length > 0 ? (
            winners.map((winner, index) => (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Avatar src={winner.avatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={winner.name}
                  secondary={`Wins: ${winner.winCount} | Attempts: ${winner.attemptsTaken}`}
                />
              </ListItem>
            ))
          ) : (
            <Typography textAlign="center">No winners yet.</Typography>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default WinnersList;
