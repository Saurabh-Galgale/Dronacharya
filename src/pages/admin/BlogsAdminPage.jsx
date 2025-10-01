// src/pages/admin/BlogsAdminPage.jsx
import React, { useEffect, useState } from "react";
import BlogsPage from "../BlogsPage";

/**
 * Admin page that re-uses BlogsPage (so admin sees the same UX).
 * Replace mock fetch/update/delete with real API calls.
 */
export default function BlogsAdminPage() {
  const [blogs, setBlogs] = useState([]);

  // mock load - replace with your API call (useEffect + fetch)
  useEffect(() => {
    // TODO: replace with fetch('/api/blogs')
    const mock = [
      {
        id: 101,
        title: "Wanderlust Unleashed: Top Hidden Gems You Must Visit This Year",
        subtitle:
          "Discover unique, off-the-radar destinations around the world that offer breathtaking scenery and unforgettable experiences.",
        tag: "Travel",
        image: "/images/blog1.jpg",
      },
      {
        id: 102,
        title: "Travel Bucket List: 25 Destinations for Every Adventurer",
        subtitle: "Explore a curated list of must-visit places.",
        tag: "Sustainability",
        image: "/images/blog2.jpg",
      },
    ];
    setBlogs(mock);
  }, []);

  function handleUpload() {
    // simple modal/prompt for now; replace with proper upload modal and API.
    const title = window.prompt("New blog title (mock):");
    if (!title) return;
    const newBlog = {
      id: Date.now(),
      title,
      subtitle: "Write subtitle here...",
      tag: "Uncategorized",
      image: "/images/placeholder.jpg",
    };
    // call API to create then update state on success
    setBlogs((s) => [newBlog, ...s]);
    alert("Mock uploaded. Hook this to your upload API.");
  }

  function handleEdit(blog) {
    const title = window.prompt("Edit blog title:", blog.title);
    if (title == null) return;
    // call API to update then update state on success
    setBlogs((s) => s.map((b) => (b.id === blog.id ? { ...b, title } : b)));
    alert("Mock edited. Hook to your update API.");
  }

  function handleDelete(blog) {
    if (!window.confirm("Delete this blog?")) return;
    // call API to delete then update state on success
    setBlogs((s) => s.filter((b) => b.id !== blog.id));
    alert("Mock deleted. Hook to your delete API.");
  }

  return (
    <div style={{ padding: 18 }}>
      {/* <h1 style={{ marginTop: 0 }}>Admin — Blogs</h1>
      <p style={{ color: "#666", marginTop: 4 }}>
        Admin preview (re-uses user view). Use the controls to manage blog
        posts.
      </p> */}

      <BlogsPage
        blogs={blogs}
        isAdmin={true}
        onUpload={handleUpload}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
