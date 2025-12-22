// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Paper,
  Chip,
  IconButton,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { getStoredUserProfile } from "../services/authService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    mockPapersSolved: 0,
    pyqPapersSolved: 0,
    totalPapers: 0,
    streak: 0,
    accuracy: 0,
  });

  const userProfile = getStoredUserProfile();
  const isSubscribed = userProfile?.subscription?.isActive || false;
  const userName = userProfile?.name || "Student";

  useEffect(() => {
    setStats({
      mockPapersSolved: 12,
      pyqPapersSolved: 8,
      totalPapers: 50,
      streak: 5,
      accuracy: 78,
    });
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        pb: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ pt: 2 }}>
        {/* Welcome Header */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            textAlign: "center",
            border: "0.2px solid #de6925",
            borderRadius: 4,
            background: "transparent",
            backdropFilter: "blur(5px)",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #de6925, #f8b14a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            नमस्कार, {userName}! 👋
          </Typography>
        </Box>

        {/* Subscription Promo Card */}
        {!isSubscribed && (
          <Box sx={{ width: "100%", mb: 3 }}>
            <Card
              onClick={() => handleNavigation("/subscription")}
              sx={{
                cursor: "pointer",
                borderRadius: 4,
                background: "linear-gradient(135deg, #de6925 0%, #f8b14a 100%)",
                boxShadow: "0 8px 24px rgba(222, 105, 37, 0.35)",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                }}
              />
              <CardContent sx={{ p: 3, position: "relative", zIndex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Chip
                      label="🎉 विशेष ऑफर"
                      size="medium"
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.25)",
                        color: "white",
                        fontWeight: 700,
                        mb: 1.5,
                        backdropFilter: "blur(10px)",
                      }}
                    />
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, color: "white", mb: 1 }}
                    >
                      फक्त ₹499 मध्ये 3 महिने!
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "rgba(255, 255, 255, 0.95)",
                        mb: 2,
                        fontWeight: 500,
                      }}
                    >
                      संपूर्ण प्रवेश मिळवा - सर्व प्रश्नपत्रिका, विश्लेषण आणि
                      बरेच काही!
                    </Typography>
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        background: "white",
                        color: "#de6925",
                        fontWeight: 700,
                        px: 3,
                        py: 1,
                        borderRadius: 3,
                      }}
                    >
                      आत्ताच सदस्यता घ्या
                    </Button>
                  </Box>
                  <Box sx={{ display: { xs: "none", sm: "flex" } }}>
                    <EmojiEventsIcon
                      sx={{ fontSize: 80, color: "rgba(255, 255, 255, 0.3)" }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Action Cards Container - Stacked on Mobile, Side-by-side on Desktop */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            mb: 3,
          }}
        >
          {/* Mock Papers Card */}
          <Box sx={{ flex: 1, width: "100%" }}>
            <Card
              onClick={() => handleNavigation("/mock")}
              sx={{
                cursor: "pointer",
                borderRadius: 4,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.35)",
                position: "relative",
                overflow: "hidden",
                height: "100%",
                transition: "all 0.3s ease",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                }}
              />
              <CardContent sx={{ p: 3, position: "relative", zIndex: 1 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 3,
                    background: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <MenuBookIcon sx={{ fontSize: 32, color: "white" }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "white", mb: 1 }}
                >
                  सराव प्रश्नपत्रिका
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.85)", mb: 2 }}
                >
                  Mock Papers सोडवा आणि तुमची तयारी तपासा
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <IconButton
                    sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", color: "white" }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* PYQ Papers Card */}
          <Box sx={{ flex: 1, width: "100%" }}>
            <Card
              onClick={() => handleNavigation("/pyq")}
              sx={{
                cursor: "pointer",
                borderRadius: 4,
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                boxShadow: "0 8px 24px rgba(240, 147, 251, 0.35)",
                position: "relative",
                overflow: "hidden",
                height: "100%",
                transition: "all 0.3s ease",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                }}
              />
              <CardContent sx={{ p: 3, position: "relative", zIndex: 1 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 3,
                    background: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <HistoryEduIcon sx={{ fontSize: 32, color: "white" }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "white", mb: 1 }}
                >
                  मागील प्रश्नपत्रिका
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.85)", mb: 2 }}
                >
                  PYQs सोडवा आणि पॅटर्न समजून घ्या
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <IconButton
                    sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", color: "white" }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Motivational Quote */}
        <Box sx={{ width: "100%" }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              background: "linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(253, 203, 110, 0.35)",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#2d3436",
                fontStyle: "italic",
                mb: 1,
              }}
            >
              "यश मिळवण्याचा सर्वोत्तम मार्ग म्हणजे सुरुवात करणे!"
            </Typography>
            <Typography variant="body2" sx={{ color: "#636e72" }}>
              आजच तुमचा अभ्यास सुरू करा आणि यशाच्या दिशेने वाटचाल करा 🚀
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
