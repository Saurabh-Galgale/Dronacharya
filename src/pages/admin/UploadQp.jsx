// src/pages/admin/UploadQp.jsx
import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Stack,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  FormControlLabel,
  Switch,
} from "@mui/material";
import * as pdfjsLib from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker?worker";

// Use the worker port approach that worked previously in your environment
pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

// === Your strict parser (kept as before) ===
function parseQuestions(rawText) {
  const questions = [];
  const answerKey = {};

  const [content, answersPart] = rawText.split("उत्तर ताललका");

  if (answersPart) {
    const answerLines = answersPart.split("\n");
    answerLines.forEach((line) => {
      const parts = line.trim().split(/\s+/);
      for (let i = 0; i < parts.length; i += 2) {
        const qNo = parseInt(parts[i]);
        const ansIdx = parseInt(parts[i + 1]);
        if (!isNaN(qNo) && !isNaN(ansIdx)) {
          answerKey[qNo] = ansIdx;
        }
      }
    });
  }

  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let currentQ = null;
  let lastOptIndex = null;

  lines.forEach((line) => {
    const qMatch = line.match(/^(\d+)\.\s*(.*)/); // 1. Question
    if (qMatch) {
      if (currentQ) {
        while (currentQ.options.length < 4) currentQ.options.push("");
        questions.push(currentQ);
      }
      currentQ = {
        id: parseInt(qMatch[1]),
        question: qMatch[2].trim(),
        options: [],
        correctAnswer: "",
        explanation: "",
      };
      lastOptIndex = null;
      return;
    }

    const optMatch = line.match(/^([1-4])\)\s*(.*)/); // 1) or 1)
    if (optMatch && currentQ) {
      const optIndex = parseInt(optMatch[1]) - 1;
      currentQ.options[optIndex] = optMatch[2].trim();
      lastOptIndex = optIndex;
      return;
    }

    if (lastOptIndex !== null && currentQ) {
      currentQ.options[lastOptIndex] += " " + line.trim();
      return;
    }

    if (currentQ) {
      currentQ.question += " " + line;
    }
  });

  if (currentQ) {
    while (currentQ.options.length < 4) currentQ.options.push("");
    questions.push(currentQ);
  }

  questions.forEach((q) => {
    const ansIdx = answerKey[q.id];
    if (ansIdx && q.options[ansIdx - 1]) {
      q.correctAnswer = q.options[ansIdx - 1];
    }
  });

  return questions;
}

// === Component ===
export default function UploadQp() {
  // metadata fields
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [published, setPublished] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [questionCount, setQuestionCount] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [code, setCode] = useState("");

  // flows
  const [questions, setQuestions] = useState([]);
  const [papers, setPapers] = useState([]); // local drafts
  const [selected, setSelected] = useState([]);
  const fileInputRef = useRef(null);

  // text mode (paste QP)
  const [textModeOpen, setTextModeOpen] = useState(false);
  const [textQpRaw, setTextQpRaw] = useState("");

  // UI states
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const addTag = () => {
    const t = (tagInput || "").trim();
    if (!t) return;
    if (!tags.includes(t)) setTags((s) => [...s, t]);
    setTagInput("");
  };
  const removeTag = (t) => setTags((s) => s.filter((x) => x !== t));

  // --- PDF upload using the worker approach that was previously working ---
  const handlePdfUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setLoading(true);
    setSnack({ open: true, severity: "info", message: "Reading PDF..." });

    try {
      const reader = new FileReader();
      reader.onload = async function () {
        try {
          const typedarray = new Uint8Array(this.result);

          // previously working: getDocument with typedarray
          const pdf = await pdfjsLib.getDocument(typedarray).promise;

          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();

            // defensive mapping for items — some PDFs might have different structure
            const strings = (content.items || []).map((item) =>
              item && typeof item.str === "string" ? item.str : ""
            );
            text += strings.join("\n") + "\n";
          }

          console.log("PDF extracted (first 400 chars):", text.slice(0, 400));
          const parsed = parseQuestions(text);

          if (!parsed || parsed.length === 0) {
            setSnack({
              open: true,
              severity: "warning",
              message: "Parsed 0 questions — check PDF format.",
            });
            setQuestions([]);
          } else {
            // normalize parsed results to match backend shape used elsewhere
            const normalized = parsed.map((p) => ({
              questionText: p.question || "",
              options: Array.isArray(p.options)
                ? p.options.map((o) => ({ text: o || "" }))
                : [],
              correctAnswers: p.correctAnswer
                ? [p.options.indexOf(p.correctAnswer)]
                : [],
              subject: subject || "",
              topic: "",
              tags: [],
              explanation: p.explanation || "",
            }));
            setQuestions(normalized);
            setSnack({
              open: true,
              severity: "success",
              message: `Parsed ${normalized.length} questions.`,
            });
          }
        } catch (innerErr) {
          console.error("PDF parse inner error:", innerErr);
          setSnack({
            open: true,
            severity: "error",
            message: "Failed parsing PDF content.",
          });
          setQuestions([]);
        } finally {
          setLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("PDF upload error:", err);
      setSnack({
        open: true,
        severity: "error",
        message: "PDF upload failed.",
      });
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // parse pasted text mode
  const handleParseTextQp = () => {
    if (!textQpRaw || !textQpRaw.trim()) {
      setSnack({
        open: true,
        severity: "warning",
        message: "Paste QP text first.",
      });
      return;
    }
    const parsed = parseQuestions(textQpRaw);
    if (!parsed || parsed.length === 0) {
      setSnack({
        open: true,
        severity: "warning",
        message: "No questions parsed from text.",
      });
      return;
    }
    const normalized = parsed.map((p) => ({
      questionText: p.question || "",
      options: Array.isArray(p.options)
        ? p.options.map((o) => ({ text: o || "" }))
        : [],
      correctAnswers: p.correctAnswer
        ? [p.options.indexOf(p.correctAnswer)]
        : [],
      subject: subject || "",
      topic: "",
      tags: [],
      explanation: p.explanation || "",
    }));
    setQuestions(normalized);
    setTextModeOpen(false);
    setTextQpRaw("");
    setSnack({
      open: true,
      severity: "success",
      message: `Parsed ${normalized.length} questions from text.`,
    });
  };

  const handleSavePaper = () => {
    if (!questions.length) {
      setSnack({
        open: true,
        severity: "warning",
        message: "No questions to save.",
      });
      return;
    }
    const newPaper = {
      id: Date.now(),
      title: title || `Paper ${papers.length + 1}`,
      subject,
      className,
      tags,
      questionCount: questionCount ? Number(questionCount) : questions.length,
      totalMarks: totalMarks ? Number(totalMarks) : undefined,
      durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
      code,
      published,
      isFree,
      questions: JSON.parse(JSON.stringify(questions)),
    };
    setPapers((p) => [...p, newPaper]);
    setQuestions([]);
    setSnack({
      open: true,
      severity: "success",
      message: "Paper saved locally.",
    });
  };

  const handleEditPaper = (paperId) => {
    const paper = papers.find((p) => p.id === paperId);
    if (!paper) return;
    setQuestions(paper.questions);
    setTitle(paper.title || "");
    setSubject(paper.subject || "");
    setClassName(paper.className || "");
    setTags(paper.tags || []);
    setQuestionCount(paper.questionCount || "");
    setTotalMarks(paper.totalMarks || "");
    setDurationMinutes(paper.durationMinutes || "");
    setCode(paper.code || "");
    setPublished(paper.published || false);
    setIsFree(paper.isFree || false);
    setPapers((ps) => ps.filter((p) => p.id !== paperId));
    setSnack({
      open: true,
      severity: "info",
      message: "Loaded paper for edit.",
    });
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // build payload shape expected by your backend (based on earlier schema)
  const buildPayloadFromPaper = (paper) => ({
    title: paper.title,
    subject: paper.subject,
    className: paper.className,
    tags: Array.isArray(paper.tags) ? paper.tags : [],
    questionCount: Number(paper.questionCount || paper.questions.length || 0),
    totalMarks: paper.totalMarks,
    durationMinutes: paper.durationMinutes,
    code: paper.code,
    published: !!paper.published,
    isFree: !!paper.isFree,
    questions: (paper.questions || []).map((q) => ({
      questionText: q.questionText,
      options: Array.isArray(q.options)
        ? q.options.map((o) => ({ text: o.text || o }))
        : [],
      correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers : [],
      subject: q.subject || paper.subject,
      topic: q.topic || "",
      tags: Array.isArray(q.tags) ? q.tags : [],
      explanation: q.explanation || "",
    })),
  });

  const handleSubmit = async () => {
    if (!selected.length) {
      setSnack({
        open: true,
        severity: "warning",
        message: "Select at least one paper.",
      });
      return;
    }
    const selectedPapers = papers.filter((p) => selected.includes(p.id));
    for (const p of selectedPapers) {
      const declared = Number(p.questionCount || 0);
      const actual = (p.questions || []).length;
      if (declared && declared !== actual) {
        setSnack({
          open: true,
          severity: "error",
          message: `Paper "${p.title}" expects ${declared} questions but found ${actual}.`,
        });
        return;
      }
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const responses = [];
      for (const p of selectedPapers) {
        const payload = buildPayloadFromPaper(p);
        // if not admin (no token) keep published false
        if (!token) payload.published = false;
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || ""}/api/qp/papers`,
          {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
          }
        );

        if (res.ok) {
          responses.push(await res.json());
        } else {
          const text = await res.text().catch(() => "");
          console.error("Paper upload failed", res.status, text);
          setSnack({
            open: true,
            severity: "error",
            message: `Upload failed (status ${res.status})`,
          });
          setLoading(false);
          return;
        }
      }

      setSnack({
        open: true,
        severity: "success",
        message: `Submitted ${responses.length} paper(s).`,
      });
      setPapers((prev) => prev.filter((p) => !selected.includes(p.id)));
      setSelected([]);
    } catch (err) {
      console.error("Bulk submit error:", err);
      setSnack({
        open: true,
        severity: "error",
        message: "Server error during submit.",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Render UI ---
  return (
    <Box
      sx={{
        py: 3,
        px: { xs: 2, sm: 3 },
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: { xs: "100%", sm: 720, md: 1000 } }}>
        <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 1 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            नवीन प्रश्नपत्रिका अपलोड करा (Admin / Delegated)
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Upload a PDF or paste the paper text. Edit parsed questions, save
            locally, and submit to server. Non-admins will have submissions
            saved as published: false.
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Class"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Code (optional)"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <TextField
                placeholder="Add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(ev) =>
                  ev.key === "Enter" && (addTag(), ev.preventDefault())
                }
                sx={{ flexGrow: 1, minWidth: 140 }}
              />
              <Button onClick={addTag}>Add Tag</Button>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", ml: 1 }}>
                {tags.map((t) => (
                  <Chip key={t} label={t} onDelete={() => removeTag(t)} />
                ))}
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Question Count"
                  value={questionCount}
                  onChange={(e) =>
                    setQuestionCount(e.target.value.replace(/\D/g, ""))
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  label="Total Marks"
                  value={totalMarks}
                  onChange={(e) =>
                    setTotalMarks(e.target.value.replace(/\D/g, ""))
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  label="Duration (minutes)"
                  value={durationMinutes}
                  onChange={(e) =>
                    setDurationMinutes(e.target.value.replace(/\D/g, ""))
                  }
                  fullWidth
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                  />
                }
                label="Published"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                  />
                }
                label="Is Free"
              />
            </Box>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Button
            variant="contained"
            component="label"
            disabled={!!questions.length || loading}
            fullWidth
          >
            Upload PDF (parse)
            <input
              ref={fileInputRef}
              hidden
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
            />
          </Button>

          <Button
            variant="outlined"
            onClick={() => setTextModeOpen((s) => !s)}
            disabled={!!questions.length}
            fullWidth
          >
            {textModeOpen ? "Close text editor" : "Paste Paper Text"}
          </Button>

          <Button
            variant="contained"
            color="secondary"
            disabled={!questions.length}
            onClick={handleSavePaper}
            fullWidth
          >
            Save Paper (draft)
          </Button>
        </Box>

        {textModeOpen && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1">Paste paper text below</Typography>
            <TextField
              value={textQpRaw}
              onChange={(e) => setTextQpRaw(e.target.value)}
              multiline
              rows={8}
              fullWidth
              sx={{ mt: 1 }}
            />
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 1,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Button variant="contained" onClick={handleParseTextQp} fullWidth>
                Parse Text
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setTextQpRaw("");
                  setTextModeOpen(false);
                }}
                fullWidth
              >
                Cancel
              </Button>
            </Box>
          </Paper>
        )}

        {questions.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">
              Edit Extracted Questions ({questions.length})
            </Typography>

            {questions.map((q, idx) => (
              <Paper
                key={`${idx}-${q.questionText?.slice(0, 16)}`}
                sx={{ p: 2, my: 2, border: "1px solid #ddd", borderRadius: 2 }}
              >
                <TextField
                  fullWidth
                  label={`Q${idx + 1}`}
                  value={q.questionText}
                  onChange={(e) => {
                    const copy = [...questions];
                    copy[idx].questionText = e.target.value;
                    setQuestions(copy);
                  }}
                  sx={{ mb: 2 }}
                />

                {Array.from({ length: Math.max(1, q.options.length || 4) }).map(
                  (_, i) => (
                    <TextField
                      key={i}
                      fullWidth
                      value={
                        (q.options &&
                          q.options[i] &&
                          (q.options[i].text || q.options[i])) ||
                        ""
                      }
                      label={`Option ${i + 1}`}
                      onChange={(e) => {
                        const copy = [...questions];
                        copy[idx].options = copy[idx].options || [];
                        copy[idx].options[i] = { text: e.target.value };
                        setQuestions(copy);
                      }}
                      sx={{ mb: 1 }}
                    />
                  )
                )}

                <TextField
                  fullWidth
                  label="Correct Answers (indexes array, e.g. [0])"
                  value={JSON.stringify(q.correctAnswers || [])}
                  onChange={(e) => {
                    const copy = [...questions];
                    try {
                      copy[idx].correctAnswers = JSON.parse(e.target.value);
                    } catch {}
                    setQuestions(copy);
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Explanation"
                  multiline
                  value={q.explanation || ""}
                  onChange={(e) => {
                    const copy = [...questions];
                    copy[idx].explanation = e.target.value;
                    setQuestions(copy);
                  }}
                />
              </Paper>
            ))}

            <Button variant="outlined" onClick={handleSavePaper} fullWidth>
              Save Paper
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6">
          सेव्ह केलेल्या प्रश्नपत्रिका (Local drafts)
        </Typography>
        <List>
          {papers.map((paper) => (
            <ListItem
              key={paper.id}
              secondaryAction={
                <Button onClick={() => handleEditPaper(paper.id)}>Edit</Button>
              }
            >
              <ListItemIcon>
                <Checkbox
                  color="secondary"
                  checked={selected.includes(paper.id)}
                  onChange={() => toggleSelect(paper.id)}
                />
              </ListItemIcon>
              <ListItemText
                primary={paper.title}
                secondary={`${paper.questions.length} questions • ${
                  paper.subject || ""
                }`}
              />
            </ListItem>
          ))}
        </List>

        {papers.length > 0 && (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              mt: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading || selected.length === 0}
              fullWidth
            >
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                "Submit Selected Papers"
              )}
            </Button>

            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Selected: {selected.length}
            </Typography>
          </Box>
        )}

        <Snackbar
          open={snack.open}
          autoHideDuration={4500}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            severity={snack.severity}
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            sx={{ width: "100%" }}
          >
            {snack.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

// // src/pages/admin/UploadQp.jsx
// import React, { useState, useRef } from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   TextField,
//   Checkbox,
//   List,
//   ListItem,
//   ListItemText,
//   ListItemIcon,
//   Divider,
//   Paper,
// } from "@mui/material";
// import * as pdfjsLib from "pdfjs-dist";
// import PdfWorker from "pdfjs-dist/build/pdf.worker?worker";

// // ✅ Fix for Vite
// pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

// // 🔹 Strict parser (unchanged)
// function parseQuestions(rawText) {
//   const questions = [];
//   const answerKey = {};

//   const [content, answersPart] = rawText.split("उत्तर ताललका");

//   if (answersPart) {
//     const answerLines = answersPart.split("\n");
//     answerLines.forEach((line) => {
//       const parts = line.trim().split(/\s+/);
//       for (let i = 0; i < parts.length; i += 2) {
//         const qNo = parseInt(parts[i]);
//         const ansIdx = parseInt(parts[i + 1]);
//         if (!isNaN(qNo) && !isNaN(ansIdx)) {
//           answerKey[qNo] = ansIdx;
//         }
//       }
//     });
//   }

//   const lines = content
//     .split("\n")
//     .map((l) => l.trim())
//     .filter(Boolean);

//   let currentQ = null;
//   let lastOptIndex = null;

//   lines.forEach((line) => {
//     const qMatch = line.match(/^(\d+)\.\s*(.*)/);
//     if (qMatch) {
//       if (currentQ) {
//         while (currentQ.options.length < 4) currentQ.options.push("");
//         questions.push(currentQ);
//       }
//       currentQ = {
//         id: parseInt(qMatch[1]),
//         question: qMatch[2].trim(),
//         options: [],
//         correctAnswer: "",
//         explanation: "",
//       };
//       lastOptIndex = null;
//       return;
//     }

//     const optMatch = line.match(/^([1-4])\)\s*(.*)/);
//     if (optMatch && currentQ) {
//       const optIndex = parseInt(optMatch[1]) - 1;
//       currentQ.options[optIndex] = optMatch[2].trim();
//       lastOptIndex = optIndex;
//       return;
//     }

//     if (lastOptIndex !== null && currentQ) {
//       currentQ.options[lastOptIndex] += " " + line.trim();
//       return;
//     }

//     if (currentQ) {
//       currentQ.question += " " + line;
//     }
//   });

//   if (currentQ) {
//     while (currentQ.options.length < 4) currentQ.options.push("");
//     questions.push(currentQ);
//   }

//   questions.forEach((q) => {
//     const ansIdx = answerKey[q.id];
//     if (ansIdx && q.options[ansIdx - 1]) {
//       q.correctAnswer = q.options[ansIdx - 1];
//     }
//   });

//   return questions;
// }

// export default function UploadQp() {
//   const [questions, setQuestions] = useState([]);
//   const [papers, setPapers] = useState([]);
//   const [selected, setSelected] = useState([]);
//   const fileInputRef = useRef(null);

//   // Handle PDF Upload
//   const handlePdfUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = async function () {
//       const typedarray = new Uint8Array(this.result);
//       const pdf = await pdfjsLib.getDocument(typedarray).promise;

//       let text = "";
//       for (let i = 1; i <= pdf.numPages; i++) {
//         const page = await pdf.getPage(i);
//         const content = await page.getTextContent();
//         const strings = content.items.map((item) => item.str);
//         text += strings.join("\n") + "\n";
//       }

//       const parsed = parseQuestions(text);
//       setQuestions(parsed);

//       if (fileInputRef.current) fileInputRef.current.value = "";
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   // Save current structured questions as a "paper"
//   const handleSavePaper = () => {
//     if (!questions.length) return;
//     const newPaper = {
//       id: Date.now(), // ✅ unique ID using timestamp
//       title: `Paper ${papers.length + 1}`,
//       questions: [...questions],
//     };
//     setPapers([...papers, newPaper]);
//     setQuestions([]);
//   };

//   // Edit saved paper
//   const handleEditPaper = (paperId) => {
//     const paper = papers.find((p) => p.id === paperId);
//     if (paper) {
//       setQuestions(paper.questions);
//       setPapers(papers.filter((p) => p.id !== paperId));
//     }
//   };

//   // Select/Deselect papers
//   const toggleSelect = (id) => {
//     setSelected((prev) =>
//       prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
//     );
//   };

//   // Submit selected papers
//   const handleSubmit = () => {
//     const selectedPapers = papers.filter((p) => selected.includes(p.id));
//     console.log("Bulk Upload Data:", selectedPapers);
//     alert(`${selectedPapers.length} papers submitted successfully!`);
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Paper
//         elevation={2}
//         sx={{
//           p: 2,
//           mb: 2,
//           borderRadius: 1,
//           bgcolor: "linear-gradient(135deg, #fff5e6, #fff)",
//           border: "0.5px solid #f0c27b",
//         }}
//       >
//         <Typography variant="body1" sx={{ fontWeight: 500, color: "#444" }}>
//           इथे तुम्ही तुमच्या प्रश्नपत्रिका PDF फॉरमॅटमध्ये अपलोड करू शकता. अपलोड
//           केल्यावर, तुम्ही त्यांना एडिट करून वेगवेगळे मसुदे (drafts) तयार करू
//           शकता. तुम्ही एकावेळी 10 प्रश्नपत्रिका निवडू शकता आणि त्या एकत्रितपणे
//           सबमिट करू शकता.
//         </Typography>
//       </Paper>

//       {/* Upload PDF */}
//       <Button
//         variant="contained"
//         component="label"
//         sx={{ my: 1 }}
//         disabled={questions.length > 0}
//       >
//         नवीन प्रश्नपत्रिका अपलोड करा
//         <input
//           ref={fileInputRef}
//           hidden
//           type="file"
//           accept="application/pdf"
//           onChange={handlePdfUpload}
//         />
//       </Button>

//       {/* Structured Questions Editor */}
//       {questions.length > 0 && (
//         <Box sx={{ mb: 3 }}>
//           <Typography variant="h6">Edit Extracted Questions</Typography>

//           {questions.map((q, idx) => (
//             <Paper
//               key={`${q.id}-${idx}`}
//               sx={{ p: 2, my: 2, border: "1px solid #ddd", borderRadius: 2 }}
//             >
//               <TextField
//                 fullWidth
//                 label={`Q${q.id}`}
//                 value={q.question}
//                 onChange={(e) => {
//                   const copy = [...questions];
//                   copy[idx].question = e.target.value;
//                   setQuestions(copy);
//                 }}
//                 sx={{ mb: 2 }}
//               />

//               {q.options.map((opt, i) => (
//                 <TextField
//                   key={`${q.id}-opt-${i}`}
//                   fullWidth
//                   value={opt}
//                   label={`Option ${i + 1}`}
//                   onChange={(e) => {
//                     const copy = [...questions];
//                     copy[idx].options[i] = e.target.value;
//                     setQuestions(copy);
//                   }}
//                   sx={{ mb: 1 }}
//                 />
//               ))}

//               <TextField
//                 fullWidth
//                 label="Correct Answer"
//                 value={q.correctAnswer}
//                 onChange={(e) => {
//                   const copy = [...questions];
//                   copy[idx].correctAnswer = e.target.value;
//                   setQuestions(copy);
//                 }}
//                 sx={{ mb: 2 }}
//               />

//               <TextField
//                 fullWidth
//                 label="Explanation"
//                 multiline
//                 value={q.explanation}
//                 onChange={(e) => {
//                   const copy = [...questions];
//                   copy[idx].explanation = e.target.value;
//                   setQuestions(copy);
//                 }}
//               />
//             </Paper>
//           ))}

//           <Button variant="outlined" onClick={handleSavePaper}>
//             Save Paper
//           </Button>
//         </Box>
//       )}

//       <Divider sx={{ my: 3 }} />

//       {/* Saved Papers List */}
//       <Typography variant="h6">सेव्ह केलेल्या प्रश्नपत्रिका</Typography>
//       <List>
//         {papers.map((paper) => (
//           <ListItem
//             key={paper.id} // ✅ now unique always
//             secondaryAction={
//               <Button onClick={() => handleEditPaper(paper.id)}>Edit</Button>
//             }
//           >
//             <ListItemIcon>
//               <Checkbox
//                 color="secondary"
//                 checked={selected.includes(paper.id)}
//                 onChange={() => toggleSelect(paper.id)}
//               />
//             </ListItemIcon>
//             <ListItemText
//               primary={paper.title}
//               secondary={`${paper.questions.length} questions`}
//             />
//           </ListItem>
//         ))}
//       </List>

//       {papers.length > 0 && (
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={handleSubmit}
//           sx={{ mt: 2 }}
//           disabled={selected.length === 0 || selected.length > 15}
//         >
//           Submit Selected Papers
//         </Button>
//       )}
//     </Box>
//   );
// }
