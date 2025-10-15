// src/services/api.js
import axios from "axios";
import { getToken } from "./authService";

const API_BASE = import.meta.env.VITE_AWS_API_BASE_URL || "";

// Create an axios instance
const instance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor: add Authorization header when token present
instance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// Response interceptor: unwrap errors to a friendly format
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    // normalize error shape
    const e = err;
    const payload = {
      message:
        (e.response && e.response.data && e.response.data.error) ||
        (e.response && e.response.statusText) ||
        e.message ||
        "Unknown error",
      status: e.response ? e.response.status : null,
      raw: e,
    };
    return Promise.reject(payload);
  }
);

// Generic helpers
export async function apiGet(path, params = {}) {
  const res = await instance.get(path, { params });
  return res.data;
}

export async function apiPost(path, body = {}, params = {}) {
  const res = await instance.post(path, body, { params });
  return res.data;
}

export async function apiPut(path, body = {}, params = {}) {
  const res = await instance.put(path, body, { params });
  return res.data;
}

export async function apiDelete(path, params = {}) {
  const res = await instance.delete(path, { params });
  return res.data;
}

// Specific endpoints (paper listing)
export async function listPapers(options = {}) {
  // options: { page, pageSize, type, solved, q, subject, className, published, tag }
  return apiGet("/api/qp/papers", options);
}
/**
 * getPaperView
 *
 * Returns one of:
 *  - { mode: "review", submission, paperMeta }    // user already submitted -> review mode
 *  - { mode: "attempt", paper }                  // user can attempt -> paper with questions
 *  - or throws normalized error { message, status, raw }
 *
 * Backend endpoints used:
 *  - GET /api/submissions/paper/:paperId   (returns submission or 404)
 *  - GET /api/qp/papers/:paperId           (returns question paper)
 *
 * view param:
 *  - "review"  -> fetch submission only (fail if no submission)
 *  - "attempt" -> fetch paper only
 *  - "auto"    -> try submission first, fallback to paper when submission not found (404/403)
 */
export async function getPaperView(paperId, view = "auto") {
  if (!paperId) throw { message: "paperId required", status: 400 };

  const safeId = encodeURIComponent(String(paperId));

  // helper to call paper endpoint
  const fetchPaper = async () => {
    // returns the paper object from backend
    // adjust path if your backend uses a different route
    const paper = await apiGet(`/api/qp/papers/${safeId}`);
    return { mode: "attempt", paper };
  };

  // helper to call submission endpoint
  const fetchSubmission = async () => {
    // returns submission object (or throws with status)
    const submission = await apiGet(`/api/submissions/paper/${safeId}`);
    return submission;
  };

  try {
    const normalizedView = String(view || "auto").toLowerCase();

    if (normalizedView === "review") {
      const submission = await fetchSubmission();
      return {
        mode: "review",
        submission,
        paperMeta: submission?.paperMeta || submission?.paper || null,
      };
    }

    if (normalizedView === "attempt") {
      return await fetchPaper();
    }

    // auto: try submission first, fallback to paper when submission missing
    try {
      const submission = await fetchSubmission();
      return {
        mode: "review",
        submission,
        paperMeta: submission?.paperMeta || submission?.paper || null,
      };
    } catch (err) {
      // If submission not found or access denied -> fallback to paper
      if (err && err.status && (err.status === 404 || err.status === 403)) {
        return await fetchPaper();
      }
      // otherwise rethrow (network / server error)
      throw err;
    }
  } catch (err) {
    // Rethrow normalized error so frontend sees { message, status, raw }
    throw err && err.message
      ? err
      : { message: "Unknown error", status: null, raw: err };
  }
}

export default {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  listPapers,
  getPaperView,
  instance,
};
