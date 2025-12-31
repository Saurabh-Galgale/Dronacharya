import React from "react";
import Footer from "../../component/Footer";

import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Divider } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const RefundPolicy = () => {
  const navigate = useNavigate();
  const lastUpdated = "December 27, 2025";
  const LEGAL_NAME = "Dronacharya Career Academy";
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
                  fontSize: "52px",
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
                Refund Policy
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
                1. Nature of Service
              </Typography>
              <Typography sx={{ lineHeight: 1.7 }}>
                <strong>Dronacharya Academy</strong> (operated by{" "}
                <strong>{LEGAL_NAME}</strong>) provides digital access to
                educational practice papers as a Software as a Service (SaaS).
                Since our service is a digital product and access is granted
                immediately upon successful payment, we maintain a clear policy
                regarding refunds.
              </Typography>
            </section>

            <Divider sx={{ mb: 4 }} />

            <section style={{ marginBottom: "32px" }}>
              <Typography
                variant="h6"
                sx={{ color: "#1a1a1a", fontWeight: 700, mb: 1.5 }}
              >
                2. No Refund Policy
              </Typography>
              <Typography sx={{ lineHeight: 1.7 }}>
                Once a subscription is purchased and the digital content/papers
                are unlocked or made available for viewing,{" "}
                <strong>no refunds will be issued</strong>. We provide clear
                descriptions and/or samples to help you make an informed
                decision before subscribing.
              </Typography>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <Typography
                variant="h6"
                sx={{ color: "#1a1a1a", fontWeight: 700, mb: 1.5 }}
              >
                3. Exceptions (Double Payment)
              </Typography>
              <Box
                sx={{
                  backgroundColor: "#fff9f4",
                  border: "1px solid #f8b14a",
                  padding: "20px",
                  borderRadius: "12px",
                }}
              >
                <Typography sx={{ lineHeight: 1.7 }}>
                  In the event that a user is charged twice for the same
                  subscription period due to a technical glitch, the duplicate
                  amount will be refunded. The user must report such cases to{" "}
                  <strong style={{ color: "#de6925" }}>{SUPPORT_EMAIL}</strong>{" "}
                  within 72 hours of the transaction with proof of payment.
                </Typography>
              </Box>
            </section>

            <section style={{ marginTop: "40px" }}>
              <Typography
                sx={{ fontSize: "13px", color: "#888", fontStyle: "italic" }}
              >
                Note: Approved refunds (for double payments) will be processed
                back to the original payment method and may take 5-7 working
                days to reflect in your bank account as per standard banking
                procedures.
              </Typography>
            </section>
          </Paper>

          {/* Bottom Contact Note */}
          <Box sx={{ textAlign: "center", marginTop: "32px" }}>
            <Typography sx={{ color: "#999", fontSize: "14px" }}>
              Have questions? Contact us at{" "}
              <span style={{ color: "#de6925" }}>{SUPPORT_EMAIL}</span>
            </Typography>
          </Box>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default RefundPolicy;
