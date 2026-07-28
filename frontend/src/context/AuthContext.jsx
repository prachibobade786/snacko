import React, { createContext, useContext, useState } from "react";
import * as api from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children, showToast, setMode, fetchAdminWarehouses }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const loginDirectly = async (inputEmail, inputPassword) => {
    setLoginError("");
    try {
      const data = await api.login(inputEmail, inputPassword);
      if (data.success) {
        const authToken = data.data.token;
        setToken(authToken);
        localStorage.setItem("token", authToken);
        
        const profData = await api.fetchUserProfile(authToken);
        if (profData.success) {
          const loggedUser = profData.data;
          setUser(loggedUser);
          localStorage.setItem("user", JSON.stringify(loggedUser));
          setIsLoginOpen(false);
          showToast(`Welcome back, ${loggedUser.name}!`);
          if (loggedUser.role === "admin") {
            setMode("admin");
            if (fetchAdminWarehouses) {
              fetchAdminWarehouses(authToken);
            }
          }
          return loggedUser;
        }
      } else {
        setLoginError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setLoginError("Connection failed");
    }
    return null;
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    return loginDirectly(email, password);
  };

  const handleLogout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMode("customer");
    showToast("Logged out successfully");
  };

  const autoLoginAs = async (role) => {
    const defaultEmail = role === "admin" ? "admin@snacko.com" : "john@gmail.com";
    const defaultPassword = role === "admin" ? "admin123" : "user123";
    setEmail(defaultEmail);
    setPassword(defaultPassword);
    return loginDirectly(defaultEmail, defaultPassword);
  };

  return (
    <AuthContext.Provider value={{
      user, setUser,
      token, setToken,
      isLoginOpen, setIsLoginOpen,
      email, setEmail,
      password, setPassword,
      loginError, setLoginError,
      handleLogin,
      handleLogout,
      autoLoginAs,
      loginDirectly
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
