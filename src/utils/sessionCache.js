const EXPIRATION_DAYS = 1;
const EXPIRATION_MS = EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

// 1 min for testing
// const EXPIRATION_MINUTES = 1;
// const EXPIRATION_MS = EXPIRATION_MINUTES * 60 * 1000;

/**
 * Gets the expiration key for a given cache prefix.
 * @param {string} prefix - The prefix for the cache group (e.g., 'mock_papers').
 * @returns {string} The key for the expiration timestamp.
 */
const getExpiryKey = (prefix) => `${prefix}_expiry`;

/**
 * Sets a value in the session cache for paginated data.
 * It also sets a shared expiration for all items sharing the same prefix.
 * @param {string} key - The specific key for the data (e.g., 'mock_papers_page_1').
 * @param {any} data - The data to be cached.
 * @param {string} prefix - The common prefix for this group of cached items.
 */
export const setPaginatedCache = (key, data, prefix) => {
  sessionStorage.setItem(key, JSON.stringify(data));

  const expiryKey = getExpiryKey(prefix);
  // Set the master expiration timestamp only if it doesn't already exist for this prefix.
  if (!sessionStorage.getItem(expiryKey)) {
    const expires = new Date().getTime() + EXPIRATION_MS;
    sessionStorage.setItem(expiryKey, expires.toString());
  }
};

/**
 * Gets a value from the session cache for paginated data.
 * It checks the shared expiration timestamp for the prefix. If expired, it clears all related cache items.
 * @param {string} key - The specific key of the data to retrieve.
 * @param {string} prefix - The common prefix for the cache group.
 * @returns {any|null} The cached data or null if it's expired or doesn't exist.
 */
export const getPaginatedCache = (key, prefix) => {
  const expiryKey = getExpiryKey(prefix);
  const expiryTimestampStr = sessionStorage.getItem(expiryKey);

  if (!expiryTimestampStr) {
    return null; // No master expiration found, so cache is considered invalid.
  }

  const expiryTimestamp = parseInt(expiryTimestampStr, 10);
  const now = new Date().getTime();

  if (now > expiryTimestamp) {
    // Cache has expired. Invalidate all items with this prefix.
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => sessionStorage.removeItem(k));
    return null;
  }

  const itemStr = sessionStorage.getItem(key);
  return itemStr ? JSON.parse(itemStr) : null;
};

/**
 * Sets a simple key-value pair in the session cache with a self-contained expiration.
 * @param {string} key - The key for the cache item.
 * @param {any} data - The data to be cached.
 */
export const setSimpleCache = (key, data) => {
  const item = {
    data,
    expires: new Date().getTime() + EXPIRATION_MS,
  };
  sessionStorage.setItem(key, JSON.stringify(item));
};

/**
 * Gets a simple key-value pair from the session cache.
 * It checks the item's self-contained expiration timestamp.
 * @param {string} key - The key of the item to retrieve.
 * @returns {any|null} The cached data or null if it's expired or doesn't exist.
 */
export const getSimpleCache = (key) => {
  const itemStr = sessionStorage.getItem(key);
  if (!itemStr) {
    return null;
  }

  const item = JSON.parse(itemStr);
  const now = new Date().getTime();

  if (now > item.expires) {
    sessionStorage.removeItem(key);
    return null;
  }
  return item.data;
};
