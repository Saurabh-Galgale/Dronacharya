import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const QuestionImage = ({ fig }) => {
  const [hasError, setHasError] = useState(false);

  const imageUrl = `${import.meta.env.VITE_CLOUDFRONT_URL}/${
    fig.startsWith("/") ? fig.slice(1) : fig
  }`;

  if (hasError) {
    return (
      <Box
        sx={{
          width: "100%",
          mb: 2,
          borderRadius: 2,
          border: "1px solid rgba(255, 82, 82, 0.2)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: "100%",
            height: "200px",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(255, 82, 82, 0.1)",
            color: "#ff5252",
            textAlign: "center",
            p: 2,
          }}
        >
          <CloseIcon sx={{ fontSize: 40, mb: 1, opacity: 0.7 }} />
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            इथे प्रतिमा आवश्यक आहे पण लोड झाली नाही
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            कृपया कनेक्शन तपासा किंवा काहीतरी चुकले आहे, आम्ही लवकरच दुरुस्त करू
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        mb: 2,
        borderRadius: 2,
        border: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <img
        src={imageUrl}
        alt="Question Figure"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          minHeight: "50px",
        }}
        onError={() => setHasError(true)}
      />
    </Box>
  );
};

export default QuestionImage;
