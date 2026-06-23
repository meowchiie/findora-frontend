import { Navigate, Outlet } from "react-router-dom";

function RequireGuest() {
  const token = localStorage.getItem("token"); // Pastikan key-nya sesuai dengan yang kamu gunakan

  if (token) {
    // Jika sudah login, langsung lempar ke halaman utama (Dashboard)
    return <Navigate to="/" replace />;
  }

  // Jika belum login (Guest), izinkan render komponen anak
  return <Outlet />;
}

export default RequireGuest;