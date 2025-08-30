// src/pages/PapersManager.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
} from "@mui/material";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import { Link } from "react-router-dom";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function PapersManager() {
  const [title, setTitle] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [papers, setPapers] = useState([]);

  // Load saved papers from localStorage on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("papers")) || [];
    setPapers(stored);
  }, []);

  // Upload & extract text
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function () {
      const typedArray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let textContent = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        const pageText = text.items.map((s) => s.str).join(" ");
        textContent += pageText + "\n\n";
      }

      console.log("RAW TEXT:", textContent);
      parsePaperText(textContent);
    };
    reader.readAsArrayBuffer(file);
  };

  // Parse text into structured questions
  const parsePaperText = (text) => {
    const lines = text.split(/\r?\n/);
    const questions = [];
    let currentQ = null;

    lines.forEach((line) => {
      line = line.trim();
      if (!line) return;

      // Question (1., Q1, प्रश्न क्र.)
      if (/^(\d+\.)|^(Q\d+)|^(प्रश्न)/i.test(line)) {
        if (currentQ) questions.push(currentQ);
        currentQ = {
          id: questions.length + 1,
          question: line
            .replace(/^(\d+\.?|Q\d+\.?|प्रश्न\s*क्र\.?\s*\d+)?/i, "")
            .trim(),
          options: [],
          answer: "",
        };
      }
      // Options
      else if (/^([a-dA-D][\).]|[अ-ड]\))/u.test(line)) {
        if (currentQ) {
          currentQ.options.push(
            line.replace(/^([a-dA-D][\).]|[अ-ड]\))/u, "").trim()
          );
        }
      }
      // Answer
      else if (/^(Answer|उत्तर)/i.test(line)) {
        if (currentQ) {
          currentQ.answer = line
            .replace(/^(Answer|उत्तर)[:：]?\s*/i, "")
            .trim();
        }
      }
    });

    if (currentQ) questions.push(currentQ);
    setParsedQuestions(questions);
  };

  // Save paper
  const savePaper = () => {
    if (!title || parsedQuestions.length === 0) {
      alert("Please add title and upload valid PDF");
      return;
    }

    const newPaper = {
      id: `paper-${Date.now()}`,
      title,
      questions: parsedQuestions,
    };

    const updated = [...papers, newPaper];
    setPapers(updated);
    localStorage.setItem("papers", JSON.stringify(updated));

    alert("Paper saved ✅");
    setTitle("");
    setParsedQuestions([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Papers Manager
      </Typography>

      {/* Upload New Paper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upload New Paper (PDF → JSON)
          </Typography>

          <TextField
            label="Paper Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button variant="outlined" component="label">
            Upload PDF
            <input
              type="file"
              hidden
              accept="application/pdf"
              onChange={handleFileUpload}
            />
          </Button>

          {/* Preview */}
          {parsedQuestions.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Parsed Preview</Typography>
              {parsedQuestions.map((q) => (
                <Box key={q.id} sx={{ mb: 2 }}>
                  <Typography>
                    <b>Q{q.id}.</b> {q.question}
                  </Typography>
                  {q.options.map((opt, i) => (
                    <Typography key={i}>
                      {String.fromCharCode(97 + i)}) {opt}
                    </Typography>
                  ))}
                  <Typography color="green">Answer: {q.answer}</Typography>
                </Box>
              ))}
            </Box>
          )}

          <Button
            variant="contained"
            sx={{
              mt: 2,
              background: "linear-gradient(135deg, #de6925, #f8b14a)",
              color: "#fff",
            }}
            onClick={savePaper}
          >
            Save Paper
          </Button>
        </CardContent>
      </Card>

      {/* List Existing Papers */}
      <Typography variant="h5" gutterBottom>
        Available Papers
      </Typography>
      {papers.map((paper) => (
        <Card key={paper.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{paper.title}</Typography>
            <Button
              variant="contained"
              sx={{ mt: 1 }}
              component={Link}
              to={`/list/${paper.id}`}
            >
              Start Paper
            </Button>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
