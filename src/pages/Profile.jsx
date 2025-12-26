import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import { getStoredUserProfile } from "../services/authService";
import EmailIcon from "@mui/icons-material/Email";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import ReportIcon from "@mui/icons-material/Report";
import VerifiedIcon from "@mui/icons-material/Verified";

const ProfilePage = () => {
  const navigate = useNavigate();
  const userProfile = getStoredUserProfile();

  if (!userProfile) {
    navigate("/");
    return null;
  }

  const isSubscribed = userProfile.subscription?.active || false;

  // Calculate days left for subscription
  const calculateDaysLeft = () => {
    if (!isSubscribed || !userProfile.subscription?.endDate) return null;

    const endDate = new Date(userProfile.subscription.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = calculateDaysLeft();

  const flexRowOnDesktop = {
    display: "flex",
    flexDirection: { xs: "column", sm: "row" },
    gap: 2.5,
    mb: 2.5,
  };

  const cardStyle = {
    flex: 1,
    p: 3,
    bgcolor: "#fff",
    borderRadius: "20px",
    border: "1px solid rgba(222, 105, 37, 0.1)",
    width: "100%",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "3px",
      background: "linear-gradient(90deg, #de6925, #f8b14a)",
      transform: "scaleX(0)",
      transition: "transform 0.3s ease",
    },
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 12px 40px rgba(222, 105, 37, 0.15)",
      borderColor: "rgba(222, 105, 37, 0.3)",
      "&::before": {
        transform: "scaleX(1)",
      },
    },
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #fef5f0 100%)",
        minHeight: "100vh",
        py: { xs: 4, sm: 6 },
        fontFamily: "'Gotu', sans-serif",
        WebkitFontSmoothing: "antialiased",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "300px",
          background:
            "linear-gradient(135deg, rgba(222, 105, 37, 0.05) 0%, rgba(248, 177, 74, 0.05) 100%)",
          borderRadius: "0 0 50% 50%",
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: "32px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
          }}
        >
          {/* Header Section with Enhanced Design */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 5,
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "relative",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: -8,
                  background: "linear-gradient(135deg, #de6925, #f8b14a)",
                  borderRadius: "50%",
                  opacity: 0.2,
                  animation: "pulse 3s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { transform: "scale(1)", opacity: 0.2 },
                    "50%": { transform: "scale(1.1)", opacity: 0.3 },
                  },
                }}
              />
              <Avatar
                src={userProfile.picture}
                imgProps={{ referrerPolicy: "no-referrer" }}
                sx={{
                  width: 120,
                  height: 120,
                  border: "5px solid #fff",
                  boxShadow: "0 8px 24px rgba(222, 105, 37, 0.25)",
                  fontSize: "2.8rem",
                  background: "linear-gradient(135deg, #de6925, #f8b14a)",
                  position: "relative",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                {userProfile.name?.charAt(0).toUpperCase()}
              </Avatar>
              {isSubscribed && (
                <VerifiedIcon
                  sx={{
                    position: "absolute",
                    bottom: 5,
                    right: 5,
                    fontSize: 32,
                    color: "#de6925",
                    bgcolor: "#fff",
                    borderRadius: "50%",
                    p: 0.3,
                  }}
                />
              )}
            </Box>
            <Typography
              variant="h4"
              fontWeight={900}
              sx={{
                color: "#1a1a1a",
                mb: 1.5,
                textAlign: "center",
                background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {userProfile.name}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Chip
                label={`${
                  userProfile.authProvider?.charAt(0).toUpperCase() +
                  userProfile.authProvider?.slice(1)
                } Verified`}
                size="medium"
                icon={<VerifiedIcon sx={{ fontSize: 18, color: "#4caf50" }} />}
                sx={{
                  bgcolor: "rgba(76, 175, 80, 0.1)",
                  color: "#2e7d32",
                  fontWeight: 600,
                  borderRadius: "12px",
                  px: 1.5,
                  py: 0.5,
                  border: "1.5px solid rgba(76, 175, 80, 0.3)",
                  "& .MuiChip-icon": {
                    marginLeft: "8px",
                  },
                  "&:hover": {
                    bgcolor: "rgba(76, 175, 80, 0.15)",
                    borderColor: "#4caf50",
                  },
                }}
              />
              <Chip
                label={isSubscribed ? "Subscribed" : "Free Plan"}
                size="medium"
                icon={
                  isSubscribed ? (
                    <UpgradeIcon sx={{ fontSize: 18 }} />
                  ) : undefined
                }
                sx={{
                  background: isSubscribed
                    ? "linear-gradient(135deg, #de6925, #f8b14a)"
                    : "linear-gradient(135deg, #757575, #9e9e9e)",
                  color: "white",
                  fontWeight: 700,
                  borderRadius: "12px",
                  px: 1.5,
                  py: 0.5,
                  boxShadow: isSubscribed
                    ? "0 4px 12px rgba(222, 105, 37, 0.3)"
                    : "0 4px 12px rgba(117, 117, 117, 0.2)",
                  border: "none",
                  "& .MuiChip-icon": {
                    marginLeft: "8px",
                    color: "white",
                  },
                  "&:hover": {
                    boxShadow: isSubscribed
                      ? "0 6px 16px rgba(222, 105, 37, 0.4)"
                      : "0 6px 16px rgba(117, 117, 117, 0.3)",
                  },
                }}
              />
            </Box>
          </Box>

          <Divider
            sx={{
              mb: 4,
              borderColor: "rgba(222, 105, 37, 0.1)",
              "&::before, &::after": {
                borderColor: "rgba(222, 105, 37, 0.1)",
              },
            }}
          />

          {/* Row 1: Email and Subscription with Enhanced Cards */}
          <Box sx={flexRowOnDesktop}>
            <Box sx={cardStyle}>
              <Typography
                variant="caption"
                sx={{
                  color: "#999",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  fontSize: "0.7rem",
                }}
              >
                EMAIL ADDRESS
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mt: 1,
                }}
              >
                <Box
                  sx={{
                    bgcolor: "rgba(222, 105, 37, 0.1)",
                    borderRadius: "12px",
                    p: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EmailIcon sx={{ color: "#de6925", fontSize: 22 }} />
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    wordBreak: "break-all",
                    color: "#333",
                  }}
                >
                  {userProfile.email}
                </Typography>
              </Box>
            </Box>

            <Box sx={cardStyle}>
              <Typography
                variant="caption"
                sx={{
                  color: "#999",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  fontSize: "0.7rem",
                }}
              >
                SUBSCRIPTION STATUS
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mt: 1,
                }}
              >
                <Box
                  sx={{
                    bgcolor: isSubscribed
                      ? "rgba(222, 105, 37, 0.1)"
                      : "rgba(102, 102, 102, 0.1)",
                    borderRadius: "12px",
                    p: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CalendarMonthIcon
                    sx={{
                      color: isSubscribed ? "#de6925" : "#666",
                      fontSize: 22,
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: isSubscribed ? "#de6925" : "#666",
                    }}
                  >
                    {isSubscribed ? "Active Subscription" : "No Active Plan"}
                  </Typography>
                  {isSubscribed && daysLeft !== null && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: daysLeft < 7 ? "#f44336" : "#4caf50",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    >
                      {daysLeft} {daysLeft === 1 ? "day" : "days"} remaining
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Row 2: Enhanced Navigation Buttons */}
          <Box sx={flexRowOnDesktop}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<DashboardIcon />}
              onClick={() => navigate("/dashboard")}
              sx={{
                flex: 1,
                py: 2.5,
                borderRadius: "16px",
                bgcolor: "#1a1a1a",
                fontWeight: 700,
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: "0 8px 24px rgba(26, 26, 26, 0.2)",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "#333",
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 32px rgba(26, 26, 26, 0.3)",
                },
              }}
            >
              Go to Dashboard
            </Button>

            <Button
              fullWidth
              variant="contained"
              startIcon={<UpgradeIcon />}
              onClick={() => navigate("/subscription")}
              sx={{
                flex: 1,
                py: 2.5,
                borderRadius: "16px",
                background: "linear-gradient(135deg, #de6925 0%, #f8b14a 100%)",
                color: "white",
                fontWeight: 700,
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: "0 8px 24px rgba(222, 105, 37, 0.3)",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  transition: "left 0.5s ease",
                },
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 32px rgba(222, 105, 37, 0.4)",
                  "&::before": {
                    left: "100%",
                  },
                },
              }}
            >
              {isSubscribed ? "Manage Subscription" : "Subscribe Now"}
            </Button>
          </Box>

          {/* Row 3: Enhanced Report Button */}
          <Box sx={{ mt: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ReportIcon />}
              onClick={() => navigate("/contact-us")}
              sx={{
                py: 2,
                borderRadius: "16px",
                color: "#666",
                borderColor: "rgba(222, 105, 37, 0.2)",
                borderWidth: "2px",
                fontWeight: 600,
                fontSize: "0.95rem",
                textTransform: "none",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#de6925",
                  borderWidth: "2px",
                  color: "#de6925",
                  bgcolor: "rgba(222, 105, 37, 0.05)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 20px rgba(222, 105, 37, 0.15)",
                },
              }}
            >
              Report an Issue / Contact Support
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ProfilePage;
