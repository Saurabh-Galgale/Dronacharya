// src/pages/BlogDetail.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const FALLBACK_IMAGE = "https://via.placeholder.com/1200x700?text=No+Image";

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const blogs = [
    {
      id: 1,
      title: "Wanderlust Unleashed: Top Hidden Gems You Must Visit This Year",
      tag: "Travel",
      image: "https://picsum.photos/id/1018/1200/700",
      content:
        "Full long content for blog 1. Replace this with actual DB content (Markdown or HTML).",
    },
    {
      id: 2,
      title: "Travel Bucket List: 25 Destinations for Every Adventurer",
      tag: "Adventure",
      image: "https://picsum.photos/id/1025/1200/700",
      content: "Full long content for blog 2.",
    },
    {
      id: 3,
      title:
        "How to Travel Like a Local: Insider Tips for Authentic Experiences",
      tag: "Culture",
      image: "https://picsum.photos/id/1036/1200/700",
      content: "Full long content for blog 3.",
    },
  ];

  const blog = blogs.find((b) => String(b.id) === String(id));

  if (!blog) return <div style={{ padding: 20 }}>Blog not found.</div>;

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div
        style={{
          ...styles.hero,
          backgroundImage: `url(${blog.image || FALLBACK_IMAGE})`,
        }}
      />

      <div style={styles.body}>
        <div style={styles.tag}>{blog.tag}</div>
        <h1 style={styles.title}>{blog.title}</h1>
        <div style={styles.content}>
          <p>{blog.content}</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 1000, margin: "0 auto", padding: 20 },
  backBtn: {
    marginBottom: 12,
    background: "transparent",
    border: "1px solid #ddd",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
  },
  hero: {
    height: 420,
    borderRadius: 12,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    boxShadow: "0 12px 40px rgba(12,12,12,0.12)",
    marginBottom: 18,
  },
  body: { padding: "0 6px" },
  tag: {
    display: "inline-block",
    marginBottom: 8,
    padding: "6px 10px",
    borderRadius: 12,
    background: "#f0f0f0",
    fontSize: 13,
  },
  title: { marginTop: 0, marginBottom: 12 },
  content: { lineHeight: 1.65, color: "#333" },
};
