// src/services/paperCache.js
import { get, set, del } from "idb-keyval";

/**
 * Helper: Generates a unique key based on the User ID.
 * This prevents data collision when multiple users use the same device.
 */
const getStorageKey = (paperId) => {
  try {
    // We try to find the user ID to isolate data.
    // Adjust "user_profile" to whatever key you use to store user details.
    const userStr = localStorage.getItem("user_profile");
    let userId = "guest";

    if (userStr) {
      const user = JSON.parse(userStr);
      // Handles typical ID formats (_id or id)
      userId = user._id || user.id || "guest";
    }

    return `u_${userId}_p_${paperId}`;
  } catch (e) {
    // Fallback if JSON parse fails
    return `u_guest_p_${paperId}`;
  }
};

export async function getCachedPaper(paperId) {
  try {
    const key = getStorageKey(paperId);
    const item = await get(key);

    if (!item) return null;

    // INTEGRITY CHECK:
    // If the cache was interrupted during save (not complete), ignore it.
    if (!item.isComplete) {
      await del(key);
      return null;
    }

    return item.data;
  } catch (err) {
    return null;
  }
}

export async function setCachedPaper(paperId, data, isComplete = false) {
  try {
    const key = getStorageKey(paperId);
    const item = {
      data,
      isComplete, // Only true if we have 100% of questions
      version: 1.0,
      updatedAt: Date.now(),
    };
    await set(key, item);
  } catch (err) {
    console.error("IndexedDB Save Error:", err);
  }
}

export async function removeCachedPaper(paperId) {
  const key = getStorageKey(paperId);
  await del(key);
}
