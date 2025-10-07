// src/services/authService.js
// Lightweight auth + API helper without external jwt-decode dependency.

// const API_BASE = import.meta.env.VITE_API_BASE_URL || ""; //keeping for quick DEV check
const API_BASE = import.meta.env.VITE_AWS_API_BASE_URL || "";

// token storage
let tokenInMemory = null;
const TOKEN_KEY = "token";
const DEVICE_KEY = "device_id";
const USER_PROFILE_KEY = "userProfile";

// ===== small JWT payload decoder (no verification) =====
function base64UrlDecode(str) {
  if (!str) return null;
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = str.length % 4;
  if (pad) {
    str += "=".repeat(4 - pad);
  }
  try {
    const decoded = atob(str);
    try {
      return decodeURIComponent(
        decoded
          .split("")
          .map((c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
    } catch {
      return decoded;
    }
  } catch (e) {
    return null;
  }
}

function decodeJwt(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const payload = parts[1];
  const json = base64UrlDecode(payload);
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

// ===== Token Handling =====
export function setToken(token, persist = true) {
  tokenInMemory = token;
  if (persist) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      // ignore
    }
  }
}
export function clearToken() {
  tokenInMemory = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {}
}
export function loadTokenFromStorage() {
  if (!tokenInMemory) {
    try {
      tokenInMemory = localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      tokenInMemory = null;
    }
  }
  return tokenInMemory;
}
export function getToken() {
  return tokenInMemory || loadTokenFromStorage();
}
export function getUserFromToken() {
  const t = getToken();
  if (!t) return null;
  return decodeJwt(t);
}

// ===== Device Handling =====
export function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = cryptoRandomUUID();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return cryptoRandomUUID();
  }
}
function cryptoRandomUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "dev-" + Math.random().toString(36).slice(2, 10);
}

// ===== Local userProfile helpers =====
function transformServerUser(serverUser) {
  if (!serverUser) return null;

  // convert permissions array to boolean flags
  const permFlags = {};
  if (Array.isArray(serverUser.permissions)) {
    serverUser.permissions.forEach((p) => {
      if (p && p.key) {
        // create a safe camelCase key
        const key = p.key.replace(/[^a-zA-Z0-9]/g, "");
        permFlags[key] = !!p.allowed;
      }
    });
  }

  return {
    id: serverUser.id || null,
    name: serverUser.name || "",
    email: serverUser.email || "",
    picture: serverUser.picture || serverUser.avatar || "",
    role: serverUser.role || serverUser.userType || "",
    // flattened permission booleans (example keys from your payload)
    canSeeBlogs: !!permFlags.canSeeBlogs,
    canSeeQp: !!permFlags.canSeeQp,
    canSeeCa: !!permFlags.canSeeCa,
    // subscription simplified to boolean (active or not)
    subscription: !!(serverUser.subscription && serverUser.subscription.active),
    // optional useful metadata
    createdAt: serverUser.createdAt || new Date().toISOString(),
    phone: serverUser.phone || "",
    // keep raw permissions if you ever need them
    _rawPermissions: serverUser.permissions || [],
  };
}

export function getStoredUserProfile() {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUserProfile(profile) {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    // ignore
  }
}

export function clearStoredUserProfile() {
  try {
    localStorage.removeItem(USER_PROFILE_KEY);
  } catch {}
}

// ===== API Calls =====
export async function signInWithGoogle(idToken) {
  const payload = {
    idToken,
    deviceId: getDeviceId(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "node",
  };
  const res = await fetch(`${API_BASE}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Sign-in failed");
  }
  const data = await res.json();
  if (data.token) setToken(data.token, true);

  // if server returns user object, transform and persist simplified profile
  if (data.user) {
    const transformed = transformServerUser(data.user);
    setStoredUserProfile(transformed);
  }

  return data;
}

export async function signInAdmin(idToken) {
  const payload = {
    idToken,
    deviceId: getDeviceId(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "node",
  };
  const res = await fetch(`${API_BASE}/api/auth/google/admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Admin sign-in failed");
  }
  const data = await res.json();
  if (data.token) setToken(data.token, true);

  if (data.user) {
    const transformed = transformServerUser(data.user);
    setStoredUserProfile(transformed);
  }

  return data;
}

export async function apiFetch(path, opts = {}) {
  const token = getToken();
  const headers = { ...(opts.headers || {}) };
  if (token) headers["Authorization"] = "Bearer " + token;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (res.status === 401) {
    clearToken();
    clearStoredUserProfile();
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json().catch(() => null);
}

// export transformer for external use
export { transformServerUser };

export default {
  setToken,
  clearToken,
  loadTokenFromStorage,
  getToken,
  getUserFromToken,
  getDeviceId,
  signInWithGoogle,
  signInAdmin,
  apiFetch,
  // profile helpers
  getStoredUserProfile,
  setStoredUserProfile,
  clearStoredUserProfile,
  transformServerUser,
};
