import "../styles/semuaLaporan.css";
import logo from "../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react"; 

function SemuaLaporan() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profileImage, setProfileImage] = useState(localStorage.getItem("profileImage") || null);
  const [profileName, setProfileName] = useState(localStorage.getItem("profileName") || "User");

  // State pencarian
  const [searchQuery, setSearchQuery] = useState(location.state?.keyword || "");
  const [appliedSearch, setAppliedSearch] = useState(location.state?.keyword || "");

  // State Laporan Nyata dari Database Backend
  const [reports, setReports] = useState([]);

  const [filter, setFilter] = useState("Semua");
  const [selectedItem, setSelectedItem] = useState(null);

  /* MODAL STATE */
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [proofText, setProofText] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null); // State Zoomed Image aktif

  // ==========================================================
  // AMBIL SEMUA DATA LAPORAN DARI DATABASE BACKEND
  // ==========================================================
  useEffect(() => {
    const fetchAllReportsFromDB = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/lost-items");
        
        if (response.ok) {
          const rawData = await response.json();
          
          let actualData = [];
          if (Array.isArray(rawData)) {
            actualData = rawData;
          } else if (rawData && Array.isArray(rawData.data)) {
            actualData = rawData.data;
          } else if (rawData && Array.isArray(rawData.lostItems)) {
            actualData = rawData.lostItems;
          } else {
            console.error("Format data dari backend bukan Array:", rawData);
            return;
          }

          // Memetakan struktur database agar seragam digunakan oleh React
          const formattedReports = actualData.map(item => ({
            id: item.id,
            name: item.name || "Tanpa Nama",
            description: item.description || "",
            category: item.category || "Lainnya",
            location: item.location || "-",
            date: item.lost_date ? item.lost_date.split("T")[0] : "-", 
            time: item.lost_time || "-",
            contact: item.contact || "-",
            // Mengarah ke URL statis backend
            image: item.photo_path ? `http://localhost:5000/${item.photo_path.replace(/\\/g, '/')}` : null,
            status: "Hilang", // Default status, bisa disesuaikan dengan field DB jika ada
            type: "hilang"
          }));

          // Menampilkan SEMUA laporan dari urutan terbaru (tanpa .slice(0, 5))
          setReports(formattedReports.reverse());
        } else {
          console.error("Gagal mengambil data laporan dari database, status:", response.status);
        }
      } catch (error) {
        console.error("Gagal menghubungkan ke backend api/lostitems:", error);
      }
    };

    fetchAllReportsFromDB();
  }, []);

  // ==========================================================
  // LOGIK SUBMIT SEARCH DI HALAMAN SEMUA LAPORAN
  // ==========================================================
  const handleSearchSubmit = (e) => {
    if (e.type === "click" || e.key === "Enter") {
      setAppliedSearch(searchQuery); 
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setAppliedSearch("");
    window.history.replaceState({}, document.title);
  };

  useEffect(() => {
    if (location.state?.keyword) {
      setSearchQuery(location.state.keyword);
      setAppliedSearch(location.state.keyword);
    }
  }, [location.state]);

  // Penyaringan data menggunakan data dinamis dari database (reports)
  const filteredReports = reports.filter((item) => {
    const matchesFilter = filter === "Semua" ? true : item.status === filter;
    const matchesSearch = 
      item.name.toLowerCase().includes(appliedSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(appliedSearch.toLowerCase()) ||
      item.location.toLowerCase().includes(appliedSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  /* HANDLERS MODAL & UPLOAD */
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file || file.size > 5 * 1024 * 1024) return alert("Ukuran gambar maksimal 5 MB");
    setPreviewImage(URL.createObjectURL(file));
  };

  const openActionModal = (type) => {
    setActionType(type);
    setShowActionModal(true);
  };

  const handleSubmitAction = () => {
    if (!previewImage) return alert("Foto bukti wajib diupload");
    alert(actionType === "menemukan" ? "Laporan penemuan berhasil dikirim" : "Pengajuan klaim berhasil dikirim");
    setShowActionModal(false);
    setProofText("");
    setPreviewImage(null);
  };

  return (
    <div className="semua-page">
      
      {/* TOPBAR */}
      <div className="dashboard-topbar">
        <button className="report-back" type="button" onClick={() => navigate("/dashboard")}>
          ← <img src={logo} alt="Findora Logo" className="dashboard-logo" />
        </button>

        {/* BOX SEARCH DENGAN TOMBOL REFRESH/CLEAR */}
        <div className="search-box" style={{ display: "flex", alignItems: "center", position: "relative" }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} 
            onKeyDown={handleSearchSubmit} 
            style={{ paddingRight: searchQuery ? "60px" : "35px" }}
          />
          
          {searchQuery && (
            <X 
              size={16} 
              className="clear-icon"
              style={{ 
                position: "absolute", 
                right: "35px", 
                cursor: "pointer", 
                color: "#888" 
              }}
              onClick={handleClearSearch}
            />
          )}

          <Search 
            size={18} 
            className="search-icon" 
            style={{ cursor: "pointer" }}
            onClick={handleSearchSubmit} 
          />
        </div>

        {/* PROFILE */}
        <div className="dashboard-profile" onClick={() => navigate("/profile")}>
          <div className="dashboard-avatar">
            {profileImage ? <img src={profileImage} alt="Profile" className="dashboard-avatar-img" /> : <span className="dashboard-avatar-icon">👤</span>}
          </div>
          <span className="dashboard-profile-name">{profileName}</span>
        </div>
      </div>

      <main>
        <div className="semua-topbar">
          <h1>Semua Laporan</h1>
        </div>

        {/* FILTER STATUS */}
        <div className="semua-filter">
          <button className={filter === "Semua" ? "active-filter" : ""} onClick={() => setFilter("Semua")}>Semua Status</button>
          <button className={filter === "Hilang" ? "active-filter" : ""} onClick={() => setFilter("Hilang")}>Hilang</button>
          <button className={filter === "Ditemukan" ? "active-filter" : ""} onClick={() => setFilter("Ditemukan")}>Ditemukan</button>
        </div>

        {/* CONTAINER KARTU DATA */}
        <div className="semua-grid">
          {filteredReports.length > 0 ? (
            filteredReports.map((item) => (
              <div className="semua-card" key={item.id} onClick={() => setSelectedItem(item)}>
                <div className="semua-image">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} 
                    />
                  ) : (
                    <span style={{ fontSize: "28px" }}>📦</span>
                  )}
                </div>
                <h2>{item.name}</h2>
                <p><strong>Kategori:</strong> {item.category}</p>
                <p><strong>Lokasi:</strong> {item.location}</p>
                <p><strong>Tanggal:</strong> {item.date}</p>
                <span className={item.status === "Hilang" ? "semua-status hilang" : "semua-status ditemukan"}>
                  {item.status}
                </span>
              </div>
            ))
          ) : (
            <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#545454", padding: "24px" }}>
              Barang tidak ditemukan.
            </p>
          )}
        </div>

        {/* DETAIL POPUP */}
        {selectedItem && (
          <div className="detail-modal-bg">
            <div className="claim-popup">
              <button className="popup-close" onClick={() => setSelectedItem(null)}>✕</button>
              
              {/* Tambahkan cursor zoom-in & setZoomedImage pada preview gambar modal */}
              <div className="detail-image">
                {selectedItem.image ? (
                  <img 
                    src={selectedItem.image} 
                    alt={selectedItem.name} 
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px", cursor: "zoom-in" }} 
                    onClick={() => setZoomedImage(selectedItem.image)}
                  />
                ) : (
                  <span style={{ fontSize: "48px" }}>📦</span>
                )}
              </div>

              <h2 className="popup-title">{selectedItem.name}</h2>
              <div className="popup-status-wrapper">
                <div className={`semua-status ${selectedItem.status === "Hilang" ? "hilang" : "ditemukan"}`}>{selectedItem.status}</div>
              </div>
              <div className="detail-info compact-info">
                <p><strong>Status:</strong> {selectedItem.status}</p>
                <p><strong>Kategori:</strong> {selectedItem.category}</p>
                <p><strong>Lokasi:</strong> {selectedItem.location}</p>
                <p><strong>Tanggal:</strong> {selectedItem.date}</p>
                <p><strong>Waktu:</strong> {selectedItem.time}</p>
                <p><strong>Deskripsi:</strong> {selectedItem.description}</p>
                <p><strong>Kontak:</strong> {selectedItem.contact}</p>
              </div>
              {selectedItem.status === "Hilang" ? (
                <button className="popup-submit-btn" onClick={() => { openActionModal("menemukan"); setSelectedItem(null); }}>Saya Menemukan Barang Ini</button>
              ) : (
                <button className="popup-submit-btn" onClick={() => { openActionModal("klaim"); setSelectedItem(null); }}>Klaim Barang</button>
              )}
            </div>
          </div>
        )}

        {/* ACTION MODAL */}
        {showActionModal && (
          <div className="detail-modal-bg">
            <div className="claim-popup">
              <button className="popup-close" onClick={() => setShowActionModal(false)}>✕</button>
              <h2 className="popup-title">{actionType === "menemukan" ? "Upload Bukti Penemuan" : "Klaim Barang"}</h2>
              <div className="popup-form">
                <div className="popup-group">
                  <label>Upload Foto Bukti (Wajib)</label>
                  <input type="file" accept="image/*" onChange={handleUpload} />
                  {previewImage && <img src={previewImage} alt="Preview" className="claim-preview" />}
                </div>
                <div className="popup-group">
                  <label>Bukti Kepemilikan</label>
                  <textarea
                    placeholder={actionType === "menemukan" ? "Tambahkan informasi barang yang ditemukan..." : "Tuliskan bukti kepemilikan barang..."}
                    value={proofText}
                    onChange={(e) => setProofText(e.target.value)}
                  />
                </div>
                <button className="popup-submit-btn" onClick={handleSubmitAction}>Kirim</button>
              </div>
            </div>
          </div>
        )}

        {/* POP-UP FULLSCREEN / LIGHTBOX IMAGE */}
        {zoomedImage && (
          <div 
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
              cursor: "zoom-out"
            }}
            onClick={() => setZoomedImage(null)}
          >
            <button 
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                color: "white",
                fontSize: "30px",
                cursor: "pointer"
              }}
              onClick={() => setZoomedImage(null)}
            >
              ✕
            </button>
            <img 
              src={zoomedImage} 
              alt="Fullscreen Preview" 
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
              }} 
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default SemuaLaporan;