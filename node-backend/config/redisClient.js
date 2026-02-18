const redis = require("redis");

// Redis configuration from environment variables
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

// Create Redis client
const redisClient = redis.createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
  password: REDIS_PASSWORD ? REDIS_PASSWORD : undefined,
});

// Error handling for Redis connection
redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err.message);
});

// Flag to track connection status
let isRedisConnected = false;

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    isRedisConnected = true;
    console.log("✅ Redis connected successfully");
  } catch (err) {
    console.error("❌ Redis connection failed:", err.message);
    isRedisConnected = false;
  }
};

// Check if Redis is connected
const isRedisReady = () => {
  return isRedisConnected && redisClient.isOpen;
};

// Export the Redis client and helper functions
module.exports = {
  redisClient,
  connectRedis,
  isRedisReady,
};
