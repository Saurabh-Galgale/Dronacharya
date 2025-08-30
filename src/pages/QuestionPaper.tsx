// src/pages/QuestionPaper.js
import React, { useState } from "react";
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
  Stack,
} from "@mui/material";
import mockData from "../mockData";

const QuestionPaper = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();

  const paper = mockData.find((p) => p.id === paperId);

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = () => {
    let correct = 0;
    let attempted = 0;

    paper.questions.forEach((q) => {
      if (answers[q.id]) {
        attempted++;
        if (answers[q.id] === q.correctAnswer) {
          correct++;
        }
      }
    });

    const wrong = attempted - correct;
    const totalQuestions = paper.questions.length;
    const unattempted = totalQuestions - attempted;

    // two different metrics
    const accuracyPercent =
      attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const scorePercent = Math.round((correct / totalQuestions) * 100);

    // Build result object
    const result = {
      paperId: paper.id,
      title: paper.title,
      subject: paper.subject || "General",
      date: new Date().toISOString(),
      attempted,
      correct,
      wrong,
      unattempted,
      accuracyPercent, // based only on attempted
      scorePercent, // based on all questions
      totalQuestions,
    };

    // Get existing stats from localStorage
    let storedStats = JSON.parse(localStorage.getItem("papersStats")) || [];

    // Check if this paper already exists (update instead of duplicate)
    const existingIndex = storedStats.findIndex((p) => p.paperId === paper.id);
    if (existingIndex >= 0) {
      storedStats[existingIndex] = result;
    } else {
      storedStats.push(result);
    }

    // Save back to localStorage
    localStorage.setItem("papersStats", JSON.stringify(storedStats));

    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setAnswers({});
  };

  if (!paper) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Paper not found
        </Typography>
        <Button variant="contained" onClick={() => navigate("/papers")}>
          Back to Papers
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {paper.title}
      </Typography>

      {paper.questions.map((q) => (
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
                  control={<Radio color="secondary" />}
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
                    color: answers[q.id] === q.correctAnswer ? "green" : "red",
                    fontWeight: 600,
                  }}
                >
                  Your Answer: {answers[q.id] ?? "Not selected"}
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  Correct Answer: <strong>{q.correctAnswer}</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {q.explanation}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}

      <Stack direction="row" spacing={2} mt={2}>
        {!submitted ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length === 0}
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
      </Stack>
    </Box>
  );
};

export default QuestionPaper;
