import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardUser from "./pages/DashboardUser";
import ProfilePage from "./pages/ProfilePage";
import BarangHilang from "./pages/BarangHilang";
import BarangDitemukan from "./pages/BarangDitemukan";
import SemuaLaporan from "./pages/SemuaLaporan";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardUser />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/lapor-hilang" element={<BarangHilang />} />
        <Route path="/lapor-ditemukan" element={<BarangDitemukan />} />
        <Route path="/semua-laporan" element={<SemuaLaporan />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;