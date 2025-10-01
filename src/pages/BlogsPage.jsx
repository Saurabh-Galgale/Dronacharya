// src/pages/BlogsPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function BlogsPage() {
  const navigate = useNavigate();

  const blogs = [
    {
      id: 1,
      title: "Wanderlust Unleashed: Top Hidden Gems You Must Visit This Year",
      subtitle:
        "Discover unique, off-the-radar destinations around the world that offer breathtaking scenery and unforgettable experiences.",
      tag: "Travel",
      image: "https://picsum.photos/id/1018/800/500",
    },
    {
      id: 2,
      title: "Travel Bucket List: 25 Destinations for Every Adventurer",
      subtitle:
        "Explore a curated list of must-visit places for every kind of traveler, whether you love mountains, beaches, or cultural landmarks.",
      tag: "Adventure",
      image: "https://picsum.photos/id/1025/800/500",
    },
    {
      id: 3,
      title:
        "How to Travel Like a Local: Insider Tips for Authentic Experiences",
      subtitle:
        "Learn how to immerse yourself in the culture of each place you visit by following these insider tips.",
      tag: "Culture",
      image: "https://picsum.photos/id/1036/800/500",
    },
  ];

  // detect if mobile (below 768px)
  const isMobile = window.innerWidth < 768;

  return (
    <div
      style={{
        ...styles.page,
        padding: isMobile ? 12 : 20,
        maxWidth: isMobile ? "100%" : 1200,
      }}
    >
      {/* <h1 style={styles.pageTitle}>Blogs</h1> */}

      <div style={styles.grid}>
        {blogs.map((blog) => (
          <div
            key={blog.id}
            style={{
              ...styles.card,
              backgroundImage: `url(${blog.image})`,
            }}
            onClick={() => navigate(`/app/blogs/${blog.id}`)}
          >
            <div style={styles.overlay}>
              <span style={styles.tag}>{blog.tag}</span>
              <h2 style={styles.title}>{blog.title}</h2>
              <p style={styles.subtitle}>{blog.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { margin: "0 auto", boxSizing: "border-box" },
  pageTitle: { margin: "0 0 20px 0", fontSize: 28 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 20,
  },
  card: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 250,
    backgroundSize: "cover",
    backgroundPosition: "center",
    cursor: "pointer",
    display: "flex",
    alignItems: "flex-end",
    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
  },
  overlay: {
    width: "100%",
    padding: 16,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 80%)",
    color: "#fff",
  },
  tag: {
    display: "inline-block",
    background: "rgba(255,255,255,0.25)",
    padding: "4px 8px",
    borderRadius: 6,
    fontSize: 12,
    marginBottom: 6,
  },
  title: { margin: "0 0 6px", fontSize: 18 },
  subtitle: { margin: 0, fontSize: 14, opacity: 0.9 },
};
