import React, { useState, useEffect, useCallback } from "react";
import { getMagazineQuiz } from "../services/api";

const QuizAnalysis = ({ score, totalQuestions, onClose }) => {
  const getPerformance = () => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage <= 25) return { text: "Needs Improvement", color: "#f44336" };
    if (percentage <= 60) return { text: "Average", color: "#ff9800" };
    if (percentage <= 80) return { text: "Good", color: "#4caf50" };
    return { text: "Excellent!", color: "#6a1b9a" };
  };

  const performance = getPerformance();

  return (
    <div className="quiz-modal" style={styles.modalOverlay}>
      <div style={{ ...styles.modalContent, textAlign: "center" }}>
        <h2 style={{ color: performance.color, fontSize: "28px" }}>
          Quiz Complete!
        </h2>
        <p style={{ fontSize: "18px" }}>Your Score:</p>
        <p style={{ fontSize: "48px", fontWeight: "bold", margin: "10px 0" }}>
          {score} / {totalQuestions}
        </p>
        <p style={{ fontSize: "22px", color: performance.color }}>
          {performance.text}
        </p>
        <button
          onClick={onClose}
          style={{ ...styles.nextButton, marginTop: "30px" }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const Quiz = ({ magazineId, onClose }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(15);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizData = await getMagazineQuiz(magazineId);
        setQuestions(quizData);
      } catch (_error) {
        setError("Failed to load quiz. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, [magazineId]);

  const handleNextQuestion = useCallback(() => {
    setShowAnswer(false);
    setSelectedOption(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimer(15);
    } else {
      setQuizFinished(true);
    }
  }, [currentQuestionIndex, questions.length]);

  useEffect(() => {
    if (showAnswer) {
      const timeout = setTimeout(handleNextQuestion, 5000);
      return () => clearTimeout(timeout);
    }

    if (!isLoading && questions.length > 0 && !quizFinished) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            setShowAnswer(true); // Times up, show answer
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showAnswer, isLoading, questions.length, quizFinished, handleNextQuestion]);

  const handleOptionSelect = (index) => {
    if (showAnswer) return;
    setSelectedOption(index);
    if (index === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
    setShowAnswer(true);
  };

  const handleSkipOrNext = () => {
    if (selectedOption === null) {
      // User is skipping the question
      setShowAnswer(true); // This will trigger the 5-second answer display
    } else {
      // User has answered and is moving to the next question
      handleNextQuestion();
    }
  };

  if (isLoading) {
    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>{error}</div>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <QuizAnalysis
        score={score}
        totalQuestions={questions.length}
        onClose={onClose}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const getOptionStyle = (index) => {
    if (!showAnswer) {
      return selectedOption === index ? styles.selectedOption : {};
    }
    if (index === currentQuestion.correctAnswer) {
      return styles.correctOption;
    }
    if (index === selectedOption) {
      return styles.incorrectOption;
    }
    return {};
  };

  return (
    <div className="quiz-modal" style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.header}>
          <button onClick={onClose} style={styles.closeButton}>
            ✕
          </button>
          <div style={styles.timerContainer}>
            <div style={styles.timer}>{timer}</div>
          </div>
        </div>
        <div style={styles.questionContainer}>
          <p style={styles.questionText}>{currentQuestion.text}</p>
        </div>
        <div style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(index)}
              style={{
                ...styles.optionButton,
                ...getOptionStyle(index),
              }}
              disabled={showAnswer}
            >
              <span style={styles.optionIndex}>
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          ))}
        </div>
        <div style={styles.footer}>
          <button onClick={handleSkipOrNext} style={styles.nextButton}>
            {selectedOption === null ? "Skip" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "20px",
    padding: "20px",
    width: "90%",
    maxWidth: "400px",
    height: "auto",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
  },
  timerContainer: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    border: "4px solid #6a1b9a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#6a1b9a",
    fontWeight: "bold",
    fontSize: "20px",
  },
  questionContainer: {
    marginBottom: "20px",
  },
  questionText: {
    fontSize: "18px",
    fontWeight: "600",
    lineHeight: "1.5",
  },
  optionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
  },
  optionButton: {
    display: "flex",
    alignItems: "center",
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    backgroundColor: "#f8f9fa",
    textAlign: "left",
    cursor: "pointer",
    width: "100%",
    fontSize: "16px",
    transition: "background-color 0.3s, border-color 0.3s",
  },
  selectedOption: {
    borderColor: "#6a1b9a",
    backgroundColor: "#f3e5f5",
  },
  correctOption: {
    borderColor: "#4caf50",
    backgroundColor: "#e8f5e9",
  },
  incorrectOption: {
    borderColor: "#f44336",
    backgroundColor: "#ffebee",
  },
  optionIndex: {
    marginRight: "10px",
    fontWeight: "bold",
    color: "#6a1b9a",
  },
  footer: {
    marginTop: "auto",
  },
  nextButton: {
    width: "100%",
    padding: "16px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default Quiz;
