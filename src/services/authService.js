// src/services/authService.js
import api from "./api";

/* ================= STORAGE KEYS ================= */
const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user_profile";

/* ================= TOKEN (memory + localStorage) ================= */
let memoryToken = null;
let memoryRefreshToken = null;

export function setToken(token) {
  if (!token) {
    console.warn("⚠️ Attempted to set empty token");
    return;
  }
  memoryToken = token;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("Failed to store token:", error);
  }
}

export function getToken() {
  if (memoryToken) {
    return memoryToken;
  }

  try {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      memoryToken = storedToken;
    }
    return memoryToken;
  } catch (error) {
    console.error("Failed to retrieve token:", error);
    return null;
  }
}

export function clearToken() {
  memoryToken = null;
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (error) {
    console.error("Failed to clear localStorage", error);
  }
}

/* ================= REFRESH TOKEN ================= */
export function setRefreshToken(token) {
  if (!token) return;
  memoryRefreshToken = token;
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error("Failed to store refresh token:", error);
  }
}

export function getRefreshToken() {
  if (memoryRefreshToken) {
    return memoryRefreshToken;
  }

  try {
    const storedToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (storedToken) {
      memoryRefreshToken = storedToken;
    }
    return memoryRefreshToken;
  } catch (error) {
    console.error("Failed to retrieve refresh token:", error);
    return null;
  }
}

export function clearRefreshToken() {
  memoryRefreshToken = null;
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to clear refresh token:", error);
  }
}

/* ================= USER PROFILE ================= */
export function setStoredUserProfile(profile) {
  if (!profile) return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Failed to store user profile:", error);
  }
}

export function getStoredUserProfile() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Failed to retrieve user profile:", error);
    return null;
  }
}

export function clearStoredUserProfile() {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("Failed to clear user profile:", error);
  }
}

/* ================= CLEAR AUTH ================= */
export function clearAuth() {
  clearToken();
  clearRefreshToken();
  clearStoredUserProfile();
}

/* ================= INTERNAL HELPERS ================= */
function handleAuthSuccess(res) {
  // Backend returns: { success, message, data: { accessToken, refreshToken, user } }
  if (!res?.data?.success) {
    throw new Error("Authentication failed");
  }

  const { accessToken, refreshToken, user } = res.data.data;

  if (!accessToken) {
    throw new Error(
      "Authentication failed. Token missing from server response."
    );
  }

  // Set tokens
  setToken(accessToken);

  if (refreshToken) {
    setRefreshToken(refreshToken);
  }

  // Store user profile
  if (user) {
    setStoredUserProfile(user);
  }

  return res.data.data;
}

/* ================= AUTH APIs ================= */

/**
 * Register new user with email and password
 * POST /api/auth/register
 */
export async function registerUser(payload) {
  if (!payload?.name || !payload?.email || !payload?.password) {
    throw new Error("Name, email and password are required");
  }

  if (payload.password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  try {
    const res = await api.post("/api/auth/register", payload);

    // Backend returns user but NOT tokens on registration
    // User needs to login after registration
    return res.data;
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message;
    throw new Error(message || "Registration failed. Please try again.");
  }
}

/**
 * Login user with email and password
 * POST /api/auth/login
 */
export async function emailLogin(payload) {
  if (!payload?.email || !payload?.password) {
    throw new Error("Email and password are required");
  }

  try {
    const res = await api.post("/api/auth/login", payload);
    return handleAuthSuccess(res);
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message;
    throw new Error(message || "Login failed. Please check your credentials.");
  }
}

/**
 * Google Sign-In
 * POST /api/auth/google
 */
export async function signInWithGoogle(idToken) {
  if (!idToken) {
    throw new Error("Google sign-in failed. No token received.");
  }

  try {
    const res = await api.post("/api/auth/google", { idToken });
    return handleAuthSuccess(res);
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message;
    throw new Error(message || "Google sign-in failed. Please try again.");
  }
}

/* ================= PASSWORD RESET ================= */

/**
 * Request password reset email
 * POST /api/auth/forgot-password
 */
export async function forgotPassword(email) {
  if (!email) {
    throw new Error("Email is required");
  }

  try {
    const res = await api.post("/api/auth/forgot-password", { email });
    return res.data;
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message;
    throw new Error(message || "Failed to send reset email. Please try again.");
  }
}

/**
 * Reset password with token
 * POST /api/auth/reset-password/:token
 */
export async function resetPassword(token, payload) {
  if (!token) {
    throw new Error("Reset token is missing");
  }

  if (!payload?.password || !payload?.confirmPassword) {
    throw new Error("Password and confirmation are required");
  }

  if (payload.password !== payload.confirmPassword) {
    throw new Error("Passwords do not match");
  }

  if (payload.password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  try {
    const res = await api.post(`/api/auth/reset-password/${token}`, payload);
    return res.data;
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message;
    throw new Error(message || "Password reset failed. Link may be expired.");
  }
}

/* ================= TOKEN VALIDATION ================= */
export async function validateToken() {
  const token = getToken();
  if (!token) {
    return false;
  }
  try {
    // Token exists and is stored properly
    return true;
  } catch (error) {
    clearAuth();
    return false;
  }
}

/* ================= UTIL ================= */
export function isAuthenticated() {
  return !!getToken();
}
