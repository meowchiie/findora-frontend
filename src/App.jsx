import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardUser from "./pages/DashboardUser";
import ProfilePage from "./pages/ProfilePage";
import BarangHilang from "./pages/BarangHilang";
import BarangDitemukan from "./pages/BarangDitemukan";
import SemuaLaporan from "./pages/SemuaLaporan";
import AdminDashboard from "./pages/admin/AdminDashboard"
import ArchiveData from "./pages/admin/ArchiveData"
import ManageUsers from "./pages/admin/ManageUsers"
import AppLayout from "./components/layout/app-layout";
import RequireAuth from "./middlewares/RequireAuth";
import RequireAdmin from "./middlewares/RequireAdmin";
import RequireGuest from "./middlewares/RequireGuest";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Publik (Siapa saja bisa akses) */}
        <Route element={<RequireGuest />}>
          <Route path="/home" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Rute yang Membutuhkan Login (User & Admin) */}
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardUser />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/lapor-hilang" element={<BarangHilang />} />
            <Route path="/lapor-ditemukan" element={<BarangDitemukan />} />
            <Route path="/semua-laporan" element={<SemuaLaporan />} />
          </Route>
        </Route>

        {/* Rute Khusus Admin */}
        <Route element={<RequireAdmin />}>
          <Route element={<AppLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/archive" element={<ArchiveData />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;