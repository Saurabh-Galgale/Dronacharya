// src/pages/Terms.jsx
import React from "react";

export default function Terms() {
  return (
    <main
      style={{ padding: 24, fontFamily: "Arial, sans-serif", lineHeight: 1.6 }}
    >
      <h1>Terms & Conditions</h1>
      <p>Effective date: {new Date().toLocaleDateString()}</p>
      <p>
        These Terms govern the sale of products/services on this website. By
        placing an order you agree to these terms.
      </p>

      <h2>Order acceptance</h2>
      <p>
        We reserve the right to refuse or cancel any order for reasons including
        product availability or suspected fraud.
      </p>

      <h2>Prices & taxes</h2>
      <p>
        All prices are in INR and inclusive/exclusive of taxes as shown at
        checkout.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, our liability for any claim
        arising out of or in connection with the products or services sold on
        this site is limited to the purchase price paid for the relevant product
        or service. We are not liable for indirect, incidental, or consequential
        damages.
      </p>

      <h2>Contact</h2>
      <p>Questions? contact at https://dronacharya.vercel.app</p>
    </main>
  );
}
