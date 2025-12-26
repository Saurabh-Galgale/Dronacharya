import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUserProfile } from "../../services/authService";

const ContactUs = () => {
  const navigate = useNavigate();
  const userProfile = getStoredUserProfile();
  const userEmail = userProfile?.email || "";

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
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 900,
              marginBottom: "16px",
              background: "linear-gradient(135deg, #de6925, #f8b14a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Contact Us
          </h1>
          <p style={{ color: "#666", fontSize: "16px" }}>
            We're here to help! Reach out to us anytime.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "32px",
          }}
        >
          {/* Contact Information (Compliance Info) */}
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
                fontSize: "24px",
                fontWeight: 700,
                marginBottom: "24px",
                color: "#1a1a1a",
              }}
            >
              Get in Touch
            </h2>

            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #de6925, #f8b14a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "10px",
                }}
              >
                📍
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#333" }}>
                Academy Address
              </h3>
              <p style={{ color: "#666", fontSize: "14px" }}>
                Dronacharya career academy, Maharashtra, India
              </p>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #4facfe, #00f2fe)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "10px",
                }}
              >
                ✉️
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#333" }}>
                Email Us
              </h3>
              <p style={{ color: "#de6925", fontSize: "14px" }}>
                help.dronacharyacareeracademy@gmail.com
              </p>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #43e97b, #38f9d7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "10px",
                }}
              >
                📞
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#333" }}>
                Call Us
              </h3>
              <p style={{ color: "#de6925", fontSize: "14px" }}>
                +91 8600326056
              </p>
            </div>
          </div>

          {/* Contact Form Section */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "32px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            }}
          >
            {!userEmail ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    marginBottom: "16px",
                  }}
                >
                  Send us a Message
                </h2>
                <p style={{ color: "#666", marginBottom: "24px" }}>
                  Please log in to your account to fill out the contact form.
                </p>
                <button
                  onClick={() => navigate("/")}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: "linear-gradient(135deg, #de6925, #f8b14a)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Log In to Contact Us
                </button>
              </div>
            ) : (
              <>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    marginBottom: "24px",
                    color: "#1a1a1a",
                  }}
                >
                  Send us a Message
                </h2>
                {submitted && (
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#d4edda",
                      borderRadius: "12px",
                      marginBottom: "24px",
                      color: "#155724",
                    }}
                  >
                    ✓ Message sent successfully!
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: "15px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      readOnly
                      style={{
                        ...inputStyle(),
                        backgroundColor: "#f5f5f5",
                        cursor: "not-allowed",
                        color: "#777",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      style={inputStyle(errors.phone)}
                    />
                    {errors.phone && (
                      <p
                        style={{
                          color: "#ff4d4d",
                          fontSize: "12px",
                          marginTop: "5px",
                        }}
                      >
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      style={inputStyle(errors.subject)}
                    >
                      <option value="">Select an Issue</option>
                      <option value="Mock Paper Issue">Mock Paper Issue</option>
                      <option value="Payment Issue">Payment Issue</option>
                      <option value="Profile Issue">Profile Issue</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.subject && (
                      <p
                        style={{
                          color: "#ff4d4d",
                          fontSize: "12px",
                          marginTop: "5px",
                        }}
                      >
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div style={{ marginBottom: "24px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      Message *
                    </label>
                    <textarea
                      name="message"
                      rows="4"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Min 50 characters required..."
                      style={inputStyle(errors.message)}
                    />
                    {errors.message && (
                      <p
                        style={{
                          color: "#ff4d4d",
                          fontSize: "12px",
                          marginTop: "5px",
                        }}
                      >
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "16px",
                      background: "linear-gradient(135deg, #de6925, #f8b14a)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Send Message
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Business Hours */}
        <div
          style={{
            marginTop: "48px",
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 700,
              marginBottom: "24px",
              color: "#1a1a1a",
              textAlign: "center",
            }}
          >
            Business Hours
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "24px",
              textAlign: "center",
            }}
          >
            <div>
              <p
                style={{ fontWeight: 600, marginBottom: "8px", color: "#333" }}
              >
                Monday - Friday
              </p>
              <p style={{ color: "#666", fontSize: "14px" }}>
                9:00 AM - 5:00 PM
              </p>
            </div>
            <div>
              <p
                style={{ fontWeight: 600, marginBottom: "8px", color: "#333" }}
              >
                Saturday & Sunday
              </p>
              <p style={{ color: "#666", fontSize: "14px" }}>Closed</p>
            </div>
          </div>
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
  );
};

export default ContactUs;
