// src/pages/QuestionPaper.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  IconButton,
  Modal,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  buttonBaseClasses,
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import GridViewIcon from "@mui/icons-material/GridView";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TimerIcon from "@mui/icons-material/Timer";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { getPaperWithQuestions } from "../services/api";

const QuestionPaper = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const drawerRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const [paper, setPaper] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentQuestionPage, setCurrentQuestionPage] = useState(1);
  const [totalQuestionPages, setTotalQuestionPages] = useState(1);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const questionLimit = 10;

  const [drawerHeight, setDrawerHeight] = useState(90); // 90% open by default
  const [gridOpen, setGridOpen] = useState(false);
  const [answers, setAnswers] = useState({});

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const [maxVisitedPage, setMaxVisitedPage] = useState(1);

  const paperType = window.location.pathname.includes("/mock/")
    ? "mock"
    : "pyq";

  // submit button enabling logic
  const isLastPage = currentQuestionPage === totalQuestionPages;
  const allPagesVisited = maxVisitedPage >= totalQuestionPages;

  useEffect(() => {
    loadPaper();
  }, [paperId]);

  useEffect(() => {
    if (paper) {
      loadQuestions();
    }
  }, [currentQuestionPage, paper]);

  useEffect(() => {
    setMaxVisitedPage((prev) => Math.max(prev, currentQuestionPage));
  }, [currentQuestionPage]);

  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerActive, timeRemaining]);

  const loadPaper = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPaperWithQuestions(
        paperType,
        paperId,
        1,
        questionLimit
      );

      setPaper(data.paper);
      setAllQuestions(data.questions || []);
      setTotalQuestionPages(data.totalPages || 1);

      const duration = (data.paper.durationMinutes || 0) * 60;
      setTimeRemaining(duration);
      setTimerActive(true);
    } catch (err) {
      setError(err.message || "Failed to load paper");
      if (err.status === 403) {
        setError("सदस्यता आवश्यक आहे. कृपया सदस्यता घ्या.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const data = await getPaperWithQuestions(
        paperType,
        paperId,
        currentQuestionPage,
        questionLimit
      );

      setAllQuestions((prev) => {
        const existing = new Map(prev.map((q) => [q._id, q]));
        data.questions.forEach((q) => existing.set(q._id, q));
        return Array.from(existing.values());
      });
    } catch (err) {
      console.error("Failed to load questions:", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleTimeUp = () => {
    alert("वेळ संपली! पेपर स्वयंचलितपणे सबमिट केला जाईल.");
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleDrawer = () => {
    setDrawerHeight((prev) => (prev > 50 ? 10 : 90));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalQuestionPages) {
      setCurrentQuestionPage(newPage);
    }
  };

  // Touch handlers for drawer
  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    currentY.current = e.touches[0].clientY;
    const diff = startY.current - currentY.current;
    const windowHeight = window.innerHeight;
    const newHeight = Math.min(
      95,
      Math.max(15, drawerHeight + (diff / windowHeight) * 100)
    );

    if (Math.abs(diff) > 10) {
      setDrawerHeight(newHeight);
    }
  };

  const handleTouchEnd = () => {
    // Snap to nearest position
    if (drawerHeight > 50) {
      setDrawerHeight(90);
    } else {
      setDrawerHeight(10);
    }
  };

  const renderPagination = () => {
    if (totalQuestionPages <= 1) return null;

    const pages = [];
    const maxVisible = 4;
    let startPage = Math.max(
      1,
      currentQuestionPage - Math.floor(maxVisible / 2)
    );
    let endPage = Math.min(totalQuestionPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Allow free navigation only after all pages visited
    const allVisited = maxVisitedPage >= totalQuestionPages;

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          minWidth: 0,
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 2,
          bgcolor: "black",
        }}
      >
        {/* Left Arrow */}
        <IconButton
          size="small"
          onClick={() => handlePageChange(currentQuestionPage - 1)}
          disabled={currentQuestionPage === 1 || loadingQuestions}
          sx={{ color: "white", p: 0.5, flex: "0 0 auto" }}
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>

        {/* Page Numbers - horizontally scrollable */}
        <Box
          sx={{
            display: "flex",
            overflowX: "auto",
            flex: 1,
            mx: 1,
            gap: 0.5,
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": { height: 0.2 },
          }}
        >
          {pages.map((page) => {
            // Sequential navigation logic
            const canClick =
              allVisited ||
              page === currentQuestionPage ||
              page === currentQuestionPage + 1 ||
              page <= maxVisitedPage;

            return (
              <Button
                key={page}
                onClick={() => canClick && handlePageChange(page)}
                size="small"
                disabled={loadingQuestions || !canClick}
                sx={{
                  minWidth: 28,
                  height: 28,
                  my: 0.4,
                  color: currentQuestionPage === page ? "#fff" : "#de6925",
                  background:
                    currentQuestionPage === page
                      ? "linear-gradient(135deg, #de6925, #f8b14a)"
                      : "#1a1a1a",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  opacity: canClick ? 1 : 0.5,
                  pointerEvents: canClick ? "auto" : "none",
                  "&:hover": {
                    bgcolor:
                      currentQuestionPage === page
                        ? "white"
                        : "rgba(255,255,255,0.1)",
                  },
                }}
              >
                {page}
              </Button>
            );
          })}
        </Box>

        {/* Right Arrow */}
        <IconButton
          size="small"
          onClick={() => handlePageChange(currentQuestionPage + 1)}
          disabled={
            currentQuestionPage === totalQuestionPages || loadingQuestions
          }
          sx={{ color: "white", p: 0.5, flex: "0 0 auto" }}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const attemptedCount = Object.keys(answers).filter(
    (k) => answers[k] !== undefined && answers[k] !== null && answers[k] !== ""
  ).length;

  const currentPageQuestions = useMemo(() => {
    const startIdx = (currentQuestionPage - 1) * questionLimit;
    return allQuestions.slice(startIdx, startIdx + questionLimit);
  }, [allQuestions, currentQuestionPage, questionLimit]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#000",
        }}
      >
        <CircularProgress sx={{ color: "white" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, bgcolor: "#000", minHeight: "100vh" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate(-1)}
          sx={{
            background: "linear-gradient(135deg, #de6925, #f8b14a)",
            color: "#fff",
          }}
        >
          मागे जा
        </Button>
      </Box>
    );
  }

  if (!paper) {
    return (
      <Box
        sx={{ p: 3, textAlign: "center", bgcolor: "#000", minHeight: "100vh" }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: "white" }}>
          प्रश्नपत्र सापडले नाही
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(-1)}
          sx={{
            background: "linear-gradient(135deg, #de6925, #f8b14a)",
            color: "#fff",
          }}
        >
          मागे जा
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "#000",
        color: "white",
        overflow: "hidden",
      }}
    >
      {/* Analysis Section (Background) */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          p: 2,
          pt: 1.4,
          overflow: "auto",
          pb: `${drawerHeight}vh`,
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 56,
              mb: 1,
            }}
          >
            {/* Back Arrow on the left */}
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                position: "absolute",
                left: 0,
                color: "white",
                bgcolor: "rgba(255,255,255,0.08)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.18)" },
              }}
              size="large"
            >
              <KeyboardBackspaceIcon />
            </IconButton>
            {/* Centered Paper Name */}
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                mx: "auto",
                textAlign: "center",
                width: "100%",
              }}
            >
              {paper.name || "Untitled Paper"}
            </Typography>
          </Box>
        </Box>

        {/* Analysis Placeholder */}
        <Box
          sx={{
            bgcolor: "rgba(255,255,255,0.05)",
            borderRadius: 3,
            p: 3,
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
      </Box>

      {/* Bottom Drawer */}
      <Box
        ref={drawerRef}
        // onTouchStart={handleTouchStart}
        // onTouchMove={handleTouchMove}
        // onTouchEnd={handleTouchEnd}
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: `${drawerHeight}vh`,
          bgcolor: "#1a1a1a",
          borderTopLeftRadius: 35,
          borderTopRightRadius: 35,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.5)",
          transition:
            drawerHeight === 80 || drawerHeight === 20
              ? "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              : "none",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Drawer Handle */}
        <Box
          sx={{
            width: "100%",
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            // borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
          onClick={toggleDrawer}
        >
          <Box
            sx={{
              width: 40,
              height: 4,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.3)",
            }}
          />
        </Box>

        {/* Drawer Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            pt: 0.2,
            gap: 1,
            pb: 1,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <IconButton
            onClick={toggleDrawer}
            sx={{
              bgcolor: "rgba(255,255,255,0.1)",
              color: "white",
              p: 0.4,
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            }}
          >
            {drawerHeight > 50 ? (
              <KeyboardArrowDownIcon />
            ) : (
              <KeyboardArrowUpIcon />
            )}
          </IconButton>

          {renderPagination()}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.5,
              py: 0.8,
              borderRadius: 2,
              bgcolor:
                timeRemaining < 300 ? "#d32f2f" : "rgba(255,255,255,0.1)",
            }}
          >
            {/* <TimerIcon sx={{ fontSize: 14 }} /> */}
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {formatTime(timeRemaining)}
            </Typography>
          </Box>
        </Box>

        {/* Questions Content */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          {loadingQuestions && currentPageQuestions.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress sx={{ color: "white" }} />
            </Box>
          ) : (
            currentPageQuestions.map((q, idx) => {
              const globalIndex =
                (currentQuestionPage - 1) * questionLimit + idx + 1;
              return (
                <Card
                  key={q._id}
                  sx={{
                    mb: 2,
                    bgcolor: "#2a2a2a",
                    color: "white",
                    borderRadius: 2,
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <CardContent>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
                      {globalIndex}. {q.questionText}
                    </Typography>

                    <RadioGroup
                      name={`q-${q._id}`}
                      value={answers[q._id] || ""}
                      onChange={(e) =>
                        handleAnswerChange(q._id, e.target.value)
                      }
                    >
                      {q.options.map((opt, i) => (
                        <FormControlLabel
                          key={i}
                          value={opt}
                          control={
                            <Radio
                              sx={{
                                color: "rgba(255,255,255,0.5)",
                                "&.Mui-checked": {
                                  color: "#f8b14a",
                                },
                              }}
                            />
                          }
                          label={opt}
                          sx={{
                            color: "white",
                            "& .MuiFormControlLabel-label": {
                              fontSize: "0.95rem",
                            },
                          }}
                        />
                      ))}
                    </RadioGroup>

                    {/* {q.category && (
                      <Box
                        sx={{
                          mt: 1.5,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: "rgba(248, 177, 74, 0.2)",
                          display: "inline-block",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "#f8b14a", fontWeight: 600 }}
                        >
                          {q.category}
                        </Typography>
                      </Box>
                    )} */}
                  </CardContent>
                </Card>
              );
            })
          )}
        </Box>

        {/* Drawer Footer */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            bgcolor: "#1a1a1a",
          }}
        >
          {/* Show Next Page button until all pages are visited, then show Submit */}
          {!allPagesVisited ? (
            <Button
              variant="contained"
              onClick={() => handlePageChange(currentQuestionPage + 1)}
              disabled={
                isLastPage ||
                loadingQuestions ||
                currentQuestionPage >= maxVisitedPage + 1 // Prevent skipping ahead
              }
              sx={{
                background: "linear-gradient(135deg, #de6925, #f8b14a)",
                color: "#fff",
                fontWeight: 700,
                px: 3,
                "&:disabled": {
                  background: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.3)",
                },
              }}
            >
              पुढील पृष्ठ {/* "Next Page" in Marathi */}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => alert("सबमिट करण्याचे कार्य लवकरच उपलब्ध होईल!")}
              disabled={attemptedCount === 0}
              sx={{
                background: "linear-gradient(135deg, #de6925, #f8b14a)",
                color: "#fff",
                fontWeight: 700,
                px: 3,
                "&:disabled": {
                  background: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.3)",
                },
              }}
            >
              सबमिट
            </Button>
          )}

          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
            प्रयत्न:{" "}
            <strong style={{ color: "white" }}>{attemptedCount}</strong> /{" "}
            {paper.totalQuestions || allQuestions.length}
          </Typography>

          <IconButton
            size="small"
            onClick={() => setGridOpen(true)}
            sx={{
              p: 1,
              bgcolor: "rgba(255,255,255,0.1)",
              color: "white",
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            }}
          >
            <GridViewIcon fontSize="medium" />
          </IconButton>
        </Box>
      </Box>

      {/* Grid Modal */}
      <Modal open={gridOpen} onClose={() => setGridOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            width: { xs: "90%", sm: 480 },
            maxHeight: "80vh",
            overflowY: "auto",
            bgcolor: "#1a1a1a",
            borderRadius: 3,
            boxShadow: 24,
            p: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <GridViewIcon sx={{ color: "white", mr: 1 }} />
            <Typography variant="h6" sx={{ color: "white", flex: 1 }}>
              प्रश्न ओव्हरव्ह्यू
            </Typography>
            <IconButton
              size="small"
              onClick={() => setGridOpen(false)}
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Grid container spacing={1}>
            {allQuestions.map((q, i) => {
              const attempted = answers[q._id];
              const pageNum = Math.floor(i / questionLimit) + 1;

              return (
                <Grid item key={q._id}>
                  <Paper
                    elevation={0}
                    sx={{
                      width: 38,
                      height: 38,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 1.5,
                      bgcolor: attempted ? "#4caf50" : "#2a2a2a",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: 700,
                      border: "1px solid",
                      borderColor: attempted
                        ? "#4caf50"
                        : "rgba(255,255,255,0.2)",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: attempted ? "#43a047" : "#333",
                        transform: "scale(1.05)",
                      },
                    }}
                    onClick={() => {
                      setCurrentQuestionPage(pageNum);
                      setDrawerHeight(80);
                      setGridOpen(false);
                    }}
                  >
                    {i + 1}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Modal>
    </Box>
  );
};

export default QuestionPaper;
