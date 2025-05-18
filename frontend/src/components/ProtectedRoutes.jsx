import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({
  allowedRoles = [], // e.g. ["client"] or ["worker"]
  publicOnly = false, // for login/register pages
}) {
  const token = localStorage.getItem("token");
  let role = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded.role; // or whatever key you used when creating the token
    } catch (e) {
      // Invalid token, treat as not logged in
      role = null;
    }
  }

  // 1) Public-only page (login/register):
  if (publicOnly && token) {
    return <Navigate to="/" replace />;
  }

  // 2) Protected page:
  if (allowedRoles.length > 0) {
    if (!token) {
      // not logged in
      return <Navigate to="/login" replace />;
    }
    if (!allowedRoles.includes(role)) {
      // wrong role
      return <Navigate to="/" replace />;
    }
  }

  // 3) Everything’s OK:
  return <Outlet />;
}
