const userModel = require("../user/usermodel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (data) => {
  const existingUser = await userModel.getUserByEmail(data.email);
  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  data.password = hashedPassword;

  const result = await userModel.createUser(data);
  return result;
};

const login = async (email, password) => {
  const user = await userModel.getUserByEmail(email);
  if (!user) {
    throw new Error("Invalid Email");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid Password");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const getProfile = async (id) => {
  const user = await userModel.getUserById(id);
  if (!user) throw new Error("User not found");
  return user;
};

const updateProfile = async (id, data) => {
  const user = await userModel.getUserById(id);
  if (!user) throw new Error("User not found");
  
  if (data.email && data.email !== user.email) {
    const duplicate = await userModel.getUserByEmail(data.email);
    if (duplicate) throw new Error("Email already registered by another account");
  }

  return await userModel.updateUser(id, {
    name: data.name || user.name,
    email: data.email || user.email,
    mobile: data.mobile || user.mobile,
  });
};

const forgotPassword = async (email) => {
  const user = await userModel.getUserByEmail(email);
  if (!user) {
    throw new Error("No user registered with this email address");
  }
  // Simulated OTP system (returns 123456 for demo purposes)
  return { email, code: "123456" };
};

const resetPassword = async (email, code, newPassword) => {
  const user = await userModel.getUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }
  
  if (code !== "123456") {
    throw new Error("Invalid reset verification code");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userModel.updateUserPassword(email, hashedPassword);
  return { success: true };
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
};