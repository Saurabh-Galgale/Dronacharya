// src/pages/Shipping.jsx
import React from "react";

export default function Shipping() {
  return (
    <main
      style={{ padding: 24, fontFamily: "Arial, sans-serif", lineHeight: 1.6 }}
    >
      <h1>Shipping Policy</h1>

      <p>
        <strong>Processing time:</strong> Orders are processed within 1-3
        business days.
      </p>
      <p>
        <strong>Shipping time:</strong> Domestic shipping typically 3-7 business
        days; remote locations may take longer.
      </p>

      <h2>Shipping charges</h2>
      <p>Shipping charges (if any) are calculated at checkout.</p>

      <h2>Lost/damaged shipments</h2>
      <p>
        For lost or damaged shipments, please contact customer support at
        support at https://dronacharya.vercel.app with your order ID and photos
        of the issue. We will coordinate with the carrier to resolve the matter.
      </p>
    </main>
  );
}
