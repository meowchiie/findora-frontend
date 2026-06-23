import { useNavigate, useLocation, useSearchParams } from "react-router-dom"; 
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import logo from "../../assets/logo.png";
import api from "../../utils/axiosConfig";
import "../../styles/dashboard.css"; 

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [searchParams] = useSearchParams();

  // State Profil 
  const [profileImage, setProfileImage] = useState(localStorage.getItem("profileImage") || null);
  const [profileName, setProfileName] = useState(localStorage.getItem("profileName") || "User");
  
  // STATE BARU: Pengecekan Admin
  const [isAdmin, setIsAdmin] = useState(
    (localStorage.getItem("userRole") || "").toLowerCase() === "admin"
  );
  
  // State Pencarian Lokal
  const [searchQuery, setSearchQuery] = useState("");

  const isMainPage = location.pathname === "/" || location.pathname === "/admin";

  // 1. SYNC INPUT SEARCH BAR
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    setSearchQuery(currentSearch);
  }, [searchParams]);

  // 2. FETCH DATA PROFIL DAN CEK ROLE
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (userId) {
          const response = await api.get(`/api/profile/${userId}`);
          const data = response.data;
          
          if (data) {
            setProfileName(data.name || "User");
            localStorage.setItem("profileName", data.name || "User");

            // CEK ROLE ADMIN DI SINI
            if (data.role) {
              const checkAdmin = data.role.toLowerCase() === "admin";
              setIsAdmin(checkAdmin);
              localStorage.setItem("userRole", data.role);
            }

            // Set Image URL
            if (data.profile_picture) {
              // Pastikan menyesuaikan dengan konfigurasi express static kamu
              const fullImageUrl = import.meta.env.VITE_API_URL + `/public${data.profile_picture}`;
              setProfileImage(fullImageUrl); 
              localStorage.setItem("profileImage", fullImageUrl); 
            } else {
              setProfileImage(null);
              localStorage.removeItem("profileImage");
            }
          }
        }
      } catch (error) {
        console.error("Gagal sinkronisasi data profil di Navbar:", error);
      }
    };

    fetchProfileData();
  }, []);

  // 3. HANDLER SEARCH
  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      const newParams = new URLSearchParams();

      if (searchQuery.trim() !== "") {
        newParams.set("search", searchQuery.trim());
      }
      
      newParams.set("page", "1");

      const currentType = searchParams.get("type");
      if (currentType && currentType !== "semua" && location.pathname === "/semua-laporan") {
        newParams.set("type", currentType);
      }

      navigate(`/semua-laporan?${newParams.toString()}`);
    }
  };

  return (
    <div className="dashboard-topbar">
      {/* KIRI: Panah & Logo */}
      <div className="topbar-left" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {!isMainPage && (
          <span 
            className="back-arrow" 
            onClick={() => navigate(-1)} 
            style={{ cursor: "pointer", fontWeight: "bold" }}
          >
            <svg width={"30px"} height={"30px"} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </span>
        )}

        <img 
          src={logo} 
          alt="Findora Logo" 
          className="dashboard-logo" 
          onClick={() => navigate("/")} 
          style={{ cursor: "pointer" }}
        />
      </div>

      {/* TENGAH: Search Bar */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Cari barang..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchSubmit}
        />
        <Search
          size={18}
          className="search-icon"
          style={{ cursor: "pointer" }}
          onClick={handleSearchSubmit}
        />
      </div>

      {/* KANAN: Tombol Admin & Profil */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        
        {/* TOMBOL ADMIN: Hanya muncul jika state isAdmin bernilai true */}
        {isAdmin && (
          <button 
            onClick={() => navigate("/admin")}
            style={{
              backgroundColor: "#28a745", // Warna hijau khas admin, ubah sesuai seleramu
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "all 0.2s ease-in-out"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#218838"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#28a745"}
          >
            🛡️ Admin Dashboard
          </button>
        )}

        {/* PROFIL SECTION */}
        <div className="dashboard-profile" onClick={() => navigate("/profile")}>
          <div className="dashboard-avatar">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="dashboard-avatar-img" />
            ) : (
              <span className="dashboard-avatar-icon">👤</span>
            )}
          </div>
          <span className="dashboard-profile-name">{profileName}</span>
        </div>
      </div>
    </div>
  );
}

export default Navbar;