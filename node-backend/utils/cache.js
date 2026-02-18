const { redisClient, isRedisReady } = require("../config/redisClient");

// Cache TTL constants (in seconds)
const TTL = {
  SINGLE_USER: 300, // 5 minutes
  PAGINATED_LIST: 120, // 2 minutes
};

// Cache key generators
const cacheKeys = {
  user: (id) => `user:${id}`,
  usersPage: (page, limit) => `users:page:${page}:limit:${limit}`,
};

/**
 * Get data from cache or fetch from database and cache it
 * Implements Cache-Aside Pattern
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function to fetch data from database
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>} - Data from cache or database
 */
const getOrSetCache = async (key, fetchFn, ttl) => {
  try {
    // Check if Redis is ready
    if (!isRedisReady()) {
      console.log("Redis not available, falling back to database");
      return await fetchFn();
    }

    // Try to get data from cache
    const cachedData = await redisClient.get(key);

    if (cachedData) {
      console.log(`✅ Cache HIT for key: ${key}`);
      return JSON.parse(cachedData);
    }

    // Cache miss - fetch from database
    console.log(`⚠️ Cache MISS for key: ${key}`);
    const data = await fetchFn();

    // Only cache if data exists
    if (data) {
      // Store in cache with TTL
      await redisClient.setEx(key, ttl, JSON.stringify(data));
      console.log(`📦 Cached data for key: ${key} with TTL: ${ttl}s`);
    }

    return data;
  } catch (error) {
    // Handle Redis errors gracefully - fallback to database
    console.error(`❌ Redis error for key ${key}:`, error.message);
    return await fetchFn();
  }
};

/**
 * Invalidate (delete) a specific cache key
 * @param {string} key - Cache key to delete
 */
const invalidateCache = async (key) => {
  try {
    if (!isRedisReady()) {
      console.log("Redis not available, cannot invalidate cache");
      return;
    }

    const deleted = await redisClient.del(key);
    if (deleted) {
      console.log(`🗑️ Cache invalidated for key: ${key}`);
    }
  } catch (error) {
    console.error(`❌ Error invalidating cache for key ${key}:`, error.message);
  }
};

/**
 * Invalidate all cache keys related to a specific user
 * @param {string} userId - User ID
 */
const invalidateUserCache = async (userId) => {
  try {
    if (!isRedisReady()) {
      console.log("Redis not available, cannot invalidate cache");
      return;
    }

    // Delete the specific user cache
    const userKey = cacheKeys.user(userId);
    await invalidateCache(userKey);

    // Note: We don't invalidate paginated lists here because:
    // 1. It's expensive to iterate through all pages
    // 2. The updated user will appear in the next page request
    // 3. The TTL (2 minutes) will automatically refresh the cache

    console.log(`✅ User cache invalidated for userId: ${userId}`);
  } catch (error) {
    console.error(`❌ Error invalidating user cache:`, error.message);
  }
};

/**
 * Clear all cache (use with caution - for testing only)
 */
const clearAllCache = async () => {
  try {
    if (!isRedisReady()) {
      console.log("Redis not available, cannot clear cache");
      return;
    }

    await redisClient.flushAll();
    console.log("🧹 All cache cleared");
  } catch (error) {
    console.error("❌ Error clearing cache:", error.message);
  }
};

module.exports = {
  getOrSetCache,
  invalidateCache,
  invalidateUserCache,
  clearAllCache,
  cacheKeys,
  TTL,
};
