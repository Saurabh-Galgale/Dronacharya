import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Footer from "../../component/Footer";

const TermsAndConditions = () => {
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
                Terms & Conditions
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

          {/* Main Terms Card */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: "20px",
              padding: { xs: "24px", md: "40px" },
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              color: "#444",
              mb: 5,
            }}
          >
            <section style={{ marginBottom: "32px" }}>
              <Typography
                variant="h6"
                sx={{ color: "#1a1a1a", fontWeight: 700, mb: 1.5 }}
              >
                1. Acceptance of Terms
              </Typography>
              <Typography sx={{ lineHeight: 1.7 }}>
                By accessing and using <strong>Dronacharya Academy</strong>,
                operated by
                <strong> {LEGAL_NAME}</strong> ("we", "us", "our"), you agree to
                comply with and be bound by these Terms and Conditions. If you
                do not agree, please do not use our services.
              </Typography>
            </section>

            <Divider sx={{ mb: 4 }} />

            <section style={{ marginBottom: "32px" }}>
              <Typography
                variant="h6"
                sx={{ color: "#1a1a1a", fontWeight: 700, mb: 1.5 }}
              >
                2. Eligibility
              </Typography>
              <Typography sx={{ lineHeight: 1.7 }}>
                Our services are available to individuals of all ages. However,
                if you are under the age of 18, you represent that you are using
                the service with the consent and supervision of a parent or
                legal guardian.
              </Typography>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <Typography
                variant="h6"
                sx={{ color: "#1a1a1a", fontWeight: 700, mb: 1.5 }}
              >
                3. Subscription and Access
              </Typography>
              <List sx={{ p: 0 }}>
                {[
                  "Access to practice papers is granted on a monthly subscription basis.",
                  "Subscriptions are for individual use only. Account sharing is strictly prohibited.",
                  "We reserve the right to terminate access if any suspicious activity is detected.",
                ].map((text, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: "35px" }}>
                      <CheckCircleOutlineIcon
                        sx={{ color: "#de6925", fontSize: "20px" }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={text}
                      primaryTypographyProps={{
                        fontSize: "15px",
                        lineHeight: 1.6,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <Typography
                variant="h6"
                sx={{ color: "#1a1a1a", fontWeight: 700, mb: 1.5 }}
              >
                4. Intellectual Property
              </Typography>
              <Typography sx={{ lineHeight: 1.7 }}>
                All content, including questions, papers, magazines, and
                software, is the property of
                <strong> Dronacharya Academy</strong>. Users are{" "}
                <strong>not permitted</strong> to copy, reproduce, distribute,
                or download content for commercial use. The service is for
                "Online View Only" practice.
              </Typography>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <Typography
                variant="h6"
                sx={{ color: "#1a1a1a", fontWeight: 700, mb: 1.5 }}
              >
                5. Account Security
              </Typography>
              <Typography sx={{ lineHeight: 1.7 }}>
                Users are responsible for maintaining the confidentiality of
                their credentials. Our platform provides a "Forgot Password"
                feature via registered email. We are not liable for losses
                resulting from unauthorized access due to user negligence.
              </Typography>
            </section>

            {/* Jurisdiction Box */}
            <Box
              sx={{
                backgroundColor: "#f8f9fa",
                borderLeft: "5px solid #de6925",
                padding: "20px",
                borderRadius: "8px",
                mb: 4,
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: "#1a1a1a", fontWeight: 700, mb: 1 }}
              >
                6. Governing Law
              </Typography>
              <Typography sx={{ fontSize: "15px" }}>
                These terms shall be governed by the laws of India. Any disputes
                shall be subject to the exclusive jurisdiction of the courts in{" "}
                <strong>Karjat, Maharashtra</strong>.
              </Typography>
            </Box>

            <section>
              <Typography
                variant="h6"
                sx={{ color: "#1a1a1a", fontWeight: 700, mb: 1.5 }}
              >
                7. Contact Information
              </Typography>
              <Typography sx={{ lineHeight: 1.7 }}>
                For any grievances or questions regarding these terms, please
                contact us at:
                <br />
                <strong style={{ color: "#de6925" }}>{SUPPORT_EMAIL}</strong>
              </Typography>
            </section>
          </Paper>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default TermsAndConditions;
