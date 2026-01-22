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
  LinearProgress,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import ArticleIcon from "@mui/icons-material/Article";

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
  const userSub = userProfile?.subscription;

  // Check if subscription is active and not expired
  const isSubscribed =
    userSub?.active &&
    userSub?.endDate &&
    new Date(userSub.endDate) > new Date();

  const userName = userProfile?.name || "Student";

  // Calculate days remaining and progress
  const calculateSubscriptionData = () => {
    if (!isSubscribed || !userSub?.endDate) return null;

    const endDate = new Date(userSub.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate total days based on plan type (rough estimate)
    const planDaysMap = {
      "1_MONTH": 30,
      "3_MONTH": 90,
      "6_MONTH": 180,
      "1_YEAR": 365,
    };

    const totalDays = planDaysMap[userSub.plan] || 90;
    const daysUsed = totalDays - daysLeft;
    const progress = (daysUsed / totalDays) * 100;

    return {
      daysLeft: daysLeft > 0 ? daysLeft : 0,
      endDate,
      progress: Math.min(progress, 100),
      isExpiringSoon: daysLeft <= 7 && daysLeft > 0,
    };
  };

  const subscriptionData = calculateSubscriptionData();

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

  // Get plan name in Marathi
  const getPlanName = (planId) => {
    const names = {
      "1_MONTH": "१ महिना",
      "3_MONTH": "३ महिने",
      "6_MONTH": "६ महिने",
      "1_YEAR": "१ वर्ष",
    };
    return names[planId] || planId;
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

        {/* Subscription Card - Shows Promo or Active Status */}
        <Box sx={{ width: "100%", mb: 3 }}>
          {!isSubscribed ? (
            // Promo Card for Non-Subscribers
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
                      फक्त ₹१४९ मध्ये १ महिना!
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, color: "white", mb: 1 }}
                    >
                      फक्त ₹३९९ मध्ये ३ महिने!
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
          ) : (
            // Active Subscription Status Card
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
                border: "2px solid rgba(255, 255, 255, 0.3)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 32px rgba(222, 105, 37, 0.45)",
                },
              }}
            >
              {/* Animated Background Elements */}
              <Box
                sx={{
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.15)",
                  animation: "pulse 3s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { transform: "scale(1)", opacity: 0.15 },
                    "50%": { transform: "scale(1.1)", opacity: 0.25 },
                  },
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: -30,
                  left: -30,
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                }}
              />

              <CardContent sx={{ p: 3, position: "relative", zIndex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  {/* Left Section - Status and Details */}
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Chip
                        icon={
                          <CheckCircleIcon
                            sx={{ fontSize: 18, color: "white" }}
                          />
                        }
                        label="सदस्यता सक्रिय"
                        size="medium"
                        sx={{
                          bgcolor: "rgba(76, 175, 80, 0.9)",
                          color: "white",
                          fontWeight: 700,
                          backdropFilter: "blur(10px)",
                          boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                        }}
                      />
                      {subscriptionData?.isExpiringSoon && (
                        <Chip
                          label="लवकरच संपणार"
                          size="small"
                          sx={{
                            bgcolor: "rgba(244, 67, 54, 0.9)",
                            color: "white",
                            fontWeight: 600,
                            animation: "blink 2s ease-in-out infinite",
                            "@keyframes blink": {
                              "0%, 100%": { opacity: 1 },
                              "50%": { opacity: 0.7 },
                            },
                          }}
                        />
                      )}
                    </Box>

                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        color: "white",
                        mb: 1.5,
                        textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      {getPlanName(userSub.plan)} योजना
                    </Typography>

                    {/* Subscription Details */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Box
                          sx={{
                            bgcolor: "rgba(255, 255, 255, 0.25)",
                            borderRadius: "12px",
                            p: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CalendarTodayIcon
                            sx={{ fontSize: 20, color: "white" }}
                          />
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(255, 255, 255, 0.8)",
                              fontWeight: 600,
                              display: "block",
                            }}
                          >
                            शेवटची तारीख
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: "white",
                              fontWeight: 700,
                            }}
                          >
                            {subscriptionData?.endDate.toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Box
                          sx={{
                            bgcolor: "rgba(255, 255, 255, 0.25)",
                            borderRadius: "12px",
                            p: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <AutorenewIcon
                            sx={{ fontSize: 20, color: "white" }}
                          />
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(255, 255, 255, 0.8)",
                              fontWeight: 600,
                              display: "block",
                            }}
                          >
                            उरलेले दिवस
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: "white",
                              fontWeight: 700,
                            }}
                          >
                            {subscriptionData?.daysLeft}{" "}
                            {subscriptionData?.daysLeft === 1 ? "दिवस" : "दिवस"}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mt: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255, 255, 255, 0.9)",
                            fontWeight: 600,
                          }}
                        >
                          सदस्यता वापर
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255, 255, 255, 0.9)",
                            fontWeight: 700,
                          }}
                        >
                          {Math.round(subscriptionData?.progress || 0)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={subscriptionData?.progress || 0}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "rgba(255, 255, 255, 0.3)",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: "white",
                            borderRadius: 4,
                            boxShadow: "0 2px 8px rgba(255, 255, 255, 0.3)",
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Right Section - Trophy Icon (Desktop Only) */}
                  <Box
                    sx={{
                      display: { xs: "none", sm: "flex" },
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        animation: "float 3s ease-in-out infinite",
                        "@keyframes float": {
                          "0%, 100%": { transform: "translateY(0px)" },
                          "50%": { transform: "translateY(-10px)" },
                        },
                      }}
                    >
                      <CheckCircleIcon
                        sx={{
                          fontSize: 100,
                          color: "rgba(255, 255, 255, 0.4)",
                          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>

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
                boxShadow: "0 8px 24px rgba(79, 172, 254, 0.35)",
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
                  सराव प्रश्नपत्रिका सोडवा आणि तुमची तयारी तपासा.
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
                  मागील वर्षांच्या प्रश्नपत्रिका
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.85)", mb: 2 }}
                >
                  मागील वर्षांच्या प्रश्नपत्रिका सोडवा आणि पेपर पॅटर्न समजून
                  घ्या.
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

          {/* New Cards Section - Current Affairs and Blogs */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              mb: 3,
            }}
          >
            {/* Current Affairs Card */}
            <Box sx={{ flex: 1, width: "100%" }}>
              <Card
                onClick={() => handleNavigation("/ca")}
                sx={{
                  cursor: "pointer",
                  borderRadius: 4,
                  background:
                    "linear-gradient(135deg,rgb(31, 85, 132) 0%, #00f2fe 100%)",
                  boxShadow: "0 8px 24px rgba(79, 172, 254, 0.35)",
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
                    <NewspaperIcon sx={{ fontSize: 32, color: "white" }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "white", mb: 1 }}
                  >
                    चालू घडामोडी
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.85)", mb: 2 }}
                  >
                    मासिके वाचा आणि त्यावर आधारित क्विझ सोडवून तुमचे ज्ञान
                    वाढवा.
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <IconButton
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                      }}
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Blogs Card */}
            <Box sx={{ flex: 1, width: "100%" }}>
              <Card
                onClick={() => handleNavigation("/blogs")}
                sx={{
                  cursor: "pointer",
                  borderRadius: 4,
                  background:
                    "linear-gradient(135deg,rgb(32, 60, 42) 0%,rgba(56, 249, 214, 0.63) 100%)",
                  boxShadow: "0 8px 24px rgba(32, 60, 42, 0.35)",
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
                    <ArticleIcon sx={{ fontSize: 32, color: "white" }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "white", mb: 1 }}
                  >
                    ब्लॉग्स
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.85)", mb: 2 }}
                  >
                    महत्त्वपूर्ण लेख आणि अभ्यासक्रमाचे विषय सविस्तर वाचा.
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <IconButton
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                      }}
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Box>
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
              आजच तुमचा अभ्यास सुरू करा, भरपूर प्रश्नपत्रिका सोडवा आणि यशाच्या
              दिशेने वाटचाल करा 🚀
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
