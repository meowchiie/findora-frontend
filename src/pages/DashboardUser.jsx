import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { CirclePlus } from "lucide-react"; // Hanya import yang dibutuhkan di sini
import api from "../utils/axiosConfig";
import "../styles/dashboard.css";
import ActivityWidget from "../components/widgets/ActivityWidget";

function DashboardUser() {
  const navigate = useNavigate();

  // State yang disederhanakan (Urusan pencarian & foto profil dipindah ke Navbar)
  const [profileName, setProfileName] = useState(
    localStorage.getItem("profileName") || "User"
  );
  const [selectedReport, setSelectedReport] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalLost: 0,
    totalFound: 0,
    successfulClaims: 0
  });

  const [claimForm, setClaimForm] = useState({ catatan: "", image: null });
  const [previewClaimImage, setPreviewClaimImage] = useState(null);

  // --- UNIFIED USEEFFECT ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      
      // 1. Ambil Data Nama Profil (Hanya untuk Welcome Message)
      try {
        const userId = localStorage.getItem("userId"); 
        if (userId) {
          const response = await api.get(`/api/profile/${userId}`);
          if (response.data?.nama) {
            setProfileName(response.data.nama);
            localStorage.setItem("profileName", response.data.nama);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil data profil:", error);
      }

      // 2. Ambil Data Statistik Global
      try {
        const response = await api.get('/api/dashboard/charts/user');
        const statsData = response.data?.data;
        if (statsData) {
          setStats({
            totalLost: statsData.totalLost ?? 0,
            totalFound: statsData.totalFound ?? 0,
            successfulClaims: statsData.successfulClaims ?? 0
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data statistik:", error);
      }

      // 3. Ambil Laporan Terbaru
      try {
        const res = await api.get("/api/items", { params: { limit: 6, status: "Menunggu" } });
        const rawItems = res.data?.data || res.data || [];
        
        const formattedReports = rawItems.map((item) => {
          const isHilang = item.type === "hilang";
          return {
            id: `${item.type}-${item.id}`,
            dbId: item.id,
            name: item.name || "Tanpa Nama",
            description: item.description || "",
            category: item.Category?.name || item.category || "Lainnya",
            location: item.location || "-",
            date: item.lost_date ? item.lost_date.split("T")[0] : "-", 
            time: item.lost_time || "-",
            contact: item.contact || "-",
            image: item.photo_path ? import.meta.env.VITE_API_URL + `/public/${item.photo_path.replace(/\\/g, '/')}` : null,
            status: isHilang ? "Hilang" : "Ditemukan",
            type: isHilang ? "hilang" : "ditemukan",
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
          };
        });

        const sortedReports = formattedReports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setReports(sortedReports);
      } catch (error) {
        console.error("Gagal memuat data laporan:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // Mock Data Aktivitas Sampingan
  const activities = [
    { title: "Laporan Kunci Hilang", status: "Aktif", time: "2 jam yang lalu" },
    { title: "Laporan Dompet Hilang", status: "Aktif", time: "16 jam yang lalu" },
    { title: "Klaim Kunci Motor", status: "Sedang Diverifikasi", time: "1 hari yang lalu" },
  ];

  // Handlers Form Klaim
  const handleClaimChange = (e) => {
    setClaimForm({ ...claimForm, [e.target.name]: e.target.value });
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

  const submitClaimForm = async () => {
    if (!selectedReport || !selectedReport.dbId) {
      alert("Terjadi kesalahan: ID Item tidak ditemukan.");
      return;
    }
    if (!claimForm.catatan || claimForm.catatan.trim() === "") {
      alert("Bukti/Informasi wajib diisi secara detail!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("item_id", parseInt(selectedReport.dbId)); 
      formData.append("proof_of_ownership", claimForm.catatan); 

      if (claimForm.image) {
        formData.append("proof_photo_path", claimForm.image);
      }

      const response = await api.post("/api/claims", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success || response.status === 200 || response.status === 201) {
        alert("Klaim berhasil dikirim dan sedang diverifikasi!");
        setShowClaimModal(false);
        setClaimForm({ catatan: "", image: null });
        setPreviewClaimImage(null);
        setSelectedReport(null);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error saat mengirim klaim:", error);
      alert("Terjadi kesalahan koneksi saat mengirim klaim.");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* KODE TOPBAR LAMA TELAH DIHAPUS SEPENUHNYA KARENA DIATUR OLEH MAINLAYOUT */}

        {/* MAIN SECTION */}
        <div className="dashboard-main">
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
              {/* STATISTIK */}
              <section className="stats-card">
                <h2>Statistik Keseluruhan</h2>
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
                    <h3>{stats.successfulClaims}</h3>
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
                            <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
                          ) : (
                            <span style={{ fontSize: "28px" }}>📦</span>
                          )}
                        </div>
                        <h3>{item.name}</h3>
                        <p><strong>Kategori:</strong> {item.category}</p>
                        <p><strong>Lokasi:</strong> {item.location}</p>
                        <p><strong>Tanggal:</strong> {item.date}</p>
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
            <ActivityWidget />
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
                <img src={selectedReport.image} alt={selectedReport.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px", cursor: "zoom-in" }} onClick={() => setZoomedImage(selectedReport.image)} />
              ) : (
                <span style={{ fontSize: "48px" }}>📦</span>
              )}
            </div>
            <h2>{selectedReport.name}</h2>
            <div className={`detail-status ${selectedReport.type === 'hilang' ? 'status-blue' : 'status-green'}`}>
              {selectedReport.status}
            </div>
            <div className="detail-info">
              <p><strong>Kategori:</strong> {selectedReport.category}</p>
              <p><strong>Deskripsi:</strong> {selectedReport.description}</p>
              <p><strong>Lokasi:</strong> {selectedReport.location}</p>
              <p><strong>Tanggal:</strong> {selectedReport.date}</p>
              <p><strong>Waktu:</strong> {selectedReport.time}</p>
              <p><strong>Kontak:</strong> {selectedReport.contact}</p>
            </div>
            <button 
              className="detail-action-btn" 
              onClick={() => setShowClaimModal(true)}
            >
              {selectedReport.type === "hilang" ? "Saya Menemukan Barang Ini" : "Ini Barang Saya (Klaim)"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL KLAIM BARANG */}
      {showClaimModal && (
        <div className="detail-modal-bg">
          <div className="claim-popup">
            <button className="popup-close" onClick={() => { setShowClaimModal(false); setClaimForm({ catatan: "", image: null }); setPreviewClaimImage(null); }}>✕</button>
            <h2 className="popup-title">
              {selectedReport?.type === "hilang" ? "Klaim Menemukan Barang" : "Klaim Kepemilikan Barang"}
            </h2>
            <div className="popup-form">
              <div className="popup-group">
                <label>Upload Foto Bukti (Opsional)</label>
                <input type="file" accept="image/*" onChange={handleClaimUpload} />
                {previewClaimImage && <img src={previewClaimImage} alt="Preview" className="claim-preview" />}
              </div>
              <div className="popup-group">
                <label>
                  {selectedReport?.type === "hilang" ? "Informasi / Bukti Penemuan" : "Bukti Kepemilikan"} <span style={{color: "red"}}> *</span>
                </label>
                <textarea 
                  name="catatan" 
                  placeholder={selectedReport?.type === "hilang" ? "Contoh: Saya menemukan barang ini di..." : "Contoh: Terdapat stiker..."} 
                  value={claimForm.catatan} 
                  onChange={handleClaimChange} 
                />
              </div>
              <button className="popup-submit-btn" onClick={submitClaimForm}>Kirim Klaim</button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP LIGHTBOX IMAGE */}
      {zoomedImage && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, cursor: "zoom-out" }} onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} alt="Fullscreen Preview" style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", borderRadius: "8px" }} />
        </div>
      )}
    </div>
  );
}

export default DashboardUser;