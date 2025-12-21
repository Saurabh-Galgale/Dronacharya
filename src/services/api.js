// src/services/api.js
import axios from "axios";
import { API_BASE_URL } from "../config/env";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= REQUEST INTERCEPTOR ================= */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage directly to avoid circular dependency
    const token = localStorage.getItem("auth_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

/* ================= RESPONSE INTERCEPTOR ================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear all auth data
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_profile");

      // Only redirect if not already on landing page or reset password
      if (
        window.location.pathname !== "/" &&
        !window.location.pathname.startsWith("/reset-password")
      ) {
        window.location.href = "/";
      }
    }

    // Normalize error message from backend
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    // Create a proper Error object
    const normalizedError = new Error(message);
    normalizedError.status = error.response?.status;
    normalizedError.originalError = error;

    return Promise.reject(normalizedError);
  }
);

/* ================= PAPERS API ================= */

/**
 * Get Mock Papers (paginated)
 * GET /api/papers/mock?page=1&limit=20
 */
export async function getMockPapers(page = 1, limit = 20) {
  try {
    const res = await api.get(`/api/papers/mock`, {
      params: { page, limit },
    });
    return res.data.data; // { papers: [], totalPages, currentPage }
  } catch (error) {
    throw new Error(error.message || "Failed to fetch mock papers");
  }
}

/**
 * Get PYQ Papers (paginated)
 * GET /api/papers/pyq?page=1&limit=20
 */
export async function getPYQPapers(page = 1, limit = 20) {
  try {
    const res = await api.get(`/api/papers/pyq`, {
      params: { page, limit },
    });
    return res.data.data; // { papers: [], totalPages, currentPage }
  } catch (error) {
    throw new Error(error.message || "Failed to fetch PYQ papers");
  }
}

/**
 * Get Single Paper with Questions (paginated)
 * GET /api/papers/:type/:paperId?page=1&limit=10
 * @param {string} type - 'mock' or 'pyq'
 * @param {string} paperId - Paper ID
 * @param {number} questionPage - Question page number
 * @param {number} questionLimit - Questions per page
 */

const PAPER_CACHE_PREFIX = "paper_questions_cache_";

export async function getPaperWithQuestions(
  type,
  paperId,
  questionPage = 1,
  questionLimit = 10
) {
  const cacheKey = `${PAPER_CACHE_PREFIX}${type}_${paperId}_${questionPage}_${questionLimit}`;
  // Try sessionStorage first
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // Ignore parse error, fallback to API
    }
  }

  try {
    const res = await api.get(`/api/papers/${type}/${paperId}`, {
      params: { page: questionPage, limit: questionLimit },
    });
    const data = res.data.data; // { paper: {}, questions: [], totalPages, currentPage }
    sessionStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch paper");
  }
}

// Optional: Call this on logout/session end to clear all cached papers
export function clearPaperQuestionsCache() {
  Object.keys(sessionStorage)
    .filter((key) => key.startsWith(PAPER_CACHE_PREFIX))
    .forEach((key) => sessionStorage.removeItem(key));
}

export default api;
