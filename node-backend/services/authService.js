const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authRepository = require("../repositories/authRepository");

exports.registerUser = async (data) => {
  const { name, email, password, age, role } = data;

  const existingUser = await authRepository.findByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await authRepository.createUser({
    name,
    email,
    password: hashedPassword,
    age,
    role,
  });

  return { message: "User registered successfully" };
};

// exports.loginUser = async (data) => {
//     const { email, password } = data;

//   const user = await authRepository.findByEmail(email);
//   if (!user) {
//     throw new Error("Invalid credentials");
//   }

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) {
//     throw new Error("Invalid credentials");
//   }

//   const token = jwt.sign(
//     { id: user._id, role: user.role },
//     process.env.JWT_SECRET,
//     { expiresIn: "1d" }
//   );

//   return {
//     token,
//     role: user.role,
//   };
// };

exports.loginUser = async (data) => {
  const { email, password } = data;

  const user = await authRepository.findByEmail(email);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // Generate tokens
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );

  // Store refresh token
  await authRepository.storeRefreshToken(user._id, refreshToken);

  return {
    accessToken,
    refreshToken,
    role: user.role,
    userId: user._id,
  };
};

// New: Refresh tokens
exports.refreshTokens = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Validate and remove old refresh token
    const isValid = await authRepository.validateAndRemoveRefreshToken(userId, refreshToken);
    if (!isValid) throw new Error("Invalid refresh token");

    // Fetch user and generate new tokens
    const user = await authRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
    );
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
    );

    // Store new refresh token
    await authRepository.storeRefreshToken(userId, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new Error("Refresh failed");
  }
};

// New: Logout (invalidate tokens)
exports.logoutUser = async (userId) => {
  await authRepository.invalidateUserTokens(userId);
  return { message: "Logged out successfully" };
};
