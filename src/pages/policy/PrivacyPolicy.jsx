import React from "react";
import Footer from "../../component/Footer";

import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const lastUpdated = "December 27, 2025";
  const LEGAL_NAME = "Dronacharya Career Academy";
  const SUPPORT_EMAIL = "help.dronacharyacareeracademy@gmail.com";
  return (
    <>
      <div
        style={{
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
          padding: "48px 24px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* Header Section with Back Button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "48px",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <button
                onClick={() => navigate("/")}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#444",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                }}
              >
                ← Back
              </button>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: 900,
                  margin: 0,
                  background: "linear-gradient(135deg, #de6925, #f8b14a)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Privacy Policy
              </h1>
            </div>
            <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
              Last Updated: {lastUpdated}
            </p>
          </div>

          {/* Main Content Card */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "20px",
              padding: "40px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              lineHeight: "1.7",
              color: "#444",
            }}
          >
            <section style={{ marginBottom: "32px" }}>
              <p>
                Welcome to <strong>Dronacharya Academy</strong>. We value your
                privacy and are committed to protecting your personal data. This
                policy explains how <strong>{LEGAL_NAME}</strong> manages your
                information when you subscribe to our practice paper services.
              </p>
            </section>

            <hr
              style={{
                border: "0",
                borderTop: "1px solid #eee",
                marginBottom: "32px",
              }}
            />

            <section style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  color: "#1a1a1a",
                  fontSize: "20px",
                  fontWeight: 700,
                  marginBottom: "16px",
                }}
              >
                1. Information Collection
              </h2>
              <p>To provide a seamless SaaS experience, we collect:</p>
              <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
                <li>
                  <strong>Identity Data:</strong> Full name and email address
                  (collected via Google Login).
                </li>
                <li>
                  <strong>Transaction Data:</strong> Details about payments made
                  through <strong>Razorpay</strong>. Note: We do not see or
                  store your card/bank details.
                </li>
                <li>
                  <strong>Usage Data:</strong> Information on how you interact
                  with our mock papers.
                </li>
              </ul>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  color: "#1a1a1a",
                  fontSize: "20px",
                  fontWeight: 700,
                  marginBottom: "16px",
                }}
              >
                2. Data Usage & Purpose
              </h2>
              <p>Your data is strictly used for:</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "15px",
                  marginTop: "15px",
                }}
              >
                <div
                  style={{
                    background: "#fff9f4",
                    padding: "15px",
                    borderRadius: "12px",
                    border: "1px solid #f8b14a",
                  }}
                >
                  <strong>Service Access</strong>
                  <p style={{ fontSize: "13px", margin: "5px 0 0" }}>
                    Granting access to subscription-based papers.
                  </p>
                </div>
                <div
                  style={{
                    background: "#f4f9ff",
                    padding: "15px",
                    borderRadius: "12px",
                    border: "1px solid #4facfe",
                  }}
                >
                  <strong>Communication</strong>
                  <p style={{ fontSize: "13px", margin: "5px 0 0" }}>
                    Sending payment receipts and support replies.
                  </p>
                </div>
              </div>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  color: "#1a1a1a",
                  fontSize: "20px",
                  fontWeight: 700,
                  marginBottom: "16px",
                }}
              >
                3. Security Standards
              </h2>
              <p>
                We implement industry-standard security protocols to prevent
                unauthorized access. As a SaaS platform, we ensure that your
                login is handled securely via your authentication provider and
                payments are encrypted by Razorpay's PCI-DSS compliant
                infrastructure.
              </p>
            </section>

            {/* Contact Summary Box */}
            <div
              style={{
                marginTop: "40px",
                padding: "10px",
                backgroundColor: "#f8f9fa",
                borderRadius: "16px",
                border: "1px dashed #ccc",
              }}
            >
              <h3 style={{ margin: "0 0 15px 0", fontSize: "18px" }}>
                Data Privacy Contact
              </h3>
              <p style={{ margin: "5px 0" }}>
                <strong>Owner:</strong> {LEGAL_NAME}
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Email:</strong> {SUPPORT_EMAIL}
              </p>
            </div>
          </div>

          {/* Footer Note */}
          <p
            style={{
              textAlign: "center",
              marginTop: "32px",
              color: "#999",
              fontSize: "14px",
            }}
          >
            &copy; 2025 Dronacharya Academy. All rights reserved.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};
export default PrivacyPolicy;
// help.dronacharyacareeracademy@gmail.com
