import { Outlet } from "react-router-dom";
import Navbar from "./navbar";

export default function AppLayout() {
    return (
    <div className="app-container" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" , paddingTop: "80px", backgroundColor: "#ffe8bf"}}>
      {/* Navbar akan selalu stand by di paling atas untuk semua halaman */}
      <Navbar />

      {/* Konten halaman yang dinamis akan otomatis disuntikkan di dalam <Outlet /> ini */}
      <div className="page-content" style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}