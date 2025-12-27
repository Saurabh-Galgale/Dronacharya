import React, { useState, useEffect } from "react";
import Footer from "../../component/Footer";

import { useNavigate } from "react-router-dom";
import { getStoredUserProfile } from "../../services/authService";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Typography,
  Box,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const ContactUs = () => {
  const navigate = useNavigate();
  const userProfile = getStoredUserProfile();
  const userEmail = userProfile?.email || "";

  // Compliance Details - Change these to match your Aadhaar/PAN exactly
  const LEGAL_NAME = "Saurabh Rajendra Galgale";
  const SUPPORT_EMAIL = "help.dronacharyacareeracademy@gmail.com";
  const FULL_ADDRESS =
    "Vinayaki krupa apt., Nana master nagar, Karjat, Maharashtra, 410201";
  const PHONE_NUMBER = "+91 8600326056";

  const [formData, setFormData] = useState({
    email: userEmail,
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    let tempErrors = {};
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(formData.phone))
      tempErrors.phone = "Enter a valid 10-digit Indian phone number.";
    if (!formData.subject) tempErrors.subject = "Please select a subject.";
    if (formData.message.length < 50)
      tempErrors.message = "Message must be at least 50 characters.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const isFormValid =
    formData.subject !== "" &&
    formData.message.length >= 10 &&
    formData.message.length <= 50;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
      // Logic for backend API goes here
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    padding: "12px 16px",
    border: `2px solid ${hasError ? "#ff4d4d" : "#e0e0e0"}`,
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "white",
  });

  return (
    <>
      <div
        style={{
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
          padding: "48px 24px",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* Header */}
          <Box style={{ marginBottom: "48px", textAlign: "center" }}>
            {/* Container for Arrow and Heading */}
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative", // Allows the arrow to be positioned relative to the center
                marginBottom: "8px",
              }}
            >
              {/* Back Arrow - Positioned to the left of the text */}
              <ArrowBackIcon
                onClick={() => navigate("/")}
                style={{
                  cursor: "pointer",
                  fontSize: "52px",
                  color: "#de6925",
                  position: "absolute",
                  left: "0",
                  padding: "8px",
                  borderRadius: "50%",
                  transition: "background 0.3s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#fff3e0")}
                onMouseLeave={(e) => (e.target.style.background = "none")}
              />
              <h1
                style={{
                  fontSize: "36px",
                  fontWeight: 900,
                  margin: 0,
                  background: "linear-gradient(135deg, #de6925, #f8b14a)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Contact Us
              </h1>
            </Box>

            {/* Subtitle Details */}
            <p
              style={{
                color: "#444",
                fontSize: "16px",
                fontWeight: "500",
                margin: 0,
              }}
            >
              Dronacharya Academy — An Educational Initiative by {LEGAL_NAME}
            </p>
          </Box>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "32px",
            }}
          >
            {/* Contact Information (Razorpay Compliance Section) */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "32px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              }}
            >
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  marginBottom: "24px",
                  color: "#1a1a1a",
                }}
              >
                Official Details
              </h2>

              <div style={{ marginBottom: "24px" }}>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#888",
                    textTransform: "uppercase",
                  }}
                >
                  Registered Name
                </h3>
                <p
                  style={{ color: "#333", fontSize: "16px", fontWeight: "600" }}
                >
                  {LEGAL_NAME}
                </p>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#888",
                    textTransform: "uppercase",
                  }}
                >
                  Operating Address
                </h3>
                <p
                  style={{ color: "#666", fontSize: "14px", lineHeight: "1.5" }}
                >
                  {FULL_ADDRESS}
                </p>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#888",
                    textTransform: "uppercase",
                  }}
                >
                  Support Email
                </h3>
                <p
                  style={{
                    color: "#de6925",
                    fontSize: "15px",
                    fontWeight: "600",
                  }}
                >
                  {SUPPORT_EMAIL}
                </p>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#888",
                    textTransform: "uppercase",
                  }}
                >
                  Phone Number
                </h3>
                <p style={{ color: "#333", fontSize: "15px" }}>
                  {PHONE_NUMBER}
                </p>
              </div>
            </div>

            {/* Contact Form Section */}
            <Box
              sx={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "32px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              }}
            >
              {!userEmail ? (
                <Box sx={{ textAlign: "center", padding: "40px 0" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Send us a Message
                  </Typography>
                  <Typography color="textSecondary" sx={{ mb: 3 }}>
                    Please log in to your account to fill out the contact form.
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate("/")}
                    sx={{
                      py: 1.5,
                      background: "linear-gradient(135deg, #de6925, #f8b14a)",
                      fontWeight: 700,
                      borderRadius: "12px",
                    }}
                  >
                    Log In to Contact Us
                  </Button>
                </Box>
              ) : (
                <>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, mb: 3, color: "#1a1a1a" }}
                  >
                    Send us a Message
                  </Typography>

                  {submitted && (
                    <Box
                      sx={{
                        p: 2,
                        mb: 3,
                        bgcolor: "#d4edda",
                        color: "#155724",
                        borderRadius: "12px",
                      }}
                    >
                      ✓ Message sent successfully!
                    </Box>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Email - Read Only */}
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={formData.email}
                      readOnly
                      disabled
                      sx={{
                        mb: 3,
                        "& .MuiInputBase-input": { cursor: "not-allowed" },
                      }}
                    />

                    {/* Subject - MUI Select */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel id="subject-label">Subject *</InputLabel>
                      <Select
                        labelId="subject-label"
                        name="subject"
                        value={formData.subject}
                        label="Subject *"
                        onChange={handleChange}
                        required
                      >
                        <MenuItem value="Mock Paper Issue">
                          Mock Paper Issue
                        </MenuItem>
                        <MenuItem value="Payment Issue">Payment Issue</MenuItem>
                        <MenuItem value="Profile Issue">Profile Issue</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>

                    {/* Message - MUI Multi-line TextField */}
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      name="message"
                      label="Message *"
                      placeholder="Type your message (10-40 characters)"
                      value={formData.message}
                      onChange={handleChange}
                      error={formData.message.length > 50}
                      helperText={
                        formData.message.length < 10 &&
                        formData.message.length > 0
                          ? "Min 10 characters required"
                          : `${formData.message.length}/50 characters`
                      }
                      sx={{ mb: 4 }}
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={!isFormValid}
                      sx={{
                        py: 2,
                        borderRadius: "12px",
                        fontWeight: 700,
                        fontSize: "16px",
                        background: isFormValid
                          ? "linear-gradient(135deg, #de6925, #f8b14a)"
                          : "#e0e0e0",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #c55a1e, #e09d3e)",
                        },
                        "&.Mui-disabled": {
                          background: "#eeeeee",
                          color: "#bdbdbd",
                        },
                      }}
                    >
                      Send Message
                    </Button>
                  </form>
                </>
              )}
            </Box>
          </div>

          {/* Business Hours */}
          <div
            style={{
              marginTop: "48px",
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "32px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "16px",
              }}
            >
              Response Timeline
            </h2>
            <p style={{ color: "#666", fontSize: "14px" }}>
              We aim to respond to all queries within{" "}
              <strong>24 to 48 working hours</strong>. Business Hours: Mon-Fri
              (9 AM - 5 PM).
            </p>
          </div>

          {/* Back to Home Button */}
          <div style={{ marginTop: "48px", textAlign: "center" }}>
            <button
              onClick={() => navigate("/")}
              style={{
                display: "inline-block",
                padding: "12px 32px",
                background: "linear-gradient(135deg, #de6925, #f8b14a)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactUs;
