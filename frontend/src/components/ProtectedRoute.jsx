import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectUserRole,
} from "../Redux/slices/userSlice";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Redirect based on role
    if (userRole === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/user/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
