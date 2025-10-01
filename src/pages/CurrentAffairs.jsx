// src/pages/CurrentAffairsPage.jsx
import React, { useState } from "react";

// Mock Current Affairs data
const mockCA = [
  {
    id: 1,
    title: "पाळू घडामोडी",
    date: "Jan 25",
    content: "या महिन्यातील महत्वाच्या चालू घडामोडी...",
    image: "https://picsum.photos/id/1050/600/300",
    qp1: "QP_ID_101",
    qp2: "QP_ID_102",
  },
  {
    id: 2,
    title: "महत्वाच्या आंतरराष्ट्रीय घटना",
    date: "Feb 12",
    content: "आंतरराष्ट्रीय स्तरावरील महत्वाचे निर्णय आणि घटना...",
    image: "https://picsum.photos/id/1040/600/300",
    qp1: "QP_ID_201",
    qp2: "QP_ID_202",
  },
];

// Mock QP questions
const mockQPs = {
  QP_ID_101: [
    { q: "भारताचे पंतप्रधान कोण?", options: ["मोदी", "शहा", "गांधी"], ans: 0 },
    { q: "भारतीय राज्यघटना कधी लागू झाली?", options: ["1950", "1947"], ans: 0 },
  ],
  QP_ID_102: [
    { q: "UN ची स्थापना कधी झाली?", options: ["1945", "1950"], ans: 0 },
  ],
  QP_ID_201: [
    {
      q: "WHO चे मुख्यालय कुठे आहे?",
      options: ["जिनेव्हा", "न्यूयॉर्क"],
      ans: 0,
    },
  ],
  QP_ID_202: [{ q: "NASA कुठे आहे?", options: ["USA", "भारत"], ans: 0 }],
};

export default function CurrentAffairs() {
  const [selectedQP, setSelectedQP] = useState(null);

  const handleTestClick = (qpId) => {
    // Later: fetch(`/api/qps/${qpId}`)
    //   .then(res => res.json())
    //   .then(data => setSelectedQP(data));
    setSelectedQP(mockQPs[qpId] || []);
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>चालू घडामोडी</h1>

      {mockCA.map((ca) => (
        <div key={ca.id} style={styles.caCard}>
          <div style={styles.caHeader}>
            <h2 style={styles.caTitle}>{ca.title}</h2>
            <span style={styles.caDate}>{ca.date}</span>
          </div>
          <p style={styles.caContent}>{ca.content}</p>
          {ca.image && <img src={ca.image} alt="" style={styles.caImage} />}

          {/* Tests */}
          <div style={styles.testBox} onClick={() => handleTestClick(ca.qp1)}>
            📝 Test 01
          </div>
          <div style={styles.testBox} onClick={() => handleTestClick(ca.qp2)}>
            📝 Test 02
          </div>
        </div>
      ))}

      {/* Render selected QP questions */}
      {selectedQP && (
        <div style={styles.qpBox}>
          <h3>Questions</h3>
          {selectedQP.map((q, idx) => (
            <div key={idx} style={styles.qpQ}>
              <strong>Q{idx + 1}:</strong> {q.q}
              <ul>
                {q.options.map((opt, i) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Styles ---------- */
const styles = {
  page: { padding: 20, maxWidth: 900, margin: "0 auto" },
  pageTitle: { marginBottom: 20, fontSize: 28 },
  caCard: {
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    background: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  caHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  caTitle: { margin: 0, fontSize: 18 },
  caDate: { fontSize: 14, color: "#666" },
  caContent: { fontSize: 14, marginBottom: 10 },
  caImage: { width: "100%", borderRadius: 8, marginBottom: 12 },
  testBox: {
    padding: "10px 14px",
    border: "1px solid #aaa",
    borderRadius: 8,
    marginBottom: 10,
    cursor: "pointer",
    background: "#fafafa",
  },
  qpBox: {
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    background: "#f9f9f9",
  },
  qpQ: { marginBottom: 12 },
};
