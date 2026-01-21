import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { getMagazines, getMagazineById } from "../services/api";
import { getStoredUserProfile } from "../services/authService";
import Quiz from "../component/Quiz";
import { getSimpleCache, setSimpleCache } from "../utils/sessionCache";

const gradients = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)",
  "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
  "linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)",
  "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
];

const monthTranslations = {
  january: "जानेवारी",
  february: "फेब्रुवारी",
  march: "मार्च",
  april: "एप्रिल",
  may: "मे",
  june: "जून",
  july: "जुलै",
  august: "ऑगस्ट",
  september: "सप्टेंबर",
  october: "ऑक्टोबर",
  november: "नोव्हेंबर",
  december: "डिसेंबर",
};

const getMarathiMonth = (englishMonth) => {
  if (!englishMonth) return "";
  return monthTranslations[englishMonth.toLowerCase()] || englishMonth;
};

const getMarathiMessage = (msg) => {
  if (!msg) return "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.";
  const lowerMsg = msg.toLowerCase();

  if (lowerMsg.includes("subscription")) {
    return "हे मासिक वाचण्यासाठी तुमच्याकडे सक्रिय सबस्क्रिप्शन (Active Subscription) असणे आवश्यक आहे.";
  }
  if (lowerMsg.includes("not found")) {
    return "माहिती सापडली नाही. कृपया पुन्हा तपासा.";
  }
  return "माहिती लोड करण्यात अडचण आली. कृपया नंतर प्रयत्न करा.";
};

const userProfile = getStoredUserProfile();
const isSubscribed = userProfile?.subscription?.active || false;

const MagazineCard = ({
  magazine,
  isOpen,
  onToggle,
  onNavigateToMagazine,
  onOpenQuiz,
  index,
}) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (isOpen && cardRef.current) {
      setTimeout(() => {
        cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);
    }
  }, [isOpen]);

  const gradient = gradients[index % gradients.length];
  const isLocked = !magazine.isFree;

  return (
    <div
      className="magazine-card"
      ref={cardRef}
      style={{
        marginBottom: "24px",
        width: "100%",
        perspective: "2000px",
        height: isOpen ? "350px" : "200px",
        transition: "height 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        onClick={onToggle}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isOpen ? "rotateY(180deg)" : "rotateY(0deg)",
          cursor: "pointer",
        }}
      >
        {/* FRONT CARD */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: gradient,
            color: "white",
            borderRadius: "24px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            overflow: "hidden",
            zIndex: 2,
          }}
        >
          <div
            style={{
              padding: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "4px 12px",
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                color: "white",
                fontWeight: 600,
                borderRadius: "12px",
                fontSize: "13px",
              }}
            >
              {magazine.year}
            </span>

            {isLocked && !isSubscribed ? (
              <div
                style={{
                  backgroundColor: "rgba(0,0,0,0.3)",
                  padding: "6px 10px",
                  borderRadius: "10px",
                  fontSize: "18px",
                  backdropFilter: "blur(4px)",
                }}
              >
                🔒
              </div>
            ) : null}
          </div>
          <div style={{ padding: "0 24px 24px" }}>
            <h2
              style={{ fontSize: "32px", fontWeight: 900, marginBottom: "8px" }}
            >
              {getMarathiMonth(magazine.month)}
            </h2>
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                opacity: 0.9,
              }}
            >
              <span>📚</span>
              <span style={{ fontSize: "14px" }}>
                {isLocked && !isSubscribed
                  ? "Premium मासिक"
                  : "मराठीत उपलब्ध मासिक"}
              </span>
            </div>
          </div>
        </div>

        {/* BACK CARD */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            display: "flex",
            flexDirection: "column",
            borderRadius: "24px",
            backgroundColor: "#ffffff",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              background: gradient,
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
                {getMarathiMonth(magazine.month)} {magazine.year}
              </h3>
              {isLocked && !isSubscribed ? (
                <span title="Subscription Required">🔒</span>
              ) : null}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              backgroundColor: "#fff",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                flexGrow: 1,
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#333",
                  mb: 1,
                  fontSize: "1rem",
                }}
              >
                या मासिकातील प्रमुख विषय:
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#666", lineHeight: 1.6, fontSize: "0.9rem" }}
              >
                {magazine.indexContent || "अनुक्रमणिका लवकरच उपलब्ध होईल."}
              </Typography>
            </div>

            <div
              style={{
                padding: "16px 20px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                backgroundColor: "#fff",
                borderTop: "1px solid #eee",
                flexShrink: 0,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToMagazine(magazine._id);
                }}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "14px",
                  background: gradient,
                  border: "none",
                  color: "white",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "15px",
                }}
              >
                {isLocked && !isSubscribed ? "🔒 अनलॉक करा" : "📈 पूर्ण वाचा"}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenQuiz(magazine._id);
                }}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "14px",
                  background: "#f8f9fa",
                  border: "1px solid #e0e0e0",
                  color: "#333",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "15px",
                }}
              >
                📝 मॅगझिन आधारित प्रश्न
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MagazinePage = () => {
  const navigate = useNavigate();
  const [magazines, setMagazines] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubscriptionError, setIsSubscriptionError] = useState(false);
  const [openMonthIndex, setOpenMonthIndex] = useState(null);
  const [selectedMagazineId, setSelectedMagazineId] = useState(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  useEffect(() => {
    const fetchMagazines = async () => {
      setIsLoading(true);
      try {
        // Caching for paginated data can be complex; fetching fresh for simplicity.
        const data = await getMagazines(page);
        setMagazines((prev) => [...prev, ...data.magazines]);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        const backendMessage = err.response?.data?.message || err.message;
        setError(getMarathiMessage(backendMessage));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMagazines();
  }, [page]);

  const handleNavigateToMagazine = (magazineId) => {
    const magazine = magazines.find((m) => m._id === magazineId);
    if (magazine && !magazine.isFree && !isSubscribed) {
      setError(getMarathiMessage("subscription required"));
      setIsSubscriptionError(true);
      return;
    }
    navigate(`/ca/${magazineId}`);
  };

  const handleOpenQuiz = (magazineId) => {
    const magazine = magazines.find((m) => m._id === magazineId);
    if (magazine && !magazine.isFree && !isSubscribed) {
      setError(getMarathiMessage("subscription required"));
      setIsSubscriptionError(true);
      return;
    }
    setSelectedMagazineId(magazineId);
    setIsQuizOpen(true);
  };

  const handleGoToSubscription = () => {
    navigate("/subscription");
  };

  if (magazines.length === 0 && isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <div style={errorStyles.overlay}>
        <div style={errorStyles.content}>
          <div style={{ textAlign: "center", padding: "10px" }}>
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

            {isSubscriptionError ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <button
                  onClick={handleGoToSubscription}
                  style={{
                    ...errorStyles.closeButton,
                    background:
                      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                  }}
                >
                  📦 सबस्क्रिप्शन घ्या
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    setIsSubscriptionError(false);
                  }}
                  style={{
                    ...errorStyles.closeButton,
                    background: "#f8f9fa",
                    color: "#333",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  बंद करा
                </button>
              </div>
            ) : (
              <button
                onClick={() => setError(null)}
                style={errorStyles.closeButton}
              >
                बंद करा
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        paddingBottom: "50px",
        marginLeft: 12,
        marginRight: 12,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          mb: 4,
          textAlign: "center",
        }}
      >
        <Box sx={{ position: "relative" }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              paddingTop: 2,
              paddingBottom: 1,
              fontWeight: 900,
              background:
                "linear-gradient(135deg, #de6925 0%, #f39c12 50%, #e67e22 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              textShadow: "0 4px 12px rgba(222, 105, 37, 0.15)",
            }}
          >
            चालू घडामोडी मासिके
          </Typography>

          <Box
            sx={{
              position: "absolute",
              bottom: -8,
              left: "50%",
              transform: "translateX(-50%)",
              width: "60%",
              height: "4px",
              background:
                "linear-gradient(90deg, transparent, #de6925, transparent)",
              borderRadius: "2px",
              animation: "glow 2s ease-in-out infinite",
              "@keyframes glow": {
                "0%, 100%": {
                  opacity: 0.5,
                  width: "60%",
                },
                "50%": {
                  opacity: 1,
                  width: "70%",
                },
              },
            }}
          />
        </Box>

        <Typography
          variant="h6"
          sx={{
            color: "#666",
            fontWeight: 600,
            fontSize: { xs: "1rem", sm: "1.15rem", md: "1.25rem" },
            maxWidth: "600px",
            mt: 1,
          }}
        >
          📚 संपूर्ण महिन्याचे महत्त्वाचे विषय एका ठिकाणी
        </Typography>
      </Box>

      {magazines.map((magazine, index) => (
        <MagazineCard
          key={magazine._id}
          magazine={magazine}
          index={index}
          isOpen={openMonthIndex === index}
          onToggle={() =>
            setOpenMonthIndex(openMonthIndex === index ? null : index)
          }
          onNavigateToMagazine={handleNavigateToMagazine}
          onOpenQuiz={handleOpenQuiz}
        />
      ))}

      <Box sx={{ textAlign: "center", mt: 4 }}>
        {page < totalPages && !isLoading && (
          <Button
            variant="contained"
            onClick={() => setPage((p) => p + 1)}
            sx={{
              fontWeight: "bold",
              borderRadius: "12px",
              padding: "10px 24px",
            }}
          >
            आणखी लोड करा
          </Button>
        )}
        {isLoading && <CircularProgress size={24} />}
      </Box>

      {isQuizOpen && (
        <Quiz
          magazineId={selectedMagazineId}
          onClose={() => setIsQuizOpen(false)}
        />
      )}
    </div>
  );
};

export default MagazinePage;

const errorStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20000,
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: "20px",
    padding: "25px",
    width: "85%",
    maxWidth: "400px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
  closeButton: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    color: "white",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
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
