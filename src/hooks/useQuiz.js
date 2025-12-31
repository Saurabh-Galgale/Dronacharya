import { useState, useEffect, useCallback } from "react";
import { getMagazineQuiz } from "../services/api";

export const useQuiz = (magazineId) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizData = await getMagazineQuiz(magazineId);
        setQuestions(quizData);
      } catch (err) {
        setError("Failed to load the quiz. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [magazineId]);

  const handleAnswer = useCallback((isCorrect) => {
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    moveToNextQuestion();
  }, []);

  const moveToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsQuizFinished(true);
    }
  }, [currentQuestionIndex, questions.length]);

  return {
    questions,
    currentQuestion: questions[currentQuestionIndex],
    currentQuestionIndex,
    score,
    isQuizFinished,
    isLoading,
    error,
    handleAnswer,
    totalQuestions: questions.length,
  };
};
