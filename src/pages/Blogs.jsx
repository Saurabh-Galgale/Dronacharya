import React, { useState, useRef, useEffect, useCallback } from "react";
import { getBlogs } from "../services/api";
import { getStoredUserProfile } from "../services/authService"; // Assuming auth service exists
import {
  categoryTranslations,
  subCategoryTranslations,
  getCategoryKeys,
  getSubCategoryKeysForCategory,
} from "../utils/translations";

// --- Skeleton Loader Component ---
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
  // --- UI State ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const contentRef = useRef(null);

  // --- Filter State ---
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  // --- Data & API State ---
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false); // For background fetches
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    category: "",
    subCategory: "",
  });

  const userProfile = getStoredUserProfile();
  const isSubscribed = userProfile?.subscription?.active || false;

  const getCacheKey = useCallback(
    () =>
      activeFilters.category
        ? `blog_filter_cache_${activeFilters.category}`
        : "blog_feed_cache",
    [activeFilters.category]
  );

  // --- Data Fetching and Caching ---
  const fetchAndCacheBlogs = useCallback(
    async (pageNum, filters) => {
      if (isFetchingMore) return;

      const isInitialLoad = pageNum === 1;
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setIsFetchingMore(true);
      }
      setError(null);

      try {
        const response = await getBlogs(
          pageNum,
          2,
          filters.category,
          filters.subCategory
        );

        const newBlogs = response.data;
        const pagination = response.pagination;

        setBlogs((prev) => (isInitialLoad ? newBlogs : [...prev, ...newBlogs]));
        setPage(pagination.currentPage);
        setHasNextPage(pagination.currentPage < pagination.totalPages);

        // Update cache
        const cacheKey = getCacheKey();
        const updatedCache = {
          blogs: isInitialLoad ? newBlogs : [...blogs, ...newBlogs],
          page: pagination.currentPage,
          hasNextPage: pagination.currentPage < pagination.totalPages,
        };
        sessionStorage.setItem(cacheKey, JSON.stringify(updatedCache));
      } catch (err) {
        setError(err.message || "Failed to fetch blogs.");
        console.error(err);
      } finally {
        if (isInitialLoad) setLoading(false);
        setIsFetchingMore(false);
      }
    },
    [blogs, getCacheKey, isFetchingMore]
  );

  // --- Effect for Initial Load ---
  useEffect(() => {
    const cacheKey = getCacheKey();
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
      const { blogs: cachedBlogs, page: cachedPage, hasNextPage: cachedHasNextPage } =
        JSON.parse(cachedData);
      setBlogs(cachedBlogs);
      setPage(cachedPage);
      setHasNextPage(cachedHasNextPage);
      setLoading(false);
    } else {
      fetchAndCacheBlogs(1, activeFilters);
    }
  }, [activeFilters, fetchAndCacheBlogs, getCacheKey]); // Re-run on filter change

  // --- Effect for "Fetch-in-advance" ---
  useEffect(() => {
    const shouldPrefetch =
      (currentIndex + 1) % 2 === 0 && // On 2nd, 4th, 6th... blog
      currentIndex > 0 && // Not on the very first blog
      hasNextPage &&
      !isFetchingMore;

    if (shouldPrefetch) {
       fetchAndCacheBlogs(page + 1, activeFilters);
    }
  }, [currentIndex, hasNextPage, isFetchingMore, page, activeFilters, fetchAndCacheBlogs]);


  // --- Event Handlers ---
  const handleApplyFilters = () => {
    // Reset state before fetching new filtered data
    setBlogs([]);
    setCurrentIndex(0);
    setPage(1);
    setHasNextPage(true);
    setActiveFilters({
      category: selectedCategory,
      subCategory: selectedSubCategory,
    });
  };

  const handleClearFilters = () => {
    // Reset state and revert to default feed
    setBlogs([]);
    setCurrentIndex(0);
    setPage(1);
    setHasNextPage(true);
    setSelectedCategory("");
    setSelectedSubCategory("");
    setActiveFilters({ category: "", subCategory: "" });
  };


  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeHint(false);
    }, 30000); // Hide hint after 30s
    return () => clearTimeout(timer);
  }, []);


  const currentBlog = blogs[currentIndex];

  if (loading && blogs.length === 0) {
    return (
       <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000' }}>
         <BlogCardSkeleton />
       </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: 'white', textAlign: 'center', paddingTop: '50%' }}>
        <h2>Something went wrong</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!currentBlog) {
     return (
      <div style={{ color: 'white', textAlign: 'center', paddingTop: '50%' }}>
        <h2>No blogs available.</h2>
        <p>Please check back later.</p>
      </div>
    );
  }

  const isLocked = !currentBlog.isFree && !isSubscribed;


  const handleTouchStart = (e) => {
    if (!isZoomed) {
      setTouchStart(e.targetTouches[0].clientX);
    }
  };

  const handleTouchMove = (e) => {
    if (!isZoomed) {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (!isZoomed && touchStart && touchEnd) {
      const distance = touchStart - touchEnd;
      const minSwipeDistance = 50;

      if (distance > minSwipeDistance && currentIndex < blogs.length - 1) {
        setCurrentIndex(currentIndex + 1);
        if (showSwipeHint) setShowSwipeHint(false);
      } else if (distance < -minSwipeDistance && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }

      setTouchStart(0);
      setTouchEnd(0);
    }
  };

  const handleZoom = () => {
    if (isLocked) {
      window.location.href = "/subscription";
      return;
    }
    setIsZoomed(true);
    document.body.style.overflow = "hidden";
  };

  const handleClose = () => {
    setIsZoomed(false);
    document.body.style.overflow = "auto";
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#000",
        overflow: "hidden",
        zIndex: isZoomed ? 1301 : 1,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Card Container */}
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
        {/* Background Image */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${currentBlog.blogImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: isZoomed ? "brightness(0.4)" : "brightness(1)",
            transition: "filter 0.6s ease",
          }}
        />

        {/* Gradient Overlay - Only in normal view */}
        {!isZoomed && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "55%",
              background:
                "linear-gradient(to top, rgb(0, 0, 0) 30%, rgba(0,0,0,0) 100%)",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Fixed dark overlay for readability (ZOOMED ONLY) */}
        {isZoomed && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.55)",
              pointerEvents: "none",
            }}
          />
        )}

        {/* --- Filter Bar --- */}
        {!isZoomed && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              padding: "12px",
              backgroundColor: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(8px)",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
            // Stop touch events from propagating to the swipe handler
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubCategory(""); // Reset
              }}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "6px",
                padding: "6px 8px",
                flex: "1 1 120px",
                fontSize: "13px",
              }}
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
              disabled={
                !selectedCategory ||
                getSubCategoryKeysForCategory(selectedCategory).length === 0
              }
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "6px",
                padding: "6px 8px",
                flex: "1 1 120px",
                fontSize: "13px",
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
            <button
              onClick={handleApplyFilters}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "7px 12px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "13px",
              }}
            >
              लागू करा
            </button>
            <button
              onClick={handleClearFilters}
              style={{
                backgroundColor: "#555",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                padding: 0,
                lineHeight: "32px",
                textAlign: "center",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Lock Icon - Top Right Corner (Normal view only) */}
        {!isZoomed && isLocked && (
          <div
            style={{
              position: "absolute",
              top: 80, // Adjusted for filter bar
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

        {/* Content Scrollable Area */}
        <div
          ref={contentRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflowY: isZoomed ? "auto" : "hidden",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Title and Info Section */}
          <div
            style={{
              position: isZoomed ? "relative" : "absolute",
              bottom: isZoomed ? "auto" : 0,
              left: 0,
              right: 0,
              padding: isZoomed ? "50vh 18px 24px" : "24px",
              minHeight: isZoomed ? "auto" : 0,
              cursor: !isZoomed ? "pointer" : "default",
            }}
            onClick={!isZoomed ? handleZoom : undefined}
          >
            <h1
              style={{
                color: "white",
                fontWeight: 900,
                fontSize: isZoomed ? "28px" : "22px",
                lineHeight: 1.2,
                margin: "0 0 16px 0",
                textShadow: "0 2px 12px rgba(0,0,0,0.8)",
              }}
            >
              {currentBlog.title}
            </h1>

            {!isZoomed && (
              <button
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
                  fontSize: "15px",
                  color: isLocked ? "white" : "#000",
                  boxShadow: "0 4px 20px rgba(255,255,255,0.3)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {isLocked ? (
                  <>
                    <span>🔒</span>
                    <span>सदस्यता घ्या आणि वाचा</span>
                  </>
                ) : (
                  <span>वाचा</span>
                )}
              </button>
            )}
          </div>

          {/* Blog Content - Only in zoomed view */}
          {isZoomed && (
            <div
              style={{
                padding: "4px 24px 40px",
                minHeight: "60vh",
              }}
            >
              <hr style={{ border: "1px solid rgba(255,255,255,0.2)" }} />
              <p
                style={{
                  color: "white",
                  fontSize: "18px",
                  lineHeight: 1.8,
                  whiteSpace: "pre-line",
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                {currentBlog.content}
              </p>
            </div>
          )}
        </div>

        {/* Close Button - Only in zoomed view */}
        {isZoomed && (
          <button
            onClick={handleClose}
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
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10001,
              transition: "all 0.2s ease",
            }}
          >
            ✕
          </button>
        )}

        {/* Swipe Hint */}
        {showSwipeHint && !isZoomed && currentIndex === 0 && (
          <div style={{
             position: 'absolute',
             bottom: '100px',
             left: '50%',
             transform: 'translateX(-50%)',
             zIndex: 10,
             animation: 'swipeHint 2.5s ease-in-out infinite'
          }}>
            <span style={{ fontSize: '40px' }}>👈</span>
          </div>
        )}
      </div>

      {/* Page Indicators - Only in normal view */}
      {!isZoomed && blogs.length > 0 && (
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
            backdropFilter: "blur(10px)",
          }}
        >
          {blogs.map((blog, index) => (
            <div
              key={blog._id}
              style={{
                width: currentIndex === index ? 28 : 8,
                height: 8,
                borderRadius: "4px",
                backgroundColor:
                  currentIndex === index ? "white" : "rgba(255,255,255,0.4)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      )}

      <style>
        {`
          @keyframes swipeHint {
            0%, 100% {
              transform: translateX(0);
              opacity: 1;
            }
            50% {
              transform: translateX(-30px);
              opacity: 0.5;
            }
          }

          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
        `}
      </style>
    </div>
  );
};

export default Blogs;
