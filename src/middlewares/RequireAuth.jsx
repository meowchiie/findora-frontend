import { Navigate, Outlet } from "react-router-dom";

function RequireAuth() {
  const token = localStorage.getItem("token"); // Sesuaikan dengan tempat kamu menyimpan token

  if (!token) {
    // Jika belum login, arahkan ke halaman login
    return <Navigate to="/login" replace />;
  }

  // Jika sudah login, izinkan render komponen anak (rute di dalamnya)
  return <Outlet />;
}

export default RequireAuth;