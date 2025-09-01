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
} from "@mui/material";
import * as pdfjsLib from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker?worker";

// ✅ Fix for Vite
pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

// 🔹 Strict parser (unchanged)
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
    const qMatch = line.match(/^(\d+)\.\s*(.*)/);
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

    const optMatch = line.match(/^([1-4])\)\s*(.*)/);
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

export default function UploadQp() {
  const [questions, setQuestions] = useState([]);
  const [papers, setPapers] = useState([]);
  const [selected, setSelected] = useState([]);
  const fileInputRef = useRef(null);

  // Handle PDF Upload
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function () {
      const typedarray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument(typedarray).promise;

      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item) => item.str);
        text += strings.join("\n") + "\n";
      }

      const parsed = parseQuestions(text);
      setQuestions(parsed);

      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsArrayBuffer(file);
  };

  // Save current structured questions as a "paper"
  const handleSavePaper = () => {
    if (!questions.length) return;
    const newPaper = {
      id: Date.now(), // ✅ unique ID using timestamp
      title: `Paper ${papers.length + 1}`,
      questions: [...questions],
    };
    setPapers([...papers, newPaper]);
    setQuestions([]);
  };

  // Edit saved paper
  const handleEditPaper = (paperId) => {
    const paper = papers.find((p) => p.id === paperId);
    if (paper) {
      setQuestions(paper.questions);
      setPapers(papers.filter((p) => p.id !== paperId));
    }
  };

  // Select/Deselect papers
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // Submit selected papers
  const handleSubmit = () => {
    const selectedPapers = papers.filter((p) => selected.includes(p.id));
    console.log("Bulk Upload Data:", selectedPapers);
    alert(`${selectedPapers.length} papers submitted successfully!`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 1,
          bgcolor: "linear-gradient(135deg, #fff5e6, #fff)",
          border: "0.5px solid #f0c27b",
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 500, color: "#444" }}>
          इथे तुम्ही तुमच्या प्रश्नपत्रिका PDF फॉरमॅटमध्ये अपलोड करू शकता. अपलोड
          केल्यावर, तुम्ही त्यांना एडिट करून वेगवेगळे मसुदे (drafts) तयार करू
          शकता. तुम्ही एकावेळी 10 प्रश्नपत्रिका निवडू शकता आणि त्या एकत्रितपणे
          सबमिट करू शकता.
        </Typography>
      </Paper>

      {/* Upload PDF */}
      <Button
        variant="contained"
        component="label"
        sx={{ my: 1 }}
        disabled={questions.length > 0}
      >
        नवीन प्रश्नपत्रिका अपलोड करा
        <input
          ref={fileInputRef}
          hidden
          type="file"
          accept="application/pdf"
          onChange={handlePdfUpload}
        />
      </Button>

      {/* Structured Questions Editor */}
      {questions.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Edit Extracted Questions</Typography>

          {questions.map((q, idx) => (
            <Paper
              key={`${q.id}-${idx}`}
              sx={{ p: 2, my: 2, border: "1px solid #ddd", borderRadius: 2 }}
            >
              <TextField
                fullWidth
                label={`Q${q.id}`}
                value={q.question}
                onChange={(e) => {
                  const copy = [...questions];
                  copy[idx].question = e.target.value;
                  setQuestions(copy);
                }}
                sx={{ mb: 2 }}
              />

              {q.options.map((opt, i) => (
                <TextField
                  key={`${q.id}-opt-${i}`}
                  fullWidth
                  value={opt}
                  label={`Option ${i + 1}`}
                  onChange={(e) => {
                    const copy = [...questions];
                    copy[idx].options[i] = e.target.value;
                    setQuestions(copy);
                  }}
                  sx={{ mb: 1 }}
                />
              ))}

              <TextField
                fullWidth
                label="Correct Answer"
                value={q.correctAnswer}
                onChange={(e) => {
                  const copy = [...questions];
                  copy[idx].correctAnswer = e.target.value;
                  setQuestions(copy);
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Explanation"
                multiline
                value={q.explanation}
                onChange={(e) => {
                  const copy = [...questions];
                  copy[idx].explanation = e.target.value;
                  setQuestions(copy);
                }}
              />
            </Paper>
          ))}

          <Button variant="outlined" onClick={handleSavePaper}>
            Save Paper
          </Button>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Saved Papers List */}
      <Typography variant="h6">सेव्ह केलेल्या प्रश्नपत्रिका</Typography>
      <List>
        {papers.map((paper) => (
          <ListItem
            key={paper.id} // ✅ now unique always
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
              secondary={`${paper.questions.length} questions`}
            />
          </ListItem>
        ))}
      </List>

      {papers.length > 0 && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{ mt: 2 }}
          disabled={selected.length === 0 || selected.length > 15}
        >
          Submit Selected Papers
        </Button>
      )}
    </Box>
  );
}
