import { Navigate, Outlet } from "react-router-dom";

function RequireAdmin() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole"); // Sesuaikan dengan key role kamu

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role?.toLowerCase() !== "admin") {
    // Jika bukan admin, tendang ke halaman dashboard biasa
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RequireAdmin;