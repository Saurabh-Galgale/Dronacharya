import React from "react";
import { Container, Typography, Box } from "@mui/material";
import { SUBSCRIPTION_PLANS } from "../config/plans";
import PricingCard from "../component/PricingCard";
import usePaymentGateway from "../hooks/usePaymentGateway";
import { getStoredUserProfile } from "../services/authService";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const Subscription = () => {
  const { handleBuy, loading } = usePaymentGateway();
  const plans = Object.values(SUBSCRIPTION_PLANS);

  // Get current user profile and subscription status
  const userProfile = getStoredUserProfile();
  const userSub = userProfile?.subscription;

  // Professional check: Is active AND not expired?
  const isSubscribed =
    userSub?.active &&
    userSub?.endDate &&
    new Date(userSub.endDate) > new Date();

  const activePlanId = isSubscribed ? userSub?.plan : null;

  // Calculate days remaining
  const calculateDaysLeft = () => {
    if (!isSubscribed || !userSub?.endDate) return null;
    const endDate = new Date(userSub.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = calculateDaysLeft();

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #fef5f0 100%)",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "400px",
          background:
            "linear-gradient(135deg, rgba(222, 105, 37, 0.08) 0%, rgba(248, 177, 74, 0.08) 100%)",
          borderRadius: 4,
          zIndex: 0,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: "-100px",
          right: "-100px",
          width: "400px",
          height: "400px",
          background:
            "radial-gradient(circle, rgba(222, 105, 37, 0.1) 0%, transparent 70%)",
          borderRadius: 4,
          zIndex: 0,
        },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{ py: { xs: 4, md: 6 }, position: "relative", zIndex: 1 }}
      >
        {/* Header Section with Enhanced Design */}
        <Box
          sx={{
            textAlign: "center",
            mb: 6,
            position: "relative",
          }}
        >
          {isSubscribed && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                bgcolor: "rgba(76, 175, 80, 0.1)",
                border: "2px solid rgba(76, 175, 80, 0.3)",
                borderRadius: 4,
                px: 3,
                py: 1,
                mb: 3,
                animation: "fadeInDown 0.6s ease-out",
                "@keyframes fadeInDown": {
                  from: {
                    opacity: 0,
                    transform: "translateY(-20px)",
                  },
                  to: {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                },
              }}
            >
              <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 24 }} />
              <Typography
                sx={{
                  color: "#2e7d32",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                }}
              >
                Active Subscription • {daysLeft}{" "}
                {daysLeft === 1 ? "Day" : "Days"} Remaining
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1.5,
              mb: 2,
            }}
          >
            <AutoAwesomeIcon
              sx={{
                fontSize: 40,
                color: "#de6925",
                animation: "sparkle 2s ease-in-out infinite",
                "@keyframes sparkle": {
                  "0%, 100%": {
                    transform: "rotate(0deg) scale(1)",
                    opacity: 1,
                  },
                  "50%": {
                    transform: "rotate(180deg) scale(1.1)",
                    opacity: 0.8,
                  },
                },
              }}
            />
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 900,
                background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              }}
            >
              {isSubscribed ? "Your Membership" : "Choose Your Plan"}
            </Typography>
          </Box>

          <Typography
            variant="h6"
            sx={{
              color: "#666",
              maxWidth: "700px",
              mx: "auto",
              lineHeight: 1.6,
              fontSize: { xs: "1rem", sm: "1.1rem" },
              px: 2,
            }}
          >
            {isSubscribed ? (
              <>
                Your access is valid until{" "}
                <Box
                  component="span"
                  sx={{
                    color: "#de6925",
                    fontWeight: 700,
                  }}
                >
                  {new Date(userSub.endDate).toLocaleDateString("en-IN", {
                    dateStyle: "long",
                  })}
                </Box>
              </>
            ) : (
              "Select the perfect plan to boost your exam preparation and unlock exclusive content."
            )}
          </Typography>
        </Box>

        {/* Pricing Cards Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(auto-fit, minmax(300px, 1fr))",
            },
            gap: 3,
            maxWidth: "1200px",
            mx: "auto",
          }}
        >
          {plans.map((plan, index) => (
            <Box
              key={plan.id}
              sx={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                "@keyframes fadeInUp": {
                  from: {
                    opacity: 0,
                    transform: "translateY(30px)",
                  },
                  to: {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                },
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  position: "relative",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform:
                    activePlanId === plan.id ? "scale(1.02)" : "scale(1)",
                  "&:hover": {
                    transform: "scale(1.03) translateY(-8px)",
                  },
                }}
              >
                {/* Active Plan Glow Effect */}
                {activePlanId === plan.id && (
                  <>
                    <Box
                      sx={{
                        position: "absolute",
                        inset: -4,
                        background: "linear-gradient(135deg, #de6925, #f8b14a)",
                        borderRadius: 4,
                        opacity: 0.3,
                        animation: "pulse 2s ease-in-out infinite",
                        zIndex: 0,
                        "@keyframes pulse": {
                          "0%, 100%": {
                            opacity: 0.3,
                            transform: "scale(1)",
                          },
                          "50%": {
                            opacity: 0.5,
                            transform: "scale(1.02)",
                          },
                        },
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: -15,
                        right: -15,
                        bgcolor: "#de6925",
                        color: "white",
                        borderRadius: 4,
                        width: 50,
                        height: 50,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 20px rgba(222, 105, 37, 0.4)",
                        zIndex: 3,
                        animation: "bounce 2s ease-in-out infinite",
                        "@keyframes bounce": {
                          "0%, 100%": {
                            transform: "translateY(0)",
                          },
                          "50%": {
                            transform: "translateY(-5px)",
                          },
                        },
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 28 }} />
                    </Box>
                  </>
                )}

                {/* Enhanced Pricing Card Wrapper */}
                <Box
                  sx={{
                    position: "relative",
                    zIndex: 2,
                    border:
                      activePlanId === plan.id ? "3px solid" : "2px solid",
                    borderColor:
                      activePlanId === plan.id
                        ? "#de6925"
                        : "rgba(0, 0, 0, 0.08)",
                    borderRadius: 4,
                    overflow: "hidden",
                    bgcolor: "#fff",
                    boxShadow:
                      activePlanId === plan.id
                        ? "0 20px 60px rgba(222, 105, 37, 0.25)"
                        : "0 10px 40px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow:
                        activePlanId === plan.id
                          ? "0 25px 70px rgba(222, 105, 37, 0.35)"
                          : "0 15px 50px rgba(0, 0, 0, 0.12)",
                      borderColor:
                        activePlanId === plan.id
                          ? "#de6925"
                          : "rgba(222, 105, 37, 0.3)",
                    },
                  }}
                >
                  {/* Top Gradient Bar for Active Plan */}
                  {activePlanId === plan.id && (
                    <Box
                      sx={{
                        height: "6px",
                        background:
                          "linear-gradient(90deg, #de6925, #f8b14a, #de6925)",
                        backgroundSize: "200% 100%",
                        animation: "gradientSlide 3s ease infinite",
                        "@keyframes gradientSlide": {
                          "0%": {
                            backgroundPosition: "0% 50%",
                          },
                          "50%": {
                            backgroundPosition: "100% 50%",
                          },
                          "100%": {
                            backgroundPosition: "0% 50%",
                          },
                        },
                      }}
                    />
                  )}

                  <PricingCard
                    plan={plan}
                    onBuy={handleBuy}
                    loading={loading}
                    isActive={activePlanId === plan.id}
                    hideBuyButton={isSubscribed}
                  />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Footer Note */}
        {!isSubscribed && (
          <Box
            sx={{
              textAlign: "center",
              mt: 6,
              animation: "fadeIn 1s ease-out 0.5s both",
              "@keyframes fadeIn": {
                from: { opacity: 0 },
                to: { opacity: 1 },
              },
            }}
          >
            <Typography
              sx={{
                color: "#999",
                fontSize: "0.9rem",
                maxWidth: "600px",
                mx: "auto",
              }}
            >
              All plans include full access to premium content. Choose the
              duration that works best for you.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Subscription;
