// src/pages/Privacy.jsx
import React from "react";

export default function Privacy() {
  return (
    <main
      style={{ padding: 24, fontFamily: "Arial, sans-serif", lineHeight: 1.6 }}
    >
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <p>
        <strong>Business:</strong> [Dronacharya Acadamy]
      </p>
      <p>
        <strong>Address:</strong> [Dronacharya Acadamy Address]
      </p>
      <p>
        <strong>Email:</strong> contact @ https://dronacharya.vercel.app
      </p>
      <p>
        <strong>Phone:</strong> [1234567890]
      </p>

      <h2>What we collect</h2>
      <p>
        We collect information necessary to process orders and payments (name,
        email, phone, billing/shipping address). Payment details are processed
        by third-party providers and are not stored on our servers.
      </p>

      <h2>How we use information</h2>
      <p>
        To process orders, communicate with customers, and for fraud prevention
        and legal compliance.
      </p>

      <h2>Third-party payments</h2>
      <p>
        Payments are processed by Razorpay. We do not store full card data on
        our servers. For details, consult the payment processor's policies.
      </p>

      <h2>Data retention & rights</h2>
      <p>
        Users can contact us at contact@https://dronacharya.vercel.app for data
        access, correction, or deletion requests.
      </p>
    </main>
  );
}
