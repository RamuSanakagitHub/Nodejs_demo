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

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    token,
    role: user.role,
  };
};
