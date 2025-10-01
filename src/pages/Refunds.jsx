// src/pages/Refunds.jsx
import React from "react";

export default function Refunds() {
  return (
    <main
      style={{ padding: 24, fontFamily: "Arial, sans-serif", lineHeight: 1.6 }}
    >
      <h1>Cancellation & Refund Policy</h1>

      <p>
        Customers may cancel orders within 24 hours of purchase if the order
        hasn't shipped. Refunds (if approved) are processed within 5-7 business
        days to the original payment method.
      </p>

      <h2>Return conditions</h2>
      <p>
        Items must be returned unused, in original packaging, and within 7 days
        of delivery (or as per product category).
      </p>

      <h2>How to request a refund</h2>
      <p>
        Email refunds at https://dronacharya.vercel.app with order ID and
        reason. We'll respond within 2 business days.
      </p>
    </main>
  );
}
