const userModel = require("../user/usermodel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mailer = require("../../utils/mailer");

const otpStore = {}; // { email: { code, expires } }

const register = async (data) => {
  const existingUser = await userModel.getUserByEmail(data.email);
  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  data.password = hashedPassword;

  const result = await userModel.createUser(data);
  
  // Send Welcome Email asynchronously
  mailer.sendWelcomeEmail(data.email, data.name).catch((err) => {
    console.error("Error sending welcome email in background:", err);
  });

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
    { id: user.id, email: user.email, role: user.role, warehouse_id: user.warehouse_id },
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
      warehouse_id: user.warehouse_id,
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
  
  // Generate random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP code in-memory with 10 minutes expiry
  otpStore[email.toLowerCase()] = {
    code,
    expires: Date.now() + 10 * 60 * 1000
  };

  // Send Password Reset Email asynchronously
  mailer.sendPasswordResetEmail(email, code).catch((err) => {
    console.error("Error sending password reset email in background:", err);
  });

  return { email };
};

const resetPassword = async (email, code, newPassword) => {
  const user = await userModel.getUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }
  
  const stored = otpStore[email.toLowerCase()];
  if (!stored || stored.code !== code) {
    throw new Error("Invalid reset verification code");
  }
  if (stored.expires < Date.now()) {
    delete otpStore[email.toLowerCase()];
    throw new Error("Reset verification code has expired");
  }

  // Delete the OTP after successful validation
  delete otpStore[email.toLowerCase()];

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