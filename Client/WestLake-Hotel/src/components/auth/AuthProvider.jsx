/* eslint-disable no-unused-vars */
import jwt_decode from "jwt-decode";
import React, { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext({
  user: null,
  handleLogin: (token) => {},
  handleLogout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Khôi phục trạng thái người dùng từ localStorage khi component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwt_decode(token);
        // Kiểm tra token có hết hạn không
        const currentTime = Date.now() / 1000;
        if (decodedUser.exp && decodedUser.exp > currentTime) {
          setUser(decodedUser);
        } else {
          // Token đã hết hạn, xóa khỏi localStorage
          handleLogout();
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        handleLogout();
      }
    }
  }, []);
  const handleLogin = (token) => {
    const decodedUser = jwt_decode(token);
    console.log(decodedUser);
    localStorage.setItem("userId", decodedUser.sub);
    
    // Kiểm tra nếu roles là một mảng và chứa ROLE_ADMIN thì lưu ROLE_ADMIN
    if (Array.isArray(decodedUser.roles) && decodedUser.roles.includes("ROLE_ADMIN")) {
        localStorage.setItem("userRole", "ROLE_ADMIN");
    } else if (Array.isArray(decodedUser.roles)) {
        localStorage.setItem("userRole", decodedUser.roles[0]); // Lưu vai trò đầu tiên
    } else {
        localStorage.setItem("userRole", decodedUser.roles); // Lưu nguyên như cũ nếu không phải mảng
    }
    
    localStorage.setItem("token", token);
    setUser(decodedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
