import React from "react";
import { Box, Typography } from "@mui/material";
import logo from "../../public/images/logo.png"; // adjust path

// Small animated dots component
const LoadingDots = () => {
  return (
    <span style={{ marginLeft: 5 }}>
      <span className="dot">.</span>
      <span className="dot">.</span>
      <span className="dot">.</span>

      <style>
        {`
          .dot {
            animation: blink 1.5s infinite;
            font-size: 20px;
            font-weight: bold;
          }
          .dot:nth-child(2) {
            animation-delay: 0.3s;
          }
          .dot:nth-child(3) {
            animation-delay: 0.6s;
          }
          @keyframes blink {
            0% { opacity: 0.2; }
            50% { opacity: 1; }
            100% { opacity: 0.2; }
          }
        `}
      </style>
    </span>
  );
};

const Loader = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        bgcolor: "rgb(0, 0, 0)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <img src={logo} alt="Logo" style={{ width: 180, marginBottom: 20 }} />
      <Typography variant="h6" fontWeight="bold" color="secondary">
        लोड होत आहे <LoadingDots />
      </Typography>
    </Box>
  );
};

export default Loader;
