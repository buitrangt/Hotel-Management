import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const RequireAuth = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const location = useLocation();
  
  // Kiểm tra cả user trong context và userId trong localStorage
  if (!user && !userId) {
    // Chuyển hướng về trang đăng nhập, lưu lại đường dẫn hiện tại
    return <Navigate to={"/login"} state={{ path: location.pathname }} />;
  }
  
  return children;
};

export default RequireAuth;
