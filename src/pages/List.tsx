// src/pages/PapersList.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, Typography, Box, Button } from "@mui/material";
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

  const getStatsForPaper = (paperId) => {
    return stats.find((s) => s.paperId === paperId);
  };

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
            `linear-gradient(135deg,rgb(0, 0, 0),rgb(0, 0, 0))`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        पुलिस भर्ती सराव परीक्षा
      </Typography>

      {papers.length === 0 ? (
        <Typography>No papers available yet. Please upload one.</Typography>
      ) : (
        papers.map((paper) => {
          const stat = getStatsForPaper(paper.id);

          return (
            <Card
              key={paper.id}
              sx={{
                mb: 2,
                position: "relative", // to position stats at bottom-right
              }}
            >
              <CardContent>
                <Typography fontWeight="bold" variant="h6">
                  {paper.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {paper.questions.length} Questions
                </Typography>

                <Button
                  variant="contained"
                  sx={{
                    background: "linear-gradient(135deg, #de6925, #f8b14a)",
                    color: "#fff",
                  }}
                  component={Link}
                  to={`/app/list/${paper.id}`}
                >
                  Start Paper
                </Button>

                {/* ✅ Correct answers stat bottom-right */}
                {stat && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      right: 12,
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
