import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPassword";
import RegisterPage from "./pages/RegisterPage";
import DashboardUser from "./pages/DashboardUser";
import ProfilePage from "./pages/ProfilePage";
import BarangHilang from "./pages/BarangHilang";
import BarangDitemukan from "./pages/BarangDitemukan";
import SemuaLaporan from "./pages/SemuaLaporan";
import ProtectedRoute from "./middlewares/ProtectedRoute"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminProfile from "./pages/admin/AdminProfile"
import ArchiveData from "./pages/admin/ArchiveData"
import ManageUsers from "./pages/admin/ManageUsers"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardUser />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/lapor-hilang" element={<BarangHilang />} />
        <Route path="/lapor-ditemukan" element={<BarangDitemukan />} />
        <Route path="/semua-laporan" element={<SemuaLaporan />} />

        <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Rute baru untuk halaman profil */}
          <Route path="/admin/profile" element={
            <ProtectedRoute>
              <AdminProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users" element={
            <ProtectedRoute>
              <ManageUsers />
            </ProtectedRoute>
          } />

          <Route path="/admin/archive" element={
            <ProtectedRoute>
              <ArchiveData />
            </ProtectedRoute>
          } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;