import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
  Chip,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const PaperCard = ({ paper, filter, isSubscribed, onPaperClick, idx }) => {
  const isFree = paper.isFree !== false;
  const isPublished = paper.isPublished !== false;
  const isSolved = filter === "solved";

  const percentage = (paper.obtainedMarks / paper.totalMarks) * 100;
  let statusColor, statusBgColor, statusText;

  if (percentage <= 40) {
    statusColor = "#d32f2f"; // red text
    statusBgColor = "#ffebee"; // light red background
    statusText = "अपुरे";
  } else if (percentage <= 60) {
    statusColor = "#f57c00"; // orange text
    statusBgColor = "#fff3e0"; // light orange background
    statusText = "चांगले";
  } else {
    statusColor = "#2e7d32"; // green text
    statusBgColor = "#e8f5e9"; // light green background
    statusText = "उत्तम";
  }

  return (
    <Card
      key={paper._id}
      sx={{
        mb: 2,
        position: "relative",
        overflow: "hidden",
        borderRadius: 3,
        background: isSolved
          ? "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)"
          : `linear-gradient(135deg, ${
              idx % 3 === 0
                ? "#fff3e0, #ffe0b2"
                : idx % 3 === 1
                ? "#e3f2fd, #bbdefb"
                : "#f3e5f5, #e1bee7"
            })`,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:active": {
          transform: "scale(0.98)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1.5,
          }}
        >
          <Box sx={{ flex: 1, pr: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "text.primary",
                mb: 0.5,
              }}
            >
              {paper.name || "Untitled Paper"}
            </Typography>
            {isSolved && (
              <Chip
                icon={<CheckCircleIcon />}
                label="पूर्ण झाले"
                size="small"
                color="success"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>

          {paper.year && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "fit-content",
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                mr: 0.5,
                borderRadius: 2,
                bgcolor: "rgba(88, 204, 132, 0.2)",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, fontSize: "0.9rem" }}
              >
                {paper.year}
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              bgcolor: "rgba(0,0,0,0.06)",
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, fontSize: "0.9rem" }}
            >
              ⏱ {paper.durationMinutes || 0}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              मिनिटे
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block" }}
            >
              प्रश्नसंख्या
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {paper.totalQuestions || 0}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block" }}
            >
              एकूण गुण
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {paper.totalMarks || 0}
            </Typography>
          </Box>

          {isSolved && (
            <>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: statusColor, display: "block", fontWeight: 600 }}
                >
                  मिळालेले गुण - {statusText}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 700, color: statusColor }}
                >
                  {paper.obtainedMarks} / {paper.totalMarks}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", display: "block" }}
                >
                  सोडवलेली तारीख
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {new Date(paper.solvedAt).toLocaleDateString()}
                </Typography>
              </Box>
            </>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box>
            {!isFree && !isSubscribed ? (
              <>
                <IconButton
                  size="medium"
                  sx={{
                    color: "white",
                    background:
                      "linear-gradient(135deg,rgba(222, 105, 37, 0.9),rgba(248, 178, 74, 0.9))",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <LockIcon fontSize="medium" />
                </IconButton>
              </>
            ) : null}
          </Box>

          <Button
            variant="contained"
            onClick={() => onPaperClick(paper)}
            disabled={!isPublished}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              px: 3,
              py: 1,
              fontWeight: 700,
              background: isSolved
                ? "linear-gradient(135deg, #66bb6a, #43a047)"
                : "linear-gradient(135deg, #de6925, #f8b14a)",
              color: "#fff",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
              },
              "&:disabled": {
                background: "rgba(0,0,0,0.12)",
                color: "rgba(0,0,0,0.26)",
              },
            }}
          >
            {isSolved ? "पुन्हा पहा" : "सुरू करा"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaperCard;
