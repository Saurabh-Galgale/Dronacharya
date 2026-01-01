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
 * Generic paper fetcher
 * @param {string} type - 'mock' or 'pyq'
 * @param {string} filter - 'solved' or 'unsolved'
 * @param {number} page
 * @param {number} limit
 */
async function fetchPapers(type, filter = "unsolved", page = 1, limit = 20) {
  const url = `/api/papers/${type}/${filter}`;
  try {
    const res = await api.get(url, { params: { page, limit } });
    return res.data.data; // { papers: [], totalPages, currentPage }
  } catch (error) {
    throw new Error(
      error.message || `Failed to fetch ${filter} ${type} papers`
    );
  }
}

// Mock Papers
export const getSolvedMockPapers = (page, limit) =>
  fetchPapers("mock", "solved", page, limit);
export const getUnsolvedMockPapers = (page, limit) =>
  fetchPapers("mock", "unsolved", page, limit);

// PYQ Papers
export const getSolvedPYQPapers = (page, limit) =>
  fetchPapers("pyq", "solved", page, limit);
export const getUnsolvedPYQPapers = (page, limit) =>
  fetchPapers("pyq", "unsolved", page, limit);

/**
 * Get Single Paper with Questions (paginated)
 * GET /api/papers/:type/:paperId?page=1&limit=10
 * @param {string} type - 'mock' or 'pyq'
 * @param {string} paperId - Paper ID
 * @param {number} questionPage - Question page number
 * @param {number} questionLimit - Questions per page
 */
export async function getPaperWithQuestions(
  type,
  paperId,
  questionPage = 1,
  questionLimit = 10
) {
  try {
    const res = await api.get(`/api/papers/${type}/${paperId}`, {
      params: { page: questionPage, limit: questionLimit },
    });
    return res.data.data; // { paper: {}, questions: [], totalPages, currentPage }
  } catch (error) {
    throw new Error(error.message || "Failed to fetch paper");
  }
}

/**
 * Submit Paper Answers
 * POST /api/submissions
 * @param {string} paperId - Paper ID
 * @param {string} paperType - 'mock' or 'pyq'
 * @param {Object} answers - { questionId: selectedOption }
 * @param {number} timeSpent - Time in seconds
 */
export async function submitPaper(paperId, paperType, answers, timeSpent) {
  try {
    const res = await api.post("/api/submissions", {
      paperId,
      paperType,
      answers,
      timeSpent,
    });
    return res.data.data; // Submission analysis data
  } catch (error) {
    throw new Error(error.message || "Failed to submit paper");
  }
}

/**
 * Get Submission Analysis
 * GET /api/submissions/:submissionId
 * @param {string} submissionId - Submission ID
 */
export async function getSubmissionAnalysis(submissionId) {
  try {
    const res = await api.get(`/api/submissions/${submissionId}`);
    return res.data.data;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch analysis");
  }
}

/**
 * Get User's Paper Submissions (for history)
 * GET /api/submissions/paper/:paperId
 * @param {string} paperId - Paper ID
 */
export async function getPaperSubmissions(paperId) {
  try {
    const res = await api.get(`/api/submissions/paper/${paperId}`);
    return res.data.data; // Array of submissions
  } catch (error) {
    throw new Error(error.message || "Failed to fetch submissions");
  }
}

/* ================= MAGAZINES API ================= */

/**
 * Get all magazines
 * GET /api/magazines
 */
export async function getMagazines() {
  try {
    const res = await api.get("/api/magazines");
    return res.data.data;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch magazines");
  }
}

/**
 * Get a single magazine by ID
 * GET /api/magazines/:id
 * @param {string} magazineId - Magazine ID
 */
export async function getMagazineById(magazineId) {
  try {
    const res = await api.get(`/api/magazines/${magazineId}`);
    return res.data.data;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch magazine details");
  }
}

/**
 * Get quiz questions for a magazine
 * GET /api/magazines/:id/quiz
 * @param {string} magazineId - Magazine ID
 */
export async function getMagazineQuiz(magazineId) {
  try {
    const res = await api.get(`/api/magazines/${magazineId}/quiz`);
    return res.data.data;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch magazine quiz");
  }
}

export default api;

/* ================= BLOGS API ================= */

/**
 * Get blogs with pagination and filtering
 * GET /api/blogs?page=1&limit=10&category=gk&subCategory=politics
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {string} [category] - Optional category filter
 * @param {string} [subCategory] - Optional sub-category filter
 */
export async function getBlogs(page = 1, limit = 2, category, subCategory) {
  try {
    const params = { page, limit };
    if (category) params.category = category;
    if (subCategory) params.subCategory = subCategory;

    const res = await api.get("/api/blogs", { params });
    return res.data; // { success, count, pagination, data }
  } catch (error) {
    throw new Error(error.message || "Failed to fetch blogs");
  }
}
