// src/component/Analysis.jsx
import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  Chip,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Timer,
  TrendingUp,
  TrendingDown,
  Psychology,
  School,
  Calculate,
  EmojiObjects,
  Public,
} from "@mui/icons-material";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";

const Analysis = ({ submissionData }) => {
  // If no submission data, show placeholder
  if (!submissionData) {
    return (
      <Box
        sx={{
          bgcolor: "rgba(255,255,255,0.05)",
          borderRadius: 3,
          p: 4,
          textAlign: "center",
          border: "1px dashed rgba(255,255,255,0.2)",
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, opacity: 0.7 }}>
          📊 विश्लेषण
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.5 }}>
          पेपर सबमिट केल्यानंतर येथे तपशीलवार विश्लेषण दिसेल
        </Typography>
      </Box>
    );
  }

  const {
    totalMarks,
    obtainedMarks,
    totalQuestions,
    attempted,
    correct,
    wrong,
    unattempted,
    timeSpent, // in seconds
    categoryWise, // Array of category analysis
    submittedAt,
  } = submissionData;

  // Calculate percentages
  const scorePercent =
    totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  const attemptRate =
    totalQuestions > 0 ? Math.round((attempted / totalQuestions) * 100) : 0;

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get performance label
  const getPerformanceLabel = (percent) => {
    if (percent >= 90) return { label: "उत्कृष्ट", color: "#4caf50" };
    if (percent >= 75) return { label: "चांगले", color: "#66bb6a" };
    if (percent >= 60) return { label: "सरासरी", color: "#ff9800" };
    if (percent >= 40) return { label: "सुधारणा आवश्यक", color: "#ff5722" };
    return { label: "अधिक अभ्यास आवश्यक", color: "#f44336" };
  };

  const performance = getPerformanceLabel(scorePercent);

  // Category icons mapping
  const categoryIcons = {
    "सामान्य ज्ञान": <Public fontSize="small" />,
    "मराठी व्याकरण": <School fontSize="small" />,
    तर्कशक्ती: <Psychology fontSize="small" />,
    गणित: <Calculate fontSize="small" />,
  };

  return (
    <Box sx={{ animation: "fadeIn 0.5s ease-in", color: "white" }}>
      {/* Header - Centered with BarChartRoundedIcon */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center", // Centers everything horizontally
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 0.4,
            p: 2,
            borderRadius: 3,
            border: "1.4px solid rgba(255,255,255,0.1)",
          }}
        >
          <BarChartRoundedIcon sx={{ fontSize: 32, color: "white" }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            सविस्तर विश्लेषण
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ opacity: 0.6 }}>
          {new Date(submittedAt).toLocaleString("mr-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </Typography>
      </Box>

      {/* Main Score Card */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(135deg, #1e1e1e 0%, #121212 100%)",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={8}>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.6)", mb: 0.5 }}
            >
              प्राप्त गुण
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: "white" }}>
              {obtainedMarks}
              <Typography
                component="span"
                sx={{ fontSize: "1.2rem", opacity: 0.5, ml: 0.5 }}
              >
                / {totalMarks}
              </Typography>
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip
                label={performance.label}
                size="small"
                sx={{
                  bgcolor: performance.color,
                  color: "white",
                  fontWeight: 700,
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: "right" }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: `6px solid ${performance.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255,255,255,0.05)",
                ml: "auto",
              }}
            >
              <Typography
                variant="h5"
                sx={{ color: performance.color, fontWeight: 900 }}
              >
                {scorePercent}%
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Progress Overview */}
      <Paper
        sx={{
          p: 2.5,
          mb: 3,
          bgcolor: "rgba(255,255,255,0.03)",
          borderRadius: 2,
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <Typography
          variant="body2"
          sx={{ mb: 2, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}
        >
          प्रगती विहंगावलोकन
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#66bb6a" }}
              >
                {attempted}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                प्रयत्न
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#ffa726" }}
              >
                {unattempted}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                न सोडवलेले
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#42a5f5" }}
              >
                {attemptRate}%
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                प्रयत्न दर
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Stats Grid - Forced 2x2 Alignment */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr", // Forces exactly two columns
          gap: 2, // Matches your spacing={2}
          mb: 3,
        }}
      >
        {/* Box 1: बरोबर उत्तरे */}
        <Paper
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            bgcolor: "rgba(76, 175, 80, 0.1)",
            borderRadius: 2,
            border: "1px solid rgba(76, 175, 80, 0.4)",
            height: "100%",
          }}
        >
          <CheckCircle sx={{ color: "#66bb6a", fontSize: 28 }} />
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "#66bb6a", lineHeight: 1, fontWeight: 700 }}
            >
              {correct}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#a5d6a7", whiteSpace: "nowrap" }}
            >
              बरोबर उत्तरे
            </Typography>
          </Box>
        </Paper>

        {/* Box 2: चुकीची उत्तरे */}
        <Paper
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            bgcolor: "rgba(244, 67, 54, 0.1)",
            borderRadius: 2,
            border: "1px solid rgba(244, 67, 54, 0.4)",
            height: "100%",
          }}
        >
          <Cancel sx={{ color: "#ef5350", fontSize: 28 }} />
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "#ef5350", lineHeight: 1, fontWeight: 700 }}
            >
              {wrong}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#e57373", whiteSpace: "nowrap" }}
            >
              चुकीची उत्तरे
            </Typography>
          </Box>
        </Paper>

        {/* Box 3: लागलेला वेळ */}
        <Paper
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            bgcolor: "rgba(33, 150, 243, 0.1)",
            borderRadius: 2,
            border: "1px solid rgba(33, 150, 243, 0.4)",
            height: "100%",
          }}
        >
          <Timer sx={{ color: "#42a5f5", fontSize: 28 }} />
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "#42a5f5", lineHeight: 1, fontWeight: 700 }}
            >
              {formatTime(timeSpent)}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#64b5f6", whiteSpace: "nowrap" }}
            >
              लागलेला वेळ
            </Typography>
          </Box>
        </Paper>

        {/* Box 4: अचूकता */}
        <Paper
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            bgcolor: "rgba(248, 177, 74, 0.1)",
            borderRadius: 2,
            border: "1px solid rgba(248, 177, 74, 0.4)",
            height: "100%",
          }}
        >
          <EmojiObjects sx={{ color: "#ffa726", fontSize: 28 }} />
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "#ffa726", lineHeight: 1, fontWeight: 700 }}
            >
              {accuracy}%
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#ffb74d", whiteSpace: "nowrap" }}
            >
              अचूकता
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Category-wise Analysis */}
      {categoryWise && categoryWise.length > 0 && (
        <>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 2,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            विषयनिहाय विश्लेषण
          </Typography>

          {categoryWise.map((cat, i) => {
            const catPercent =
              cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0;
            const catPerf = getPerformanceLabel(catPercent);

            return (
              <Paper
                key={i}
                sx={{
                  p: 2.5,
                  mb: 2,
                  bgcolor: "rgba(255,255,255,0.03)",
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                {/* Category Header */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: "white",
                    }}
                  >
                    {categoryIcons[cat.category] || <School fontSize="small" />}
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 700, color: "rgba(255,255,255,0.9)" }}
                    >
                      {cat.category}
                    </Typography>
                  </Box>
                  <Chip
                    label={catPerf.label}
                    size="small"
                    sx={{
                      bgcolor: catPerf.color,
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                    }}
                  />
                </Box>

                {/* Stats Row */}
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  <Grid item xs={3}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "rgba(255,255,255,0.9)" }}
                      >
                        {cat.total}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255,255,255,0.6)" }}
                      >
                        एकूण
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#66bb6a" }}
                      >
                        {cat.correct}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255,255,255,0.6)" }}
                      >
                        बरोबर
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#ef5350" }}
                      >
                        {cat.wrong}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255,255,255,0.6)" }}
                      >
                        चुकीचे
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#ffa726" }}
                      >
                        {cat.unattempted}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255,255,255,0.6)" }}
                      >
                        न सोडवलेले
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Progress Bar */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,0.7)" }}
                    >
                      गुणांक
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: catPerf.color, fontWeight: 700 }}
                    >
                      {catPercent}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={catPercent}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "rgba(255,255,255,0.1)",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: catPerf.color,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              </Paper>
            );
          })}
        </>
      )}

      {/* Performance Insights */}
      <Paper
        sx={{
          p: 2.5,
          bgcolor: "rgba(248, 177, 74, 0.08)",
          borderRadius: 2,
          border: "1px solid rgba(248, 177, 74, 0.3)",
        }}
      >
        {/* <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5 }}>
          💡 सूचना
        </Typography> */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {accuracy < 60 && (
            <Typography variant="caption" sx={{ opacity: 0.8, color: "white" }}>
              • अचूकता सुधारण्यासाठी अधिक सराव करा
            </Typography>
          )}
          {attemptRate < 80 && (
            <Typography variant="caption" sx={{ opacity: 0.8, color: "white" }}>
              • अधिक प्रश्न सोडवण्याचा प्रयत्न करा
            </Typography>
          )}
          {scorePercent >= 75 && (
            <Typography variant="caption" sx={{ opacity: 0.8, color: "white" }}>
              • उत्तम कामगिरी! असाच सराव सुरू ठेवा
            </Typography>
          )}
          {categoryWise?.some((c) => (c.correct / c.total) * 100 < 50) && (
            <Typography variant="caption" sx={{ opacity: 0.8, color: "white" }}>
              • कमकुवत विषयांवर अधिक लक्ष द्या
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Analysis;
