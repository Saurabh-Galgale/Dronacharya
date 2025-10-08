import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Divider,
} from "@mui/material";
import mockData from "../mockData";

const PapersList = () => {
  const [papers, setPapers] = useState([]);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    // Load uploaded papers from localStorage
    const stored = JSON.parse(localStorage.getItem("papers")) || [];
    setPapers([...mockData, ...stored]);

    // Load performance stats
    const storedStats = JSON.parse(localStorage.getItem("papersStats")) || [];
    setStats(storedStats);
  }, []);

  const getStatsForPaper = (paperId) =>
    stats.find((s) => s.paperId === paperId);

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        gutterBottom
        fontWeight="bold"
        sx={{
          letterSpacing: 1,
          fontFamily: "'Gotu', sans-serif",
          whiteSpace: "nowrap",
          lineHeight: 1.6,
          display: "inline-block",
          background: (theme) =>
            `linear-gradient(135deg, rgb(0, 0, 0), rgb(0, 0, 0))`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        पुलिस भर्ती सराव परीक्षा
      </Typography>

      {papers.length === 0 ? (
        <Typography>सध्या कोणतीही परीक्षा उपलब्ध नाही.</Typography>
      ) : (
        papers.map((paper) => {
          const stat = getStatsForPaper(paper.id);

          const name = paper.Name || paper.name || "Untitled Paper";
          const duration = paper.durationMinutes ?? paper.duration ?? 0;
          const subject = paper.subject || "-";
          const totalQuestions =
            paper.totalQuestions ??
            (Array.isArray(paper.questions) ? paper.questions.length : 0);
          const totalMarks = paper.totalMarks ?? "-";

          return (
            <Card
              key={paper.id}
              sx={{
                mb: 2,
                position: "relative",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              {/* Gradient top accent stripe */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(135deg,rgba(222, 105, 37, 0.6),rgba(248, 178, 74, 0.6))",
                  zIndex: 0,
                  borderTopLeftRadius: "12px",
                  borderTopRightRadius: "12px",
                  clipPath: "polygon(0 60%, 0 0, 45% 0)",
                }}
              />

              <CardContent sx={{ position: "relative", zIndex: 1, pb: 7 }}>
                {/* Top left - Name */}
                <Box width={"70%"}>
                  <Typography fontWeight="bold" variant="body">
                    {name}
                  </Typography>
                </Box>

                <Divider
                  sx={{
                    my: 1,
                    width: "100%",
                    ml: 0,
                    mr: "auto",
                    borderColor: "black",
                  }}
                  variant="fullWidth"
                />

                {/* Top right - Duration */}
                <Typography
                  variant="body2"
                  sx={{
                    position: "absolute",
                    top: 18,
                    right: 16,
                    color: "#000",
                    fontWeight: 600,
                  }}
                >
                  {duration} मिनिटे
                </Typography>

                {/* Subject, Total Questions, Total Marks */}
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    विषय: <strong>{subject}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    प्रश्नसंख्या: <strong>{totalQuestions}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    एकूण गुण: <strong>{totalMarks}</strong>
                  </Typography>
                </Box>

                {/* ✅ Start Paper button (bottom-right corner) */}
                <Button
                  variant="contained"
                  component={Link}
                  to={`/app/list/${paper.id}`}
                  sx={{
                    position: "absolute",
                    bottom: 12,
                    right: 16,
                    background: "linear-gradient(135deg, #de6925, #f8b14a)",
                    color: "#fff",
                    borderRadius: "20px",
                    textTransform: "none",
                    px: 2.5,
                    py: 0.6,
                  }}
                >
                  Start Paper
                </Button>

                {/* ✅ Correct answers stat (bottom-left) */}
                {stat && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 14,
                      left: 16,
                      fontSize: "0.85rem",
                      color: "text.secondary",
                    }}
                  >
                    ✅ {stat.correct} / {stat.totalQuestions}
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </Box>
  );
};

export default PapersList;
