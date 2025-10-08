// src/pages/QuestionPaper.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Divider,
  Collapse,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import GridViewIcon from "@mui/icons-material/GridView";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import mockData from "../mockData";

const PAGE_SIZE = 25;
const UNCATEGORIZED_MAR = "अनिर्दिष्ट";

/**
 * QuestionPaper
 * - Hooks MUST always run in same order — keep them at top level of component
 * - Blue full-viewport background + white bottom sheet
 * - Tag-wise analysis and grid overview modal
 */
export default function QuestionPaper() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const headerRef = useRef(null);

  // -------- Hooks (TOP - always run in same order) --------
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(true);
  const [page, setPage] = useState(0);
  const [gridOpen, setGridOpen] = useState(false);
  const [result, setResult] = useState(null);

  // analysis accordion toggles
  const [openMarks, setOpenMarks] = useState(false);
  const [openCorrect, setOpenCorrect] = useState(false);
  const [openIncorrect, setOpenIncorrect] = useState(false);
  const [openAttempted, setOpenAttempted] = useState(false);

  // ---------- Hooks that derive values (always declared before returns) ----------
  const totalQuestions = paper?.questions?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalQuestions / PAGE_SIZE));

  const pageQuestions = useMemo(() => {
    const start = page * PAGE_SIZE;
    return (paper?.questions || []).slice(start, start + PAGE_SIZE);
  }, [paper, page]);

  // Dummy overall numbers shown when not submitted (kept as memo to avoid re-creation)
  const dummyOverallStatic = useMemo(
    () => ({
      marks: { obtained: 60, total: 100 },
      correct: { count: 60, total: 100 },
      incorrect: { count: 40, total: 100 },
      attempted: { count: 70, total: 100 },
    }),
    []
  );

  // ---------- Helper fns used by memos/handlers ----------
  const isAttempted = (qId) =>
    answers[qId] !== undefined && answers[qId] !== null && answers[qId] !== "";

  const attemptedCount = Object.keys(answers).filter(
    (k) => answers[k] !== undefined && answers[k] !== null && answers[k] !== ""
  ).length;

  const normalizeTags = (raw) => {
    if (!raw) return [UNCATEGORIZED_MAR];
    if (Array.isArray(raw))
      return raw.map((t) => String(t).trim() || UNCATEGORIZED_MAR);
    if (typeof raw === "string") {
      const parts = raw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      return parts.length ? parts : [UNCATEGORIZED_MAR];
    }
    return [UNCATEGORIZED_MAR];
  };

  // ---------- Tag breakdown (single source of truth) ----------
  // Builds tag-level totals from questions and either computes real numbers (if submitted)
  // or distributes dummy overall numbers proportionally (for demo).
  const tagBreakdown = useMemo(() => {
    const tagMap = {};
    const questions = paper?.questions || [];

    // tally totals per tag
    questions.forEach((q) => {
      const tags = normalizeTags(q?.tag);
      tags.forEach((t) => {
        if (!tagMap[t])
          tagMap[t] = {
            tag: t,
            total: 0,
            attempted: 0,
            correct: 0,
            incorrect: 0,
          };
        tagMap[t].total += 1;
      });
    });

    const totalQ = questions.length;

    if (submitted) {
      // calculate actual per-tag numbers using answers
      questions.forEach((q) => {
        const tags = normalizeTags(q?.tag);
        const attemptedNow = isAttempted(q.id);
        const correctNow = answers[q.id] === q.correctAnswer;
        tags.forEach((t) => {
          const entry = tagMap[t];
          if (!entry) return;
          if (attemptedNow) entry.attempted += 1;
          if (attemptedNow && !correctNow) entry.incorrect += 1;
          if (correctNow) entry.correct += 1;
        });
      });
      return Object.values(tagMap).sort((a, b) => b.total - a.total);
    }

    // Not submitted -> distribute dummy numbers proportionally (keeps UI meaningful)
    if (totalQ === 0) return [];

    const distribute = (totalCount) => {
      const arr = Object.values(tagMap).map((t) => {
        const share = t.total / totalQ;
        return { tag: t.tag, raw: share * totalCount, share };
      });

      const rounded = arr.map((a) => ({
        tag: a.tag,
        value: Math.floor(a.raw),
        frac: a.raw - Math.floor(a.raw),
      }));
      let sum = rounded.reduce((s, r) => s + r.value, 0);
      let remainder = Math.round(totalCount - sum);

      rounded.sort((a, b) => b.frac - a.frac);
      for (let i = 0; i < rounded.length && remainder > 0; i++, remainder--) {
        rounded[i].value += 1;
      }

      const mapOut = {};
      rounded.forEach((r) => (mapOut[r.tag] = r.value));
      return mapOut;
    };

    const attemptedDist = distribute(dummyOverallStatic.attempted.count);
    const correctDist = distribute(dummyOverallStatic.correct.count);
    const incorrectDist = distribute(dummyOverallStatic.incorrect.count);

    Object.values(tagMap).forEach((t) => {
      t.attempted = attemptedDist[t.tag] ?? 0;
      t.correct = correctDist[t.tag] ?? 0;
      t.incorrect = incorrectDist[t.tag] ?? 0;
    });

    return Object.values(tagMap).sort((a, b) => b.total - a.total);
  }, [paper, submitted, answers, dummyOverallStatic]);

  // ---------- Data loading and lifecycle ----------
  useEffect(() => {
    let mounted = true;
    async function loadPaper() {
      setLoading(true);
      try {
        // Replace with real API call when ready (kept commented)
        // const res = await fetch(`${API_BASE}/api/papers/${encodeURIComponent(paperId)}`, {
        //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        // });
        // if (!res.ok) throw new Error("Paper fetch failed");
        // const data = await res.json();
        // if (mounted) setPaper(data);

        const p = mockData.find((x) => String(x.id) === String(paperId));
        if (mounted) setPaper(p || null);
      } catch (err) {
        console.error("Failed to load paper:", err);
        if (mounted) setPaper(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPaper();
    return () => {
      mounted = false;
    };
  }, [paperId]);

  // reset state when paper changes
  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setPage(0);
  }, [paper?.id]);

  // ---------- Handlers ----------
  const handleChange = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const computeResult = () => {
    let correct = 0;
    let attempted = 0;
    (paper?.questions || []).forEach((q) => {
      if (isAttempted(q.id)) {
        attempted++;
        if (answers[q.id] === q.correctAnswer) correct++;
      }
    });
    const wrong = attempted - correct;
    const unattempted = totalQuestions - attempted;
    const accuracyPercent = attempted
      ? Math.round((correct / attempted) * 100)
      : 0;
    const scorePercent = totalQuestions
      ? Math.round((correct / totalQuestions) * 100)
      : 0;

    return {
      paperId: paper?.id,
      title: paper?.Name || paper?.title || "",
      subject: paper?.subject || "General",
      date: new Date().toISOString(),
      attempted,
      correct,
      wrong,
      unattempted,
      accuracyPercent,
      scorePercent,
      totalQuestions,
    };
  };

  const handleSubmit = () => {
    const res = computeResult();
    setResult(res);
    setSubmitted(true);

    try {
      const storedStats = JSON.parse(localStorage.getItem("papersStats")) || [];
      const idx = storedStats.findIndex((s) => s.paperId === res.paperId);
      if (idx >= 0) storedStats[idx] = res;
      else storedStats.push(res);
      localStorage.setItem("papersStats", JSON.stringify(storedStats));
    } catch (err) {
      console.warn("Failed to persist stats:", err);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setPage(0);
  };

  const toggleSheet = () => setSheetOpen((v) => !v);

  // collapse sheet when blue area clicked (only when clicking the blue area itself)
  const onBlueClick = (e) => {
    if (e.target === e.currentTarget) {
      setSheetOpen(false);
    }
  };

  // replace the old renderPageNumbers with this
  const renderPageNumbers = () => {
    const visible = 7;
    const half = Math.floor(visible / 2);
    let start = Math.max(0, page - half);
    let end = Math.min(totalPages - 1, start + visible - 1);
    if (end - start < visible - 1) start = Math.max(0, end - visible + 1);
    const pagesArr = [];
    for (let i = start; i <= end; i++) pagesArr.push(i);

    return pagesArr.map((p) => {
      const active = p === page;
      return (
        <Button
          key={p}
          onClick={() => {
            if (!active) setPage(p);
          }}
          size="small"
          variant={active ? "contained" : "outlined"}
          aria-current={active ? "page" : undefined}
          sx={
            active
              ? {
                  minWidth: 36,
                  height: 36,
                  px: 0.8,
                  mx: 0.35,
                  textTransform: "none",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #de6925, #f8b14a)",
                  color: "#000",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  "&:hover": { filter: "brightness(0.98)" },
                }
              : {
                  minWidth: 36,
                  height: 36,
                  px: 0.8,
                  mx: 0.35,
                  textTransform: "none",
                  borderRadius: 1,
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "transparent",
                  color: "text.primary",
                  "&:hover": { background: "rgba(0,0,0,0.04)" },
                }
          }
        >
          {p + 1}
        </Button>
      );
    });
  };

  // ---------- Early returns (safe — all hooks declared above) ----------
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading…</Typography>
      </Box>
    );
  }

  if (!paper) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Paper not found
        </Typography>
        <Button variant="contained" onClick={() => navigate("/app/list")}>
          Back to Papers
        </Button>
      </Box>
    );
  }

  // ---------- Render ----------
  return (
    <Box
      sx={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: (theme) =>
          `linear-gradient(180deg, #0f4b66 0%, ${
            theme.palette.primary.light || "#2e7ac7"
          } 100%)`,
        color: "white",
      }}
    >
      {/* Blue full-screen header area */}
      <Box
        ref={headerRef}
        onClick={onBlueClick}
        sx={{
          position: "absolute",
          inset: 0,
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: 2,
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pointerEvents: "auto",
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {paper.name || paper.title}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.95 }}>
              {paper.subject || "General"}
            </Typography>
          </Box>

          <Box sx={{ textAlign: "right" }}>
            <Typography variant="subtitle2">
              ⏱ {paper.durationMinutes ?? paper.duration ?? 0} मिनिटे
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.95 }}>
              {totalQuestions} प्रश्न
            </Typography>
          </Box>
        </Box>

        {/* ---------- SINGLE PAPER ANALYSIS (4 full-width rows) ---------- */}
        <Box sx={{ width: "100%", maxWidth: 1200 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {/* Marks */}
            <Paper
              elevation={0}
              sx={{ p: 1.25, bgcolor: "rgba(255,255,255,0.06)" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    गुण: {dummyOverallStatic.marks.obtained}/
                    {dummyOverallStatic.marks.total}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    परीक्षेचे एकूण गुण
                  </Typography>
                </Box>

                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMarks((v) => !v);
                  }}
                  sx={{ color: "white" }}
                  aria-expanded={openMarks}
                  aria-label="Toggle marks breakdown"
                >
                  {openMarks ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                </IconButton>
              </Box>

              <Collapse in={openMarks}>
                <Box sx={{ mt: 1 }}>
                  {tagBreakdown.length === 0 ? (
                    <Typography variant="body2">
                      टॅग-वाइज माहिती उपलब्ध नाही.
                    </Typography>
                  ) : (
                    tagBreakdown.map((t) => (
                      <Box
                        key={t.tag}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          py: 0.5,
                        }}
                      >
                        <Typography variant="body2">{t.tag}</Typography>
                        <Typography variant="body2">
                          {Math.round(
                            (t.total / Math.max(1, totalQuestions)) *
                              dummyOverallStatic.marks.total
                          )}{" "}
                          / {dummyOverallStatic.marks.total}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Collapse>
            </Paper>

            {/* Correct */}
            <Paper
              elevation={0}
              sx={{ p: 1.25, bgcolor: "rgba(255,255,255,0.06)" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    बरोबर: {dummyOverallStatic.correct.count}/
                    {dummyOverallStatic.correct.total}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    बरोबर उत्तरांची संख्या
                  </Typography>
                </Box>

                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenCorrect((v) => !v);
                  }}
                  sx={{ color: "white" }}
                  aria-expanded={openCorrect}
                  aria-label="Toggle correct breakdown"
                >
                  {openCorrect ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                </IconButton>
              </Box>

              <Collapse in={openCorrect}>
                <Box sx={{ mt: 1 }}>
                  {tagBreakdown.length === 0 ? (
                    <Typography variant="body2">
                      टॅग-वाइज माहिती उपलब्ध नाही.
                    </Typography>
                  ) : (
                    tagBreakdown.map((t) => (
                      <Box
                        key={t.tag}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          py: 0.5,
                        }}
                      >
                        <Typography variant="body2">{t.tag}</Typography>
                        <Typography variant="body2">
                          {submitted ? t.correct : t.correct}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Collapse>
            </Paper>

            {/* Incorrect */}
            <Paper
              elevation={0}
              sx={{ p: 1.25, bgcolor: "rgba(255,255,255,0.06)" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    चुकीचे: {dummyOverallStatic.incorrect.count}/
                    {dummyOverallStatic.incorrect.total}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    चुकीची उत्तरे
                  </Typography>
                </Box>

                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenIncorrect((v) => !v);
                  }}
                  sx={{ color: "white" }}
                  aria-expanded={openIncorrect}
                  aria-label="Toggle incorrect breakdown"
                >
                  {openIncorrect ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                </IconButton>
              </Box>

              <Collapse in={openIncorrect}>
                <Box sx={{ mt: 1 }}>
                  {tagBreakdown.length === 0 ? (
                    <Typography variant="body2">
                      टॅग-वाइज माहिती उपलब्ध नाही.
                    </Typography>
                  ) : (
                    tagBreakdown.map((t) => (
                      <Box
                        key={t.tag}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          py: 0.5,
                        }}
                      >
                        <Typography variant="body2">{t.tag}</Typography>
                        <Typography variant="body2">
                          {submitted ? t.incorrect : t.incorrect}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Collapse>
            </Paper>

            {/* Attempted */}
            <Paper
              elevation={0}
              sx={{ p: 1.25, bgcolor: "rgba(255,255,255,0.06)" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    प्रयत्न: {dummyOverallStatic.attempted.count}/
                    {dummyOverallStatic.attempted.total}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    प्रयत्न केलेले प्रश्न
                  </Typography>
                </Box>

                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenAttempted((v) => !v);
                  }}
                  sx={{ color: "white" }}
                  aria-expanded={openAttempted}
                  aria-label="Toggle attempted breakdown"
                >
                  {openAttempted ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                </IconButton>
              </Box>

              <Collapse in={openAttempted}>
                <Box sx={{ mt: 1 }}>
                  {tagBreakdown.length === 0 ? (
                    <Typography variant="body2">
                      टॅग-वाइज माहिती उपलब्ध नाही.
                    </Typography>
                  ) : (
                    tagBreakdown.map((t) => (
                      <Box
                        key={t.tag}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          py: 0.5,
                        }}
                      >
                        <Typography variant="body2">{t.tag}</Typography>
                        <Typography variant="body2">
                          {submitted ? t.attempted : t.attempted}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Collapse>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* White bottom-sheet overlay */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: sheetOpen ? "85%" : "14%",
          bgcolor: "background.paper",
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          boxShadow: 6,
          transition: "height 350ms cubic-bezier(.2,.8,.2,1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          zIndex: 10,
        }}
      >
        {/* sheet header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
            gap: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              toggleSheet();
            }}
            sx={{ bgcolor: "background.paper", boxShadow: 1 }}
            aria-label={sheetOpen ? "Collapse sheet" : "Expand sheet"}
          >
            {sheetOpen ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
          </IconButton>

          {/* Pagination: chevrons + page numbers */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeftIcon />
            </IconButton>

            {renderPageNumbers()}

            <IconButton
              size="small"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1 }} />

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setGridOpen(true);
            }}
            aria-label="Grid view"
          >
            <GridViewIcon />
          </IconButton>
        </Box>

        {/* Questions list */}
        <Box sx={{ overflowY: "auto", p: 2, flex: 1 }}>
          {(pageQuestions || []).map((q) => (
            <Card key={q.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {q.id}. {q.question}
                </Typography>

                <RadioGroup
                  name={`q-${q.id}`}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                >
                  {q.options.map((opt, i) => (
                    <FormControlLabel
                      key={i}
                      value={opt}
                      control={<Radio />}
                      label={opt}
                      disabled={submitted}
                    />
                  ))}
                </RadioGroup>

                {submitted && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color:
                          answers[q.id] === q.correctAnswer ? "green" : "red",
                        fontWeight: 600,
                      }}
                    >
                      तुमचे उत्तर: {answers[q.id] ?? "Not selected"}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      बरोबर उत्तर: <strong>{q.correctAnswer}</strong>
                    </Typography>
                    {q.explanation && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {q.explanation}
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}

          {!submitted && page < totalPages - 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                Load Next Page
              </Button>
            </Box>
          )}
        </Box>

        {/* footer */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            gap: 2,
          }}
        >
          {!submitted ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={attemptedCount === 0}
            >
              Submit
            </Button>
          ) : (
            <>
              <Button variant="outlined" onClick={handleReset}>
                Reset
              </Button>
              <Button variant="contained" onClick={() => navigate("/app/list")}>
                Back to Papers
              </Button>
            </>
          )}

          <Box sx={{ flex: 1 }} />

          <Typography variant="caption" sx={{ alignSelf: "center" }}>
            Attempted: <strong>{attemptedCount}</strong> / {totalQuestions}
          </Typography>
        </Box>
      </Box>

      {/* Grid modal - square boxes for question overview (clicking a box moves to that page and opens sheet) */}
      <Modal open={gridOpen} onClose={() => setGridOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            width: { xs: "95%", sm: 640 },
            maxHeight: "80vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            p: 2,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <CalendarTodayIcon />
            <Typography variant="h6">Question Overview</Typography>
            <Box sx={{ flex: 1 }} />
            <Button size="small" onClick={() => setGridOpen(false)}>
              Close
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={1}>
            {(paper.questions || []).map((q) => {
              const attempted = isAttempted(q.id);
              return (
                <Grid item key={q.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      width: { xs: 44, sm: 48 },
                      height: { xs: 44, sm: 48 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 1,
                      bgcolor: attempted ? "success.main" : "grey.100",
                      color: attempted ? "white" : "text.primary",
                      cursor: "pointer",
                      userSelect: "none",
                      m: 0.5,
                      fontWeight: 600,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {q.id}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Modal>
    </Box>
  );
}
