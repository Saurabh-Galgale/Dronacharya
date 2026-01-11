import React, { useState, useEffect } from "react";
import { Box, Modal, Typography, CircularProgress } from "@mui/material";

const ForceLogoutModal = ({ open, onLogout }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (open) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [open, onLogout]);

  return (
    <Modal open={open} aria-labelledby="force-logout-modal-title">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          bgcolor: "rgba(0, 0, 0, 0.85)",
          color: "white",
          textAlign: "center",
          p: 3,
        }}
      >
        <CircularProgress color="inherit" size={60} sx={{ mb: 3 }} />
        <Typography
          variant="h5"
          id="force-logout-modal-title"
          sx={{ fontWeight: "bold" }}
        >
          तुमचे सत्र कालबाह्य झाले आहे
        </Typography>
        <Typography variant="body1" sx={{ mt: 1.5, mb: 2, maxWidth: 400 }}>
          हे सेशन व्यवस्थित सुरु ठेवण्यासाठी पुन्हा लॉगिन (re-logging) करण्याची
          गरज आहे.
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          {countdown}
        </Typography>
      </Box>
    </Modal>
  );
};

export default ForceLogoutModal;
