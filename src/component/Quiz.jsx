import React, { useState, useEffect, useCallback } from "react";
import { getMagazineQuiz } from "../services/api";

const QuizAnalysis = ({ score, totalQuestions, onClose }) => {
  const getPerformance = () => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage <= 25)
      return { text: "सुधारणेची गरज आहे", color: "#f44336" }; // Needs Improvement
    if (percentage <= 60) return { text: "सरासरी", color: "#ff9800" }; // Average
    if (percentage <= 80) return { text: "उत्तम", color: "#4caf50" }; // Good
    return { text: "अतिशय उत्कृष्ट!", color: "#6a1b9a" }; // Excellent
  };

  const performance = getPerformance();

  return (
    <div style={styles.modalOverlay}>
      <div style={{ ...styles.modalContent, textAlign: "center" }}>
        <h2 style={{ color: performance.color, fontSize: "28px" }}>
          क्विझ पूर्ण झाली!
        </h2>
        <p style={{ fontSize: "18px" }}>तुमचा निकाल:</p>
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
          बंद करा (Close)
        </button>
      </div>
    </div>
  );
};

const Quiz = ({ magazineId, onClose }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // Stores { questionIndex: selectedOption }
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(15);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [maxReachedIndex, setMaxReachedIndex] = useState(0);

  // Marathi Error Mapping Logic
  const getMarathiMessage = (msg) => {
    if (!msg) return "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.";

    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes("subscription")) {
      return "ही क्विझ सोडवण्यासाठी तुमच्याकडे सक्रिय सबस्क्रिप्शन असणे आवश्यक आहे.";
    }
    if (lowerMsg.includes("not found")) {
      return "माहिती सापडली नाही. कृपया पुन्हा तपासा.";
    }
    if (lowerMsg.includes("no quiz questions")) {
      // Specifically for your 404 backend response
      return "या मासिकासाठी सध्या कोणतेही प्रश्न उपलब्ध नाहीत.";
    }

    // Default generic error in Marathi
    return "माहिती लोड करण्यात अडचण आली. कृपया नंतर प्रयत्न करा.";
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const quizData = await getMagazineQuiz(magazineId);
        setQuestions(quizData);
      } catch (err) {
        const backendMessage = err.response?.data?.message || err.message;
        setError(getMarathiMessage(backendMessage));
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, [magazineId]);

  const goToNextQuestion = useCallback(() => {
    setShowAnswer(false);
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      if (nextIndex > maxReachedIndex) {
        setMaxReachedIndex(nextIndex);
      }
      setTimer(15);
    } else {
      setQuizFinished(true);
    }
  }, [currentQuestionIndex, questions.length, maxReachedIndex]);

  useEffect(() => {
    const isCurrentQuestionAnswered = answers.hasOwnProperty(
      currentQuestionIndex
    );
    if (isCurrentQuestionAnswered) {
      setShowAnswer(true); // Persist showing the answer if already answered
      return; // No timer for answered questions
    }

    if (showAnswer) {
      const timeout = setTimeout(goToNextQuestion, 3000);
      return () => clearTimeout(timeout);
    }

    if (!isLoading && questions.length > 0 && !quizFinished) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            // Auto-skip if timer runs out
            setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: null }));
            setShowAnswer(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [
    showAnswer,
    isLoading,
    questions.length,
    quizFinished,
    goToNextQuestion,
    answers,
    currentQuestionIndex,
  ]);

  const handleOptionSelect = (index) => {
    if (showAnswer) return;
    setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: index }));
    if (index === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
    setShowAnswer(true);
  };

  const handleNavigate = (direction) => {
    const newIndex = currentQuestionIndex + direction;
    if (newIndex >= 0 && newIndex <= maxReachedIndex) {
      setCurrentQuestionIndex(newIndex);
      setShowAnswer(answers.hasOwnProperty(newIndex));
      setTimer(15); // Reset timer for safety, though it won't run on answered Qs
    }
  };

  if (isLoading) {
    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div style={loadingStyles.spinner}></div>
            <p style={{ marginTop: "20px", color: "#555", fontSize: "16px" }}>
              लोड होत आहे...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <div style={{ textAlign: "center", padding: "20px" }}>
            <h2 style={{ color: "#f44336", marginBottom: "15px" }}>क्षमस्व!</h2>
            <p
              style={{
                color: "#555",
                fontSize: "16px",
                marginBottom: "25px",
                lineHeight: "1.6",
              }}
            >
              {error}
            </p>
            <button onClick={onClose} style={styles.nextButton}>
              बंद करा
            </button>
          </div>
        </div>
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
  const selectedOption = answers[currentQuestionIndex];

  const getOptionStyle = (index) => {
    if (!showAnswer) {
      return {}; // No style if answer is not shown yet
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
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.header}>
          <button onClick={onClose} style={styles.closeButton}>
            ✕
          </button>
          <div style={styles.timerContainer}>
            <div style={styles.timer}>
              {answers.hasOwnProperty(currentQuestionIndex) ? "✓" : timer}
            </div>
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
          <div style={styles.navigationButtons}>
            <button
              onClick={() => handleNavigate(-1)}
              disabled={currentQuestionIndex === 0}
              style={styles.navButton}
            >
              {"<"} पूर्वीचे
            </button>
            <span style={styles.progressText}>
              {currentQuestionIndex + 1} / {questions.length}
            </span>
            {currentQuestionIndex < maxReachedIndex ? (
              <button
                onClick={() => handleNavigate(1)}
                style={styles.navButton}
              >
                पुढील {">"}
              </button>
            ) : (
              <button onClick={goToNextQuestion} style={styles.navButton}>
                {answers.hasOwnProperty(currentQuestionIndex)
                  ? "पुढील"
                  : "वगळा"}{" "}
                {">"}
              </button>
            )}
          </div>
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
    overflow: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
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
    paddingTop: "10px",
  },
  navigationButtons: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navButton: {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    "&:disabled": {
      background: "#ccc",
      cursor: "not-allowed",
    },
  },
  progressText: {
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    borderRadius: "25%",
    border: "1px solid transparent",
    width: "40px",
    height: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "18px",
    fontWeight: "bold",
    fontFamily: "inherit",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#ffffff",
    cursor: "pointer",
    transition: "all 0.25s",
    padding: 0,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
};
const loadingStyles = {
  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid #f3f3f3",
    borderTop: "5px solid #667eea",
    borderRadius: "50%",
    margin: "0 auto",
    animation: "spin 1s linear infinite",
  },
};

export default Quiz;
