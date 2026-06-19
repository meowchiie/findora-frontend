import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { CirclePlus, Search } from "lucide-react";
import logo from "../assets/logo.png";
import "../styles/dashboard.css";

function DashboardUser() {
  const navigate = useNavigate();

  // State Profile
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profileImage") || null
  );
  const [profileName, setProfileName] = useState(
    localStorage.getItem("profileName") || "User"
  );

  const [searchQuery, setSearchQuery] = useState("");

  // State Modals & Selections
  const [selectedReport, setSelectedReport] = useState(null);
  const [showFoundModal, setShowFoundModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  // State Laporan & Statistik Hasil Gabungan DB
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ totalLost: 0, totalFound: 0 });

  // State Form Inputs
  const [foundForm, setFoundForm] = useState({
    spesifikasi: "",
    lokasi: "",
    catatan: "",
    image: null,
  });

  const [claimForm, setClaimForm] = useState({
    spesifikasi: "",
    catatan: "",
    image: null,
  });

  const [previewFoundImage, setPreviewFoundImage] = useState(null);
  const [previewClaimImage, setPreviewClaimImage] = useState(null);

  // 1. Ambil Data Profil User dari Backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = localStorage.getItem("userId"); 
        if (!userId) {
          console.warn("User ID tidak ditemukan di localStorage. Silakan login kembali.");
          return;
        }

        const response = await fetch(`http://localhost:5000/api/profile/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          setProfileName(data.nama || "User");
          setProfileImage(data.fotoProfil || null);

          localStorage.setItem("profileName", data.nama || "User");
          if (data.fotoProfil) {
            localStorage.setItem("profileImage", data.fotoProfil);
          } else {
            localStorage.removeItem("profileImage");
          }
        }
      } catch (error) {
        console.error("Gagal mengambil data profil dari database lokal:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // 2. AMBIL DAN GABUNGKAN DATA (LOST ITEMS & FOUND ITEMS) DARI DATABASE
  useEffect(() => {
    const fetchAllReportsFromDB = async () => {
      try {
        // Ambil Data Barang Hilang
        const resLost = await fetch("http://localhost:5000/api/lost-items");
        const rawLost = resLost.ok ? await resLost.json() : [];
        const actualLost = Array.isArray(rawLost) ? rawLost : rawLost.data || rawLost.lostItems || [];

        // Ambil Data Barang Ditemukan
        const resFound = await fetch("http://localhost:5000/api/found-items");
        const rawFound = resFound.ok ? await resFound.json() : [];
        const actualFound = Array.isArray(rawFound) ? rawFound : rawFound.data || rawFound.foundItems || [];

        // Update Counter Statistik Dinamis
        setStats({
          totalLost: actualLost.length,
          totalFound: actualFound.length
        });

        // Format Data Barang Hilang
        const formattedLost = actualLost.map(item => ({
          id: `lost-${item.id}`,
          dbId: item.id,
          name: item.name || "Tanpa Nama",
          description: item.description || "",
          category: item.category || "Lainnya",
          location: item.location || "-",
          // Perbaikan: Antisipasi jika format tanggal sudah berwujud string murni YYYY-MM-DD dari MySQL
          date: item.lost_date ? (item.lost_date.includes("T") ? item.lost_date.split("T")[0] : item.lost_date) : "-", 
          time: item.lost_time || "-",
          contact: item.contact || "-",
          image: item.photo_path ? `http://localhost:5000/${item.photo_path.replace(/\\/g, '/')}` : null,
          status: "Hilang",
          type: "hilang",
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
        }));

        // Format Data Barang Ditemukan
        const formattedFound = actualFound.map(item => ({
          id: `found-${item.id}`,
          dbId: item.id,
          name: item.name || "Tanpa Nama",
          description: item.description || "",
          category: item.category || "Lainnya",
          location: item.location || "-",
          // Perbaikan: Antisipasi jika format tanggal sudah berwujud string murni YYYY-MM-DD dari MySQL
          date: item.found_date ? (item.found_date.includes("T") ? item.found_date.split("T")[0] : item.found_date) : "-", 
          time: item.found_time || "-",
          contact: item.contact || "-",
          image: item.photo_path ? `http://localhost:5000/${item.photo_path.replace(/\\/g, '/')}` : null,
          status: "Ditemukan",
          type: "ditemukan",
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
        }));

        // Satukan dan Urutkan Berdasarkan Waktu Pembuatan (Paling Baru Teratas)
        const combinedReports = [...formattedLost, ...formattedFound]
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Perbaikan: sorting berbasis timestamp milidetik agar akurat

        // Tampilkan semua data gabungan yang berhasil ditarik tanpa dipotong .slice(0, 5) dahulu untuk memastikan data tampil
        setReports(combinedReports);

      } catch (error) {
        console.error("Gagal menghubungkan atau memuat data gabungan dari API:", error);
      }
    };

    fetchAllReportsFromDB();
  }, []);

  // Fungsi Search
  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      if (searchQuery.trim() !== "") {
        navigate("/semua-laporan", { state: { keyword: searchQuery } });
      } else {
        navigate("/semua-laporan");
      }
    }
  };

  // Mock Data Aktivitas Sampingan
  const activities = [
    { title: "Laporan Kunci Hilang", status: "Aktif", time: "2 jam yang lalu" },
    { title: "Laporan Dompet Hilang", status: "Aktif", time: "16 jam yang lalu" },
    { title: "Klaim Kunci Motor", status: "Sedang Diverifikasi", time: "1 hari yang lalu" },
  ];

  // Handlers
  const handleFoundChange = (e) => {
    setFoundForm({ ...foundForm, [e.target.name]: e.target.value });
  };

  const handleClaimChange = (e) => {
    setClaimForm({ ...claimForm, [e.target.name]: e.target.value });
  };

  const handleFoundUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5 MB");
      return;
    }
    setFoundForm({ ...foundForm, image: file });
    setPreviewFoundImage(URL.createObjectURL(file));
  };

  const handleClaimUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5 MB");
      return;
    }
    setClaimForm({ ...claimForm, image: file });
    setPreviewClaimImage(URL.createObjectURL(file));
  };

  const submitFoundForm = async () => {
    if (!foundForm.image) {
      alert("Foto barang wajib diupload");
      return;
    }

    try {
      const userId = localStorage.getItem("userId") || 1; // Ambil ID user yang login
      
      // Karena mengunggah file gambar, kita wajib menggunakan FormData
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("name", "Barang Ditemukan"); // Atau sesuaikan dengan input nama jika ada
      formData.append("description", foundForm.catatan || "Tidak ada catatan");
      formData.append("category", "Lainnya"); // Sesuaikan jika ada input kategori
      formData.append("location", foundForm.lokasi || "-");
      formData.append("image", foundForm.image); // Field 'image' harus cocok dengan nama di upload.single() Multer backend

      const response = await fetch("http://localhost:5000/api/found-items", {
        method: "POST",
        body: formData, // Jangan gunakan headers Content-Type JSON jika mengirim FormData
      });

      if (response.ok) {
        alert("Laporan penemuan berhasil dikirim ke database!");
        setShowFoundModal(false);
        
        // Reset form setelah sukses
        setFoundForm({ spesifikasi: "", lokasi: "", catatan: "", image: null });
        setPreviewFoundImage(null);

        // Jalankan ulang fungsi fetch agar data terbaru langsung muncul tanpa refresh browser
        window.location.reload(); 
      } else {
        const errData = await response.json();
        alert(`Gagal mengirim laporan: ${errData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error saat mengirim laporan penemuan:", error);
      alert("Terjadi kesalahan koneksi saat mengirim laporan.");
    }
  };

  const submitClaimForm = () => {
    alert("Klaim berhasil dikirim");
    setShowClaimModal(false);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* TOPBAR */}
        <div className="dashboard-topbar">
          <img src={logo} alt="Findora Logo" className="dashboard-logo" />

          {/* INPUT SEARCH */}
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search" 
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

        {/* MAIN SECTION */}
        <div className="dashboard-main">
          
          {/* WELCOME BANNER */}
          <section className="welcome-section">
            <h1>Selamat Datang, {profileName}!</h1>
            <p>Temukan barang anda atau bantu sesama hari ini.</p>

            <div className="dashboard-actions">
              <button className="lost-btn" onClick={() => navigate("/lapor-hilang")}>
                <CirclePlus size={20} /> Laporan Barang Hilang
              </button>
              <button className="found-btn-dashboard" onClick={() => navigate("/lapor-ditemukan")}>
                <CirclePlus size={20} /> Laporan Barang Ditemukan
              </button>
            </div>
          </section>

          {/* GRID CONTENT */}
          <div className="dashboard-grid">
            
            {/* LEFT COLUMN */}
            <div className="dashboard-left">
              
              {/* STATISTIK DINAMIS */}
              <section className="stats-card">
                <h2>Statistik Minggu Ini</h2>
                <div className="stats-row">
                  <div className="stat-item">
                    <h3>{stats.totalLost}</h3>
                    <p>Total Laporan Hilang</p>
                  </div>
                  <div className="divider"></div>
                  <div className="stat-item">
                    <h3>{stats.totalFound}</h3>
                    <p>Total Barang Ditemukan</p>
                  </div>
                  <div className="divider"></div>
                  <div className="stat-item">
                    <h3>2</h3>
                    <p>Klaim Berhasil</p>
                  </div>
                </div>
              </section>

              {/* LAPORAN TERBARU */}
              <section className="latest-card">
                <div className="latest-header">
                  <h2>Laporan Terbaru</h2>
                  <button onClick={() => navigate("/semua-laporan")}>Lihat Semua</button>
                </div>

                <div className="report-list">
                  {reports.length > 0 ? (
                    reports.map((item) => (
                      <div className="dashboard-report-card" key={item.id} onClick={() => setSelectedReport(item)}>
                        <div className="report-image">
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
                        <h3>{item.name}</h3>
                        <p><strong>Kategori:</strong> {item.category || "Lainnya"}</p>
                        <p><strong>Lokasi:</strong> {item.location}</p>
                        <p><strong>Tanggal:</strong> {item.date}</p>
                        
                        {/* DINAMIS: Label kelas CSS disesuaikan tipe barang */}
                        <span className={`report-status ${item.type === 'hilang' ? 'status-blue' : 'status-green'}`}>
                          {item.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p style={{ textAlign: "center", color: "#888", padding: "20px 0", gridColumn: "1/-1" }}>
                      Belum ada laporan di database.
                    </p>
                  )}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN (ACTIVITY SIDEBAR) */}
            <aside className="activity-panel">
              <h2>Aktivitas</h2>
              {activities.map((item, index) => (
                <div className="activity-row" key={index}>
                  <div className="activity-avatar">👤</div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.status}</p>
                    <small>{item.time}</small>
                  </div>
                </div>
              ))}
            </aside>

          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedReport && (
        <div className="detail-modal-bg">
          <div className="action-modal">
            <button className="close-detail" onClick={() => setSelectedReport(null)}>✕</button>
            <div className="detail-image">
              {selectedReport.image ? (
                <img 
                  src={selectedReport.image} 
                  alt={selectedReport.name} 
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px", cursor: "zoom-in" }} 
                  onClick={() => setZoomedImage(selectedReport.image)}
                />
              ) : (
                <span style={{ fontSize: "48px" }}>📦</span>
              )}
            </div>
            <h2>{selectedReport.name}</h2>
            <div className={`detail-status ${selectedReport.type === 'hilang' ? 'status-blue' : 'status-green'}`}>
              {selectedReport.status}
            </div>

            <div className="detail-info">
              <p><strong>Kategori:</strong> {selectedReport.category || "Lainnya"}</p>
              <p><strong>Deskripsi:</strong> {selectedReport.description}</p>
              <p><strong>Lokasi:</strong> {selectedReport.location}</p>
              <p><strong>Tanggal:</strong> {selectedReport.date}</p>
              <p><strong>Waktu:</strong> {selectedReport.time}</p>
              <p><strong>Kontak:</strong> {selectedReport.contact}</p>
            </div>

            {/* AKSI TOMBOL DINAMIS BERDASARKAN STATUS BARANG */}
            {selectedReport.type === "hilang" ? (
              <button className="detail-action-btn" onClick={() => { setShowFoundModal(true); setSelectedReport(null); }}>
                Saya Menemukan Barang Ini
              </button>
            ) : (
              <button className="detail-action-btn" style={{ backgroundColor: "#28a745" }} onClick={() => { setShowClaimModal(true); setSelectedReport(null); }}>
                Ini Barang Saya (Klaim)
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL SAYA MENEMUKAN BARANG */}
      {showFoundModal && (
        <div className="detail-modal-bg">
          <div className="claim-popup">
            <button className="popup-close" onClick={() => setShowFoundModal(false)}>✕</button>
            <h2 className="popup-title">Saya Menemukan Barang Ini</h2>
            <div className="popup-form">
              <div className="popup-group">
                <label>Upload Foto Barang (Wajib)</label>
                <input type="file" accept="image/*" onChange={handleFoundUpload} />
                {previewFoundImage && <img src={previewFoundImage} alt="Preview" className="claim-preview" />}
              </div>
              <div className="popup-group">
                <label>Informasi / Bukti Penemuan</label>
                <textarea name="catatan" placeholder="Contoh: saya menemukan barang ini di parkiran kampus 1" value={foundForm.catatan} onChange={handleFoundChange} />
              </div>
              <button className="popup-submit-btn" onClick={submitFoundForm}>Kirim Bukti</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KLAIM BARANG */}
      {showClaimModal && (
        <div className="detail-modal-bg">
          <div className="claim-popup">
            <button className="popup-close" onClick={() => setShowClaimModal(false)}>✕</button>
            <h2 className="popup-title">Klaim Barang</h2>
            <div className="popup-form">
              <div className="popup-group">
                <label>Upload Foto (Opsional)</label>
                <input type="file" accept="image/*" onChange={handleClaimUpload} />
                {previewClaimImage && <img src={previewClaimImage} alt="Preview" className="claim-preview" />}
              </div>
              <div className="popup-group">
                <label>Bukti Kepemilikan</label>
                <textarea name="catatan" placeholder="Contoh: terdapat stiker anime di belakang barang" value={claimForm.catatan} onChange={handleClaimChange} />
              </div>
              <button className="popup-submit-btn" onClick={submitClaimForm}>Kirim Klaim</button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP LIGHTBOX IMAGE */}
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

    </div>
  );
}

export default DashboardUser;