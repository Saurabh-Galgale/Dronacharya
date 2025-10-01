// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getToken, getUserFromToken } from "../services/authService";

export default function PrivateRoute({ children, requiredRole }) {
  const token = getToken();
  if (!token) return <Navigate to="/" replace />;

  if (requiredRole) {
    const user = getUserFromToken();
    if (!user || user.role !== requiredRole) return <Navigate to="/" replace />;
  }

  return children;
}
