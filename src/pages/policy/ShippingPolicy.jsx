import React from "react";
import Footer from "../../component/Footer";

import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Divider } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const ShippingPolicy = () => {
  const navigate = useNavigate();
  const lastUpdated = "December 27, 2025";
  const LEGAL_NAME = "Saurabh Rajendra Galgale";
  const SUPPORT_EMAIL = "help.dronacharyacareeracademy@gmail.com";

  return (
    <>
      <Box
        sx={{
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
          padding: "48px 24px",
          fontFamily: "sans-serif",
        }}
      >
        <Box sx={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* Header Section */}
          <Box sx={{ marginBottom: "48px", textAlign: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                marginBottom: "8px",
              }}
            >
              <ArrowBackIcon
                onClick={() => navigate("/")}
                sx={{
                  cursor: "pointer",
                  fontSize: "32px",
                  color: "#de6925",
                  position: "absolute",
                  left: "0",
                  padding: "8px",
                  borderRadius: "50%",
                  transition: "0.3s",
                  "&:hover": { background: "#fff3e0" },
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  background: "linear-gradient(135deg, #de6925, #f8b14a)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Shipping & Delivery
              </Typography>
            </Box>
            <Typography
              sx={{ color: "#444", fontSize: "16px", fontWeight: "500" }}
            >
              Dronacharya Academy — An Educational Initiative by {LEGAL_NAME}
            </Typography>
            <Typography sx={{ color: "#888", fontSize: "14px", mt: 1 }}>
              Last Updated: {lastUpdated}
            </Typography>
          </Box>

          {/* Policy Content Card */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: "20px",
              padding: { xs: "24px", md: "40px" },
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              color: "#444",
            }}
          >
            <section style={{ marginBottom: "32px" }}>
              <Typography
                variant="h6"
                sx={{ color: "#1a1a1a", fontWeight: 700, mb: 1.5 }}
              >
                1. Delivery of Service
              </Typography>
              <Typography sx={{ lineHeight: 1.7 }}>
                <strong>Dronacharya Academy</strong> provides digital
                educational products (SaaS). For our subscription-based practice
                papers, <strong>no physical shipping is required</strong>. All
                services are delivered digitally through your user dashboard.
              </Typography>
            </section>

            <Divider sx={{ mb: 4 }} />

            <section style={{ marginBottom: "32px" }}>
              <Typography
                variant="h6"
                sx={{ color: "#1a1a1a", fontWeight: 700, mb: 1.5 }}
              >
                2. Delivery Timeline
              </Typography>
              <Typography sx={{ lineHeight: 1.7 }}>
                Access to the practice papers is <strong>instant</strong>. Upon
                successful completion of the payment via our payment gateway,
                your account will be automatically updated, and the subscription
                content will be unlocked immediately. There are no delays as the
                product is purely software-based.
              </Typography>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <Typography
                variant="h6"
                sx={{ color: "#1a1a1a", fontWeight: 700, mb: 1.5 }}
              >
                3. Payment Confirmation
              </Typography>
              <Box
                sx={{
                  backgroundColor: "#f4f9ff",
                  border: "1px solid #4facfe",
                  padding: "20px",
                  borderRadius: "12px",
                }}
              >
                <Typography sx={{ lineHeight: 1.7 }}>
                  You will receive a payment confirmation email from our payment
                  partner (Razorpay) immediately after the transaction. If you
                  do not gain access within 1 hour of payment, please reach out
                  to us at{" "}
                  <strong style={{ color: "#4facfe" }}>{SUPPORT_EMAIL}</strong>.
                </Typography>
              </Box>
            </section>

            <section style={{ marginBottom: "8px" }}>
              <Typography
                variant="h6"
                sx={{ color: "#1a1a1a", fontWeight: 700, mb: 1.5 }}
              >
                4. Shipping Charges
              </Typography>
              <Typography sx={{ lineHeight: 1.7 }}>
                Since the delivery of our service is entirely digital via this
                website, there are <strong>zero (₹0) shipping charges</strong>{" "}
                applied to any of our subscription plans.
              </Typography>
            </section>
          </Paper>

          {/* Footer Note */}
          <Box sx={{ textAlign: "center", marginTop: "32px" }}>
            <Typography sx={{ color: "#999", fontSize: "14px" }}>
              This is a SaaS product. No physical goods will be sent.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Footer />
    </>
  );
};

export default ShippingPolicy;
