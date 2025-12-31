// src/services/paperCache.js

const CACHE_INDEX_KEY = "paper_cache_index";
const CACHE_PREFIX = "paper_cache_";
const MAX_CACHE_SIZE = 5;
const EXPIRATION_DAYS = 30;

/**
 * Gets the cache index (list of cached paper IDs)
 * @returns {string[]}
 */
function getCacheIndex() {
  try {
    const index = localStorage.getItem(CACHE_INDEX_KEY);
    return index ? JSON.parse(index) : [];
  } catch {
    return [];
  }
}

/**
 * Updates the cache index
 * @param {string[]} index
 */
function setCacheIndex(index) {
  localStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
}

/**
 * Removes the oldest item from the cache if it exceeds the max size
 */
function enforceCacheLimit() {
  const index = getCacheIndex();
  if (index.length > MAX_CACHE_SIZE) {
    const oldestPaperId = index.shift(); // Remove the first (oldest)
    localStorage.removeItem(`${CACHE_PREFIX}${oldestPaperId}`);
    setCacheIndex(index);
  }
}

/**
 * Get a cached paper by its ID
 * @param {string} paperId
 * @returns {object | null}
 */
export function getCachedPaper(paperId) {
  try {
    const itemStr = localStorage.getItem(`${CACHE_PREFIX}${paperId}`);
    if (!itemStr) {
      return null;
    }

    const item = JSON.parse(itemStr);
    const now = new Date();

    // Check for expiration
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(`${CACHE_PREFIX}${paperId}`);
      // Also remove from index
      const index = getCacheIndex().filter((id) => id !== paperId);
      setCacheIndex(index);
      return null;
    }

    return item.data;
  } catch {
    return null;
  }
}

/**
 * Cache a paper's data
 * @param {string} paperId
 * @param {object} data - The paper data to cache { paper, questions, submission }
 */
export function setCachedPaper(paperId, data) {
  try {
    const now = new Date();
    const expiry = now.getTime() + EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

    const item = {
      data,
      expiry,
    };

    localStorage.setItem(`${CACHE_PREFIX}${paperId}`, JSON.stringify(item));

    // Update the index
    const index = getCacheIndex();
    // Remove if already exists to move it to the end (most recent)
    const filteredIndex = index.filter((id) => id !== paperId);
    filteredIndex.push(paperId);
    setCacheIndex(filteredIndex);

    enforceCacheLimit();
  } catch (error) {
    // console.error("Failed to cache paper:", error);
  }
}

/**
 * Clear the entire paper cache
 */
export function clearAllPaperCaches() {
  const index = getCacheIndex();
  index.forEach((paperId) => {
    localStorage.removeItem(`${CACHE_PREFIX}${paperId}`);
  });
  localStorage.removeItem(CACHE_INDEX_KEY);
}

/**
 * Removes a single paper from the cache
 * @param {string} paperId
 */
export function removeCachedPaper(paperId) {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${paperId}`);
    const index = getCacheIndex().filter((id) => id !== paperId);
    setCacheIndex(index);
  } catch (error) {
    // console.error("Failed to remove cached paper:", error);
  }
}
