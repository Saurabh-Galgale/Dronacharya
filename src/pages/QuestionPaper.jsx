// src/pages/QuestionPaper.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import GridViewIcon from "@mui/icons-material/GridView";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  getPaperWithQuestions,
  submitPaper,
  getPaperSubmissions,
} from "../services/api";
import {
  getCachedPaper,
  setCachedPaper,
  removeCachedPaper,
} from "../services/paperCache";
import Analysis from "../component/Analysis";

const QuestionPaper = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const drawerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const [paper, setPaper] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentQuestionPage, setCurrentQuestionPage] = useState(1);
  const [totalQuestionPages, setTotalQuestionPages] = useState(1);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const questionLimit = 10;

  const [drawerHeight, setDrawerHeight] = useState(90);
  const [gridOpen, setGridOpen] = useState(false);
  const [answers, setAnswers] = useState({});

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [maxVisitedPage, setMaxVisitedPage] = useState(1);

  const [refreshWarningOpen, setRefreshWarningOpen] = useState(false);
  // Submission states
  const [submitting, setSubmitting] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const isViewMode = state?.viewMode || false;

  const paperType = window.location.pathname.includes("/mock/")
    ? "mock"
    : "pyq";

  const isLastPage = currentQuestionPage === totalQuestionPages;
  const allPagesVisited = maxVisitedPage >= totalQuestionPages;

  useEffect(() => {
    loadInitialData();
  }, [paperId]);

  useEffect(() => {
    // This effect handles loading subsequent pages if the paper wasn't fully cached initially
    const isCached = !!getCachedPaper(paperId);
    if (paper && !isCached) {
      loadQuestionsForPage();
    }
  }, [currentQuestionPage, paper]);

  useEffect(() => {
    setMaxVisitedPage((prev) => Math.max(prev, currentQuestionPage));
  }, [currentQuestionPage]);

  useEffect(() => {
    // Logic to show retry button on data mismatch
    if (submissionData && submissionData.attempted === 0) {
      const timeSinceSubmit =
        (Date.now() - new Date(submissionData.submittedAt).getTime()) / 1000;
      // Only show if submission is fresh (e.g., within 60s) to avoid showing it on old, broken data
      if (timeSinceSubmit < 60) {
        setShowRetry(true);
      }
    }
  }, [submissionData]);

  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerActive, timeRemaining]);

  // Add this useEffect to handle the browser's native "Are you sure?" alert
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!submissionData && !isViewMode && Object.keys(answers).length > 0) {
        e.preventDefault();
        e.returnValue = ""; // Standard for modern browsers
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [answers, submissionData, isViewMode]);

  const startTimer = (durationMinutes) => {
    const duration = (durationMinutes || 0) * 60;
    setTimeRemaining(duration);
    setTimerActive(true);
    startTimeRef.current = Date.now();
  };

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Check cache first
      const cachedData = getCachedPaper(paperId);
      if (cachedData) {
        setPaper(cachedData.paper);
        setAllQuestions(cachedData.questions);
        setTotalQuestionPages(
          Math.ceil(cachedData.questions.length / questionLimit)
        );
        if (cachedData.submission) {
          setSubmissionData(cachedData.submission);
        } else if (!isViewMode) {
          startTimer(cachedData.paper.durationMinutes);
        }
        setLoading(false);
        return;
      }

      // 2. Fetch from API if not cached
      const data = await getPaperWithQuestions(
        paperType,
        paperId,
        1,
        questionLimit
      );
      setPaper(data.paper);
      setAllQuestions(data.questions || []);
      setTotalQuestionPages(data.totalPages || 1);

      if (isViewMode) {
        const submissionRes = await getPaperSubmissions(paperId);
        const submission = submissionRes?.[0] || null;
        setSubmissionData(submission);
        // Fetch all other questions and cache everything in the background
        fetchAllQuestionsAndCache(
          data.paper,
          data.questions,
          data.totalPages,
          submission
        );
      } else {
        startTimer(data.paper.durationMinutes);
        // Fetch and cache in background
        fetchAllQuestionsAndCache(
          data.paper,
          data.questions,
          data.totalPages,
          null
        );
      }
    } catch (err) {
      setError(err.message || "Failed to load paper data.");
      if (err.status === 403) {
        setError("A subscription is required to view this paper.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllQuestionsAndCache = async (
    paperData,
    firstPageQuestions,
    totalPages,
    submission
  ) => {
    let questions = [...firstPageQuestions];
    try {
      if (totalPages > 1) {
        const promises = [];
        for (let i = 2; i <= totalPages; i++) {
          promises.push(
            getPaperWithQuestions(paperType, paperId, i, questionLimit)
          );
        }
        const results = await Promise.all(promises);
        results.forEach((page) => questions.push(...(page.questions || [])));
      }
      setCachedPaper(paperId, { paper: paperData, questions, submission });
      setAllQuestions(questions);
    } catch (error) {
      // console.error("Error fetching all questions for caching:", error);
      // Cache what we have anyway
      setCachedPaper(paperId, { paper: paperData, questions, submission });
    }
  };

  const loadQuestionsForPage = async () => {
    const startIndex = (currentQuestionPage - 1) * questionLimit;
    if (allQuestions[startIndex]) return; // Already loaded

    setLoadingQuestions(true);
    try {
      const data = await getPaperWithQuestions(
        paperType,
        paperId,
        currentQuestionPage,
        questionLimit
      );
      setAllQuestions((prev) => {
        const updated = [...prev];
        data.questions.forEach((q, i) => {
          updated[startIndex + i] = q;
        });
        return updated;
      });
    } catch (err) {
      // console.error("Failed to load questions page:", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAutoSubmit = async () => {
    alert("वेळ संपली! पेपर स्वयंचलितपणे सबमिट केला जात आहे.");
    await handleSubmit();
  };

  const handleRetry = () => {
    removeCachedPaper(paperId);
    window.location.reload();
  };

  const handleSubmit = async () => {
    setConfirmDialog(false);
    setSubmitting(true);
    setTimerActive(false);

    try {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

      // Format answers for backend: { questionId: selectedOption }
      const formattedAnswers = {};
      Object.keys(answers).forEach((qId) => {
        if (answers[qId]) {
          formattedAnswers[qId] = answers[qId];
        }
      });

      const analysisData = await submitPaper(
        paperId,
        paperType,
        formattedAnswers,
        timeSpent
      );

      // Manually construct the detailed answers array for caching, as the API only returns analysis
      const questionMap = new Map(allQuestions.map((q) => [q._id, q]));
      const detailedAnswers = Object.keys(answers)
        .map((questionId) => {
          const question = questionMap.get(questionId);
          if (!question) return null;

          const selectedOptionText = answers[questionId];
          const selectedIndex = question.options.indexOf(selectedOptionText);
          if (selectedIndex === -1) return null; // Should not happen

          const isCorrect = selectedIndex === question.correctAnswerIndex;

          return {
            q: questionId,
            s: selectedIndex,
            c: isCorrect,
            m: isCorrect ? question.marks : 0,
          };
        })
        .filter(Boolean);

      const completeSubmissionData = {
        ...analysisData,
        answers: detailedAnswers,
      };

      setSubmissionData(completeSubmissionData);
      setDrawerHeight(10); // Collapse drawer to show analysis

      // Cache the paper with submission data after successful submission
      setCachedPaper(paperId, {
        paper,
        questions: allQuestions,
        submission: completeSubmissionData,
      });
    } catch (err) {
      alert(err.message || "सबमिट अयशस्वी झाले. पुन्हा प्रयत्न करा.");
      setTimerActive(true); // Resume timer on error
    } finally {
      setSubmitting(false);
    }
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
        <IconButton
          size="small"
          onClick={() => handlePageChange(currentQuestionPage - 1)}
          disabled={currentQuestionPage === 1 || loadingQuestions}
          sx={{ color: "white", p: 0.5, flex: "0 0 auto" }}
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>

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

  const submittedAnswersMap = useMemo(() => {
    if (!submissionData?.answers) return new Map();
    // The 'q' property might be an object { $oid: "..." } or a string
    return new Map(
      submissionData.answers.map((ans) => {
        const key = typeof ans.q === "object" ? ans.q.$oid : ans.q;
        return [key, ans];
      })
    );
  }, [submissionData]);

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
      {/* Analysis Section */}
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
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 56,
            }}
          >
            <IconButton
              onClick={() => {
                if (
                  !submissionData &&
                  !isViewMode &&
                  Object.keys(answers).length > 0
                ) {
                  setRefreshWarningOpen(true);
                } else {
                  navigate(-1);
                }
              }}
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

            {showRetry && (
              <IconButton
                onClick={handleRetry}
                sx={{
                  position: "absolute",
                  right: 0,
                  color: "white",
                  bgcolor: "rgba(255,255,255,0.08)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.18)" },
                }}
                size="large"
              >
                <RefreshIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        <Analysis submissionData={submissionData} />
      </Box>

      {/* Bottom Drawer */}
      <Box
        ref={drawerRef}
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
          transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
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

          {!submissionData && (
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
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {formatTime(timeRemaining)}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          {loadingQuestions && currentPageQuestions.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress sx={{ color: "white" }} />
            </Box>
          ) : (
            currentPageQuestions.map((q, idx) => {
              const globalIndex =
                (currentQuestionPage - 1) * questionLimit + idx + 1;
              const submittedAnswer = submittedAnswersMap.get(q._id);
              const isAttempted = submittedAnswer !== undefined;
              const isCorrect = submittedAnswer?.c === true;
              const userSelectedIndex = submittedAnswer?.s;

              const getStatus = () => {
                if (!isViewMode && !submissionData) return null;
                if (!isAttempted)
                  return {
                    label: "न सोडवलेले",
                    color: "warning",
                    textColor: "#ffa726",
                  };
                return isCorrect
                  ? {
                      label: "बरोबर",
                      color: "success",
                      textColor: "#66bb6a",
                    }
                  : {
                      label: "चूक",
                      color: "error",
                      textColor: "#ef5350",
                    };
              };
              const status = getStatus();

              return (
                <Card
                  key={q._id}
                  sx={{
                    mb: 2,
                    bgcolor: "#2a2a2a",
                    color: "white",
                    borderRadius: 2,
                    border: "1.5px solid",
                    borderColor: status
                      ? `${status.color}.main`
                      : "transparent",
                    position: "relative",
                    overflow: "visible", // Allow chips to overflow
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="body1"
                      sx={{ mb: 2, fontWeight: 600, pr: 1 }}
                    >
                      {globalIndex}. {q.questionText}
                    </Typography>

                    <RadioGroup
                      name={`q-${q._id}`}
                      value={answers[q._id] || ""}
                      onChange={
                        !!submissionData
                          ? undefined
                          : (e) => handleAnswerChange(q._id, e.target.value)
                      }
                    >
                      {q.options.map((opt, i) => {
                        const isCorrectAnswer = i === q.correctAnswerIndex;
                        const isUserSelection = i === userSelectedIndex;

                        let radioColor = "rgba(255,255,255,0.5)";
                        let labelColor = "white";
                        let fontWeight = 400;

                        if (submissionData) {
                          if (isCorrectAnswer) {
                            radioColor = "success.main";
                            labelColor = "success.main";
                            fontWeight = 700;
                          }
                          if (isUserSelection && !isCorrect) {
                            radioColor = "error.main";
                            labelColor = "error.main";
                            fontWeight = 700;
                          }
                        }

                        return (
                          <FormControlLabel
                            key={i}
                            value={opt}
                            control={
                              <Radio
                                disabled={!!submissionData}
                                checked={
                                  !!submissionData
                                    ? isUserSelection || isCorrectAnswer
                                    : answers[q._id] === opt
                                }
                                sx={{
                                  color: radioColor,
                                  "&.Mui-checked": {
                                    color: radioColor,
                                  },
                                  "&.Mui-disabled": {
                                    color: radioColor,
                                  },
                                }}
                              />
                            }
                            label={opt}
                            sx={{
                              color: labelColor,
                              fontWeight: fontWeight,
                              "& .MuiFormControlLabel-label": {
                                fontSize: "0.95rem",
                                color: "white",
                                opacity: 1,
                              },
                              "&.Mui-disabled .MuiFormControlLabel-label": {
                                color: "white",
                                opacity: 1,
                              },
                            }}
                          />
                        );
                      })}
                    </RadioGroup>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1.5,
                        mt: 1.6,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: { xs: 1, sm: 0 },
                        }}
                      >
                        <Chip
                          label={q.category.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: "rgba(255,255,255,0.1)",
                            color: "white",
                            fontWeight: 800,
                            fontSize: "0.7rem",
                            letterSpacing: "0.5px",
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: { xs: 1, sm: 0 },
                        }}
                      >
                        {status && (
                          <Chip
                            label={status.label}
                            size="small"
                            sx={{
                              bgcolor: `${status.color}.main`,
                              color: "white",
                              fontWeight: 700,
                            }}
                          />
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "bold",
                            bgcolor: "rgba(0,0,0,0.4)",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1.5,
                          }}
                        >{`${submittedAnswer?.m || 0} / ${
                          q.marks
                        }`}</Typography>
                      </Box>
                    </Box>

                    {(isViewMode || submissionData) && q.explanation && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 1.5,
                          bgcolor: "rgba(0,0,0,0.25)",
                          borderRadius: 1,
                          borderLeft: "4px solid",
                          borderColor: "primary.main",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold", mb: 0.5 }}
                        >
                          Explanation:
                        </Typography>
                        <Typography variant="body2">{q.explanation}</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </Box>

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
          {submissionData ? (
            // View Mode: Only show Next Page button if not on the last page
            <>
              {!isLastPage ? (
                <Button
                  variant="contained"
                  onClick={() => handlePageChange(currentQuestionPage + 1)}
                  disabled={loadingQuestions}
                  sx={{
                    background: "linear-gradient(135deg, #de6925, #f8b14a)",
                    color: "#fff",
                    fontWeight: 700,
                    px: 3,
                  }}
                >
                  पुढील पृष्ठ
                </Button>
              ) : (
                <Box /> // Empty box to maintain layout
              )}
            </>
          ) : (
            // Solve Mode: Show Next Page or Submit button
            <>
              {!allPagesVisited ? (
                <Button
                  variant="contained"
                  onClick={() => handlePageChange(currentQuestionPage + 1)}
                  disabled={
                    isLastPage ||
                    loadingQuestions ||
                    currentQuestionPage >= maxVisitedPage + 1
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
                  पुढील पृष्ठ
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => setConfirmDialog(true)}
                  disabled={attemptedCount === 0 || submitting}
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
                  {submitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "सबमिट"
                  )}
                </Button>
              )}

              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                प्रयत्न:{" "}
                <strong style={{ color: "white" }}>{attemptedCount}</strong> /{" "}
                {paper.totalQuestions || allQuestions.length}
              </Typography>
            </>
          )}

          {!isViewMode && (
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
          )}
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
                      setDrawerHeight(90);
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

      {/* Confirm Submit Dialog */}
      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: "#1a1a1a",
            color: "white",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>पेपर सबमिट करायचे?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            तुम्ही <strong>{attemptedCount}</strong> पैकी{" "}
            <strong>{paper.totalQuestions || allQuestions.length}</strong>{" "}
            प्रश्न सोडवले आहेत.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            सबमिट केल्यानंतर तुम्ही उत्तरे बदलू शकणार नाही.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog(false)}
            sx={{ color: "white" }}
          >
            रद्द करा
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #de6925, #f8b14a)",
              color: "#fff",
            }}
          >
            सबमिट करा
          </Button>
        </DialogActions>
      </Dialog>

      {/* Refresh/Leave Warning Modal */}
      <Dialog
        open={refreshWarningOpen}
        PaperProps={{
          sx: {
            bgcolor: "#1a1a1a",
            color: "white",
            borderRadius: "20px",
            padding: "10px",
            maxWidth: "350px",
          },
        }}
      >
        <DialogTitle
          sx={{ textAlign: "center", fontWeight: 900, color: "#de6925" }}
        >
          सावधान! (Warning)
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{ textAlign: "center", fontSize: "1.1rem", lineHeight: 1.6 }}
          >
            तुम्ही पेज रिफ्रेश केल्यास किंवा मागे गेल्यास तुमची उत्तरे पुसली
            जातील आणि परीक्षा पुन्हा सुरुवातीपासून सुरू होईल.
          </Typography>
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              bgcolor: "rgba(255,255,255,0.05)",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "#aaa", textAlign: "center" }}
            >
              तुम्हाला खरोखर परीक्षा थांबवून बाहेर पडायचे आहे का?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ flexDirection: "column", gap: 1, p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setRefreshWarningOpen(false)}
            sx={{
              background: "linear-gradient(135deg, #de6925, #f8b14a)",
              color: "white",
              fontWeight: 800,
              borderRadius: "12px",
              py: 1.5,
            }}
          >
            परीक्षा सुरू ठेवा (Continue Exam)
          </Button>
          <Button
            fullWidth
            onClick={() => {
              setRefreshWarningOpen(false);
              navigate(-1); // Or handle cleanup
            }}
            sx={{
              color: "#ef5350",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            हो, परीक्षा थांबवा (Yes, Stop Exam)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionPaper;
