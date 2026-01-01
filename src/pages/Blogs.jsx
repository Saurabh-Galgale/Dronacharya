import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "../styles/Blogs.module.css";
import { getBlogs } from "../services/api";
import { getStoredUserProfile } from "../services/authService";
import { Button, Modal, Box, Typography } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  categoryTranslations,
  subCategoryTranslations,
  getCategoryKeys,
  getSubCategoryKeysForCategory,
} from "../utils/translations";

const FALLBACK_IMAGE =
  "https://d1mhg19mxhvn2h.cloudfront.net/blogs/errorPage01.webp";

const BlogCardSkeleton = () => (
  <div
    style={{
      position: "absolute",
      top: 52,
      left: 6,
      right: 6,
      bottom: 12,
      borderRadius: "14px",
      overflow: "hidden",
      backgroundColor: "#2e2e2e",
      boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    }}
  >
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "24px",
      }}
    >
      <div
        style={{
          height: "28px",
          width: "80%",
          backgroundColor: "#444",
          borderRadius: "8px",
          marginBottom: "16px",
        }}
      ></div>
      <div
        style={{
          height: "20px",
          width: "60%",
          backgroundColor: "#444",
          borderRadius: "8px",
          marginBottom: "24px",
        }}
      ></div>
      <div
        style={{
          height: "48px",
          width: "100%",
          backgroundColor: "#444",
          borderRadius: "50px",
        }}
      ></div>
    </div>
  </div>
);

const Blogs = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSubsModalOpen, setIsSubsModalOpen] = useState(false); // Modal State
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const contentRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    category: "",
    subCategory: "",
  });

  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState(null);

  const userProfile = getStoredUserProfile();
  const isSubscribed = userProfile?.subscription?.active || false;

  const getCacheKey = useCallback(
    () =>
      activeFilters.category
        ? `blog_filter_cache_${activeFilters.category}`
        : "blog_feed_cache",
    [activeFilters.category]
  );

  const fetchAndCacheBlogs = useCallback(
    async (pageNum, filters) => {
      if (isFetchingMore) return;
      const isInitialLoad = pageNum === 1;
      if (isInitialLoad) setLoading(true);
      else setIsFetchingMore(true);
      try {
        const response = await getBlogs(
          pageNum,
          2,
          filters.category,
          filters.subCategory
        );
        const newBlogs = response.data;
        const pagination = response.pagination;
        setBlogs((prev) => {
          const updatedBlogs = isInitialLoad
            ? newBlogs
            : [...prev, ...newBlogs];
          sessionStorage.setItem(
            getCacheKey(),
            JSON.stringify({
              blogs: updatedBlogs,
              page: pagination.currentPage,
              hasNextPage: pagination.currentPage < pagination.totalPages,
            })
          );
          return updatedBlogs;
        });
        setPage(pagination.currentPage);
        setHasNextPage(pagination.currentPage < pagination.totalPages);
      } catch (err) {
        setError(err.message || "Failed to fetch blogs.");
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    },
    [getCacheKey, isFetchingMore]
  );

  useEffect(() => {
    const cachedData = sessionStorage.getItem(getCacheKey());
    if (cachedData) {
      const { blogs: b, page: p, hasNextPage: h } = JSON.parse(cachedData);
      setBlogs(b);
      setPage(p);
      setHasNextPage(h);
      setLoading(false);
    } else {
      fetchAndCacheBlogs(1, activeFilters);
    }
  }, [activeFilters, fetchAndCacheBlogs, getCacheKey]);

  useEffect(() => {
    if (
      currentIndex === blogs.length - 1 &&
      hasNextPage &&
      !isFetchingMore &&
      !loading &&
      blogs.length > 0
    ) {
      fetchAndCacheBlogs(page + 1, activeFilters);
    }
  }, [
    currentIndex,
    hasNextPage,
    isFetchingMore,
    loading,
    page,
    blogs.length,
    activeFilters,
    fetchAndCacheBlogs,
  ]);

  const handleApplyFilters = () => {
    setBlogs([]);
    setCurrentIndex(0);
    setPage(1);
    setIsFilterOpen(false);
    setActiveFilters({
      category: selectedCategory,
      subCategory: selectedSubCategory,
    });
  };

  const handleClearFilters = () => {
    setBlogs([]);
    setCurrentIndex(0);
    setPage(1);
    setIsFilterOpen(false);
    setSelectedCategory("");
    setSelectedSubCategory("");
    setActiveFilters({ category: "", subCategory: "" });
  };

  const currentBlog = blogs[currentIndex];
  const isLocked = currentBlog && !currentBlog.isFree && !isSubscribed;

  const handleTouchStart = (e) => {
    if (!isZoomed) setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e) => {
    if (!isZoomed) setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!isZoomed && touchStart && touchEnd) {
      const distance = touchStart - touchEnd;
      if (Math.abs(distance) > 50) {
        setIsFilterOpen(false);
        if (distance > 50 && currentIndex < blogs.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowSwipeHint(false);
        } else if (distance < -50 && currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
      }
      setTouchStart(0);
      setTouchEnd(0);
    }
  };

  const handleZoom = () => {
    if (isLocked) {
      setIsSubsModalOpen(true); // Open modal instead of redirect
      return;
    }
    setIsFilterOpen(false);
    setIsZoomed(true);
    document.body.style.overflow = "hidden";
  };

  const selectStyle = {
    fontSize: "18px", // Increased font size
    padding: "10px",
    height: "50px", // Slightly taller for bigger text
  };

  // --- 1. Loading State ---
  if (loading && blogs.length === 0)
    return (
      <div style={{ position: "fixed", inset: 0, backgroundColor: "#000" }}>
        <BlogCardSkeleton />
      </div>
    );

  // --- 2. Fallback Screen (No Blogs Found) ---
  if (!loading && blogs.length === 0)
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${FALLBACK_IMAGE})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4,
          }}
        />

        <div
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={styles.filterTrigger}
          style={{ position: "absolute", top: 15, right: 15, zIndex: 110 }}
        >
          <div className={styles.rotatingIcon}>
            <SettingsIcon style={{ fontSize: "24px", color: "white" }} />
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            left: 0,
            padding: "16px",
            backgroundColor: "rgba(0,0,0,0.9)",
            backdropFilter: "blur(20px)",
            zIndex: 120,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            transform: isFilterOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubCategory("");
              }}
              className={styles.filterSelect}
              style={selectStyle}
            >
              <option value="" style={{ color: "black" }}>
                श्रेणी निवडा
              </option>
              {getCategoryKeys().map((key) => (
                <option key={key} value={key} style={{ color: "black" }}>
                  {categoryTranslations[key]}
                </option>
              ))}
            </select>
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              disabled={!selectedCategory}
              className={styles.filterSelect}
              style={{
                ...selectStyle,
                opacity: !selectedCategory ? 0.5 : 1,
              }}
            >
              <option value="" style={{ color: "black" }}>
                उप-श्रेणी निवडा
              </option>
              {selectedCategory &&
                getSubCategoryKeysForCategory(selectedCategory).map((key) => (
                  <option key={key} value={key} style={{ color: "black" }}>
                    {subCategoryTranslations[key]}
                  </option>
                ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              onClick={handleApplyFilters}
              fullWidth
              style={{
                backgroundColor: "#007bff",
                color: "white",
                borderRadius: "10px",
                fontWeight: "bold",
                height: "45px",
                textTransform: "none",
              }}
            >
              लागू करा
            </Button>
            <Button
              onClick={() => setIsFilterOpen(false)}
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "white",
                borderRadius: "10px",
                minWidth: "50px",
              }}
            >
              ✕
            </Button>
          </div>
        </div>

        <div style={{ zIndex: 10, textAlign: "center", padding: "0 20px" }}>
          <h2
            style={{ color: "white", marginBottom: "10px", fontSize: "22px" }}
          >
            काहीही आढळले नाही
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "30px" }}>
            तुमच्या फिल्टर्सनुसार ब्लॉग उपलब्ध नाहीत.
          </p>
          <Button
            variant="contained"
            onClick={handleClearFilters}
            style={{
              backgroundColor: "#fff",
              color: "#000",
              borderRadius: "50px",
              padding: "12px 30px",
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            सर्व फिल्टर्स काढा
          </Button>
        </div>
      </div>
    );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#000",
        overflow: "hidden",
        zIndex: isZoomed ? 1301 : 1,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        style={{
          position: "absolute",
          top: isZoomed ? 0 : 52,
          left: isZoomed ? 0 : 6,
          right: isZoomed ? 0 : 6,
          bottom: isZoomed ? 0 : 12,
          borderRadius: isZoomed ? 0 : "14px",
          overflow: "hidden",
          transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: isZoomed ? "none" : "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${currentBlog.blogImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: isZoomed ? "brightness(0.4)" : "brightness(1)",
          }}
        />

        {!isZoomed && (
          <div
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={styles.filterTrigger}
            style={{ position: "absolute", top: 15, right: 15, zIndex: 110 }}
          >
            <div className={styles.rotatingIcon}>
              <SettingsIcon style={{ fontSize: "24px" }} />
            </div>
          </div>
        )}

        {/* --- BOTTOM GRADIENT OVERLAY --- */}
        {!isZoomed && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "60%",
              background:
                "linear-gradient(to top, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        )}

        {!isZoomed && (
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              left: 0,
              padding: "16px",
              backgroundColor: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(20px)",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              borderRadius: "14px",
              transform: isFilterOpen ? "translateX(0)" : "translateX(100%)",
              transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubCategory("");
                }}
                className={styles.filterSelect}
                style={selectStyle}
              >
                <option value="" style={{ color: "black" }}>
                  श्रेणी निवडा
                </option>
                {getCategoryKeys().map((key) => (
                  <option key={key} value={key} style={{ color: "black" }}>
                    {categoryTranslations[key]}
                  </option>
                ))}
              </select>
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                disabled={!selectedCategory}
                className={styles.filterSelect}
                style={{ ...selectStyle, opacity: !selectedCategory ? 0.5 : 1 }}
              >
                <option value="" style={{ color: "black" }}>
                  उप-श्रेणी निवडा
                </option>
                {selectedCategory &&
                  getSubCategoryKeysForCategory(selectedCategory).map((key) => (
                    <option key={key} value={key} style={{ color: "black" }}>
                      {subCategoryTranslations[key]}
                    </option>
                  ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Button
                onClick={handleApplyFilters}
                fullWidth
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  borderRadius: "14px",
                  fontWeight: "bold",
                  height: "45px",
                  textTransform: "none",
                }}
              >
                लागू करा
              </Button>
              <Button
                onClick={() => setIsFilterOpen(false)}
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "white",
                  borderRadius: "14px",
                  minWidth: "50px",
                }}
              >
                ✕
              </Button>
            </div>
          </div>
        )}

        <div
          ref={contentRef}
          style={{
            position: "absolute",
            inset: 0,
            overflowY: isZoomed ? "auto" : "hidden",
            WebkitOverflowScrolling: "touch",
            zIndex: 2,
          }}
        >
          {!isZoomed && (
            <div
              style={{
                position: "absolute",
                top: 24,
                left: 20,
                color: "white",
                fontSize: "13px",
                fontWeight: 600,
                zIndex: 2,
              }}
            >
              {new Date(currentBlog.createdAt).toLocaleDateString("mr-IN")}
            </div>
          )}
          {!isZoomed && isLocked && (
            <div
              style={{
                position: "absolute",
                top: 80,
                right: 20,
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                zIndex: 10,
              }}
            >
              🔒
            </div>
          )}

          <div
            style={{
              position: isZoomed ? "relative" : "absolute",
              bottom: isZoomed ? "auto" : 0,
              left: 0,
              right: 0,
              padding: isZoomed ? "50vh 18px 24px" : "24px",
            }}
            onClick={!isZoomed ? handleZoom : undefined}
          >
            <h1
              style={{
                color: "white",
                fontWeight: 900,
                fontSize: isZoomed ? "28px" : "22px",
                textShadow: "0 2px 12px rgba(0,0,0,0.8)",
              }}
            >
              {currentBlog.title}
            </h1>
            {!isZoomed && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoom();
                }}
                style={{
                  width: "100%",
                  marginBottom: 20,
                  padding: 12,
                  backgroundColor: isLocked ? "#FF9800" : "white",
                  borderRadius: "50px",
                  fontWeight: 800,
                  color: isLocked ? "white" : "#000",
                  textTransform: "none",
                }}
              >
                {isLocked ? "🔒 सदस्यता घ्या आणि वाचा" : "वाचा"}
              </Button>
            )}
          </div>
          {isZoomed && (
            <div
              style={{
                padding: "4px 24px 40px",
                color: "white",
                fontSize: "18px",
                lineHeight: 1.8,
                whiteSpace: "pre-line",
              }}
            >
              <hr style={{ border: "1px solid rgba(255,255,255,0.2)" }} />
              {currentBlog.content}
            </div>
          )}
        </div>

        {isZoomed && (
          <button
            onClick={() => {
              setIsZoomed(false);
              document.body.style.overflow = "auto";
            }}
            style={{
              position: "fixed",
              top: 20,
              right: 20,
              width: 44,
              height: 44,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              border: "none",
              color: "white",
              fontSize: "24px",
              zIndex: 10001,
            }}
          >
            ✕
          </button>
        )}

        {showSwipeHint && !isZoomed && currentIndex === 0 && (
          <div className={styles.swipeIndicatorContainer}>
            <div className={styles.swipePath}></div>
            <div className={styles.swipeHandWrapper}>
              <div className={styles.swipeCircle}></div>
              <span className={styles.swipeArrow}>←</span>
            </div>
          </div>
        )}
      </div>

      {!isZoomed && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 8,
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: "10px 20px",
            borderRadius: "20px",
            zIndex: 10,
          }}
        >
          {blogs.map((_, index) => (
            <div
              key={index}
              style={{
                width: currentIndex === index ? 28 : 8,
                height: 8,
                borderRadius: "4px",
                backgroundColor:
                  currentIndex === index ? "white" : "rgba(255,255,255,0.4)",
                transition: "0.3s",
              }}
            />
          ))}
        </div>
      )}

      {/* --- SUBSCRIPTION MODAL --- */}
      <Modal
        open={isSubsModalOpen}
        onClose={() => setIsSubsModalOpen(false)}
        aria-labelledby="subscription-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "85%",
            bgcolor: "#1a1a1a",
            borderRadius: "20px",
            boxShadow: 24,
            p: 4,
            textAlign: "center",
            border: "1px solid #333",
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "white", fontWeight: "bold", mb: 2 }}
          >
            सदस्यता आवश्यक आहे
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 4 }}>
            हा ब्लॉग वाचण्यासाठी तुम्हाला सक्रिय सदस्यता (Subscription) असणे
            आवश्यक आहे.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => (window.location.href = "/subscription")}
              sx={{
                bgcolor: "#FF9800",
                color: "white",
                borderRadius: "50px",
                fontWeight: "bold",
                py: 1.5,
                "&:hover": { bgcolor: "#e68a00" },
              }}
            >
              सदस्यता घ्या
            </Button>
            <Button
              onClick={() => setIsSubsModalOpen(false)}
              sx={{
                color: "white",
                textTransform: "none",
                borderRadius: "50px",
                py: 1.5,
              }}
            >
              बंद करा
            </Button>
          </Box>
        </Box>
      </Modal>

      <style>{` body { margin: 0; padding: 0; overflow: hidden; } `}</style>
    </div>
  );
};

export default Blogs;
