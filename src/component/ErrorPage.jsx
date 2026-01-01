import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";

const ErrorPage = ({ error, resetError }) => {
  return (
    <Container
      maxWidth="xs"
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        backgroundColor: "#fff",
      }}
    >
      {/* Professional Illustration or Icon */}
      <Box
        sx={{
          width: 120,
          height: 120,
          backgroundColor: "#fff5f5",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 4,
        }}
      >
        <Typography sx={{ fontSize: "50px" }}>🛠️</Typography>
      </Box>

      <Typography
        variant="h5"
        sx={{ fontWeight: 800, mb: 2, color: "#1a1a1a" }}
      >
        क्षमस्व, तांत्रिक अडचण आली आहे
      </Typography>

      <Typography sx={{ color: "#666", mb: 4, px: 2, lineHeight: 1.6 }}>
        आम्ही हे दुरुस्त करण्याचा प्रयत्न करत आहोत. कृपया खालील बटण दाबून पुन्हा
        प्रयत्न करा.
      </Typography>

      {/* Show technical error only in development mode */}
      {process.env.NODE_ENV === "development" && (
        <Box
          sx={{
            p: 2,
            mb: 4,
            bgcolor: "#f1f1f1",
            borderRadius: 2,
            fontSize: "12px",
            textAlign: "left",
            width: "100%",
            overflowX: "auto",
          }}
        >
          <code>{error?.message}</code>
        </Box>
      )}

      <Box
        sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Button
          variant="contained"
          onClick={resetError}
          sx={{
            py: 1.8,
            borderRadius: "16px",
            fontSize: "16px",
            fontWeight: "bold",
            textTransform: "none",
            background: "linear-gradient(135deg, #de6925 0%, #e67e22 100%)",
            boxShadow: "0 4px 12px rgba(222, 105, 37, 0.3)",
          }}
        >
          पुन्हा प्रयत्न करा (Retry)
        </Button>

        <Button
          variant="text"
          onClick={() => (window.location.href = "/")}
          sx={{ color: "#666", fontWeight: 600 }}
        >
          होम पेजवर जा
        </Button>
      </Box>
    </Container>
  );
};

export default ErrorPage;
