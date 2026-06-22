import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"; // Tambahkan useSearchParams
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../utils/axiosConfig";
import logo from "../assets/logo.png";
import "../styles/dashboard.css"; 
import "../styles/semuaLaporan.css"; 

function SemuaLaporan() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Inisialisasi useSearchParams untuk membaca dan menulis query param di URL
  const [searchParams, setSearchParams] = useSearchParams();

  // 2. Ambil nilai langsung dari URL query params (berikan fallback jika kosong)
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const filterType = searchParams.get("type") || "semua";
  const urlSearchQuery = searchParams.get("search") || location.state?.keyword || "";

  // State Data & API
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk mengontrol text input pencarian secara lokal (supaya ketikan lancar/tidak lag)
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);

  // State Pagination (Hanya menyimpan total data dari backend, currentPage pindah ke URL)
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalItems: 0
  });

  // State Modals
  const [selectedReport, setSelectedReport] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  // State Form Klaim
  const [claimForm, setClaimForm] = useState({ catatan: "", image: null });
  const [previewClaimImage, setPreviewClaimImage] = useState(null);

  // Sync ulang kolom input jika query param 'search' di URL berubah secara eksternal
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  // --- 1. FETCH DATA DARI BACKEND BERDASARKAN URL QUERY PARAMS ---
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        // Susun URL API backend menggunakan variabel yang didapat dari URL frontend
        let url = `/api/items?page=${currentPage}&limit=8`;
        
        if (filterType !== "semua") {
          url += `&type=${filterType}`;
        }

        if (urlSearchQuery.trim() !== "") {
          url += `&search=${encodeURIComponent(urlSearchQuery)}`;
        }

        const response = await api.get(url);
        const rawItems = response.data.data || [];
        const meta = response.data.meta || { totalPages: 1, totalItems: 0 };

        const formattedReports = rawItems.map((item) => {
          const isHilang = item.type === "hilang";
          const categoryName = item.Category?.name || item.category || "Lainnya";

          return {
            id: `${item.type}-${item.id}`,
            dbId: item.id,
            name: item.name || "Tanpa Nama",
            description: item.description || "",
            category: categoryName,
            location: item.location || "-",
            date: item.lost_date ? (item.lost_date.includes("T") ? item.lost_date.split("T")[0] : item.lost_date) : "-", 
            time: item.lost_time || "-",
            contact: item.contact || "-",
            image: item.photo_path ? `http://localhost:5000/public/${item.photo_path.replace(/\\/g, '/')}` : null,
            status: isHilang ? "Hilang" : "Ditemukan",
            type: isHilang ? "hilang" : "ditemukan",
          };
        });

        setReports(formattedReports);
        setPagination({
          totalPages: meta.totalPages || 1,
          totalItems: meta.totalItems || 0
        });

      } catch (error) {
        console.error("Gagal mengambil data laporan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [currentPage, filterType, urlSearchQuery]); // Trigger fetch ulang otomatis saat query param URL berubah


  // --- 2. HANDLERS UI (UPDATE URL QUERY PARAMS) ---
  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      const newParams = new URLSearchParams(searchParams);
      if (searchQuery.trim()) {
        newParams.set("search", searchQuery);
      } else {
        newParams.delete("search"); // Hapus param jika kolom kosong
      }
      newParams.set("page", "1"); // Reset ke halaman 1 tiap cari baru
      setSearchParams(newParams);
    }
  };

  const handleFilterClick = (type) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("type", type);
    newParams.set("page", "1"); // Reset ke halaman 1 tiap ganti filter
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", newPage.toString());
      setSearchParams(newParams);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- 3. HANDLERS FORM KLAIM ---
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
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join("\n");
        alert(`Gagal mengirim klaim:\n${errorMessages}`);
      } else {
        alert(error.response?.data?.message || "Terjadi kesalahan koneksi saat mengirim klaim.");
      }
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        
        {/* TOPBAR */}
        <div className="dashboard-topbar">
          <div className="topbar-left" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
            <span className="back-arrow">←</span>
            <img className="dashboard-logo" src={logo} alt="Findora Logo" />
          </div>
          
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Cari barang..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit} 
            />
            <Search size={18} className="search-icon" style={{ cursor: "pointer" }} onClick={handleSearchSubmit} />
          </div>

          <div className="dashboard-profile" onClick={() => navigate("/profile")}>
             <div className="dashboard-avatar">👤</div>
          </div>
        </div>

        {/* MAIN SECTION */}
        <div className="semua-main" style={{ padding: '20px 40px' }}>
          
          <div className="semua-topbar" style={{ marginBottom: '20px' }}>
            <h1>Semua Laporan</h1>
            <p style={{ color: '#666' }}>Total data: {pagination.totalItems} Laporan</p>
          </div>

          {/* FILTER BUTTONS */}
          <div className="filter-buttons" style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
            <button 
              className={`filter-btn ${filterType === 'semua' ? 'active' : ''}`} 
              onClick={() => handleFilterClick('semua')}
              style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: filterType === 'semua' ? '#007bff' : '#fff', color: filterType === 'semua' ? '#fff' : '#333' }}
            >
              Semua Barang
            </button>
            <button 
              className={`filter-btn ${filterType === 'hilang' ? 'active' : ''}`} 
              onClick={() => handleFilterClick('hilang')}
              style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: filterType === 'hilang' ? '#dc3545' : '#fff', color: filterType === 'hilang' ? '#fff' : '#333' }}
            >
              Barang Hilang
            </button>
            <button 
              className={`filter-btn ${filterType === 'ditemukan' ? 'active' : ''}`} 
              onClick={() => handleFilterClick('ditemukan')}
              style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: filterType === 'ditemukan' ? '#28a745' : '#fff', color: filterType === 'ditemukan' ? '#fff' : '#333' }}
            >
              Barang Ditemukan
            </button>
          </div>

          {/* GRID DATA */}
          {isLoading ? (
            <p style={{ textAlign: "center", padding: "50px 0" }}>Memuat data...</p>
          ) : (
            <>
              <div className="report-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', paddingTop: '10px' }}>
                {reports.length > 0 ? (
                  reports.map((item) => (
                    <div className="semua-card" key={item.id} onClick={() => setSelectedReport(item)}>
                      <div className="report-image" style={{ height: '150px', marginBottom: '10px' }}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", backgroundColor: "#eee", display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontSize: "28px" }}>📦</div>
                        )}
                      </div>
                      <h3 style={{ margin: '0 0 5px 0' }}>{item.name}</h3>
                      <p style={{ fontSize: '14px', margin: '3px 0' }}><strong>Kategori:</strong> {item.category}</p>
                      <p style={{ fontSize: '14px', margin: '3px 0' }}><strong>Lokasi:</strong> {item.location}</p>
                      <p style={{ fontSize: '14px', margin: '3px 0' }}><strong>Tanggal:</strong> {item.date}</p>
                      <div style={{ marginTop: '10px' }}>
                        <span className={`report-status ${item.type === 'hilang' ? 'status-blue' : 'status-green'}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ gridColumn: "1/-1", textAlign: "center", padding: "50px 0", color: "#888" }}>
                    Tidak ada laporan {filterType !== 'semua' ? filterType : ''} yang ditemukan.
                  </p>
                )}
              </div>

              {/* PAGINATION CONTROLS */}
              {pagination.totalPages > 1 && (
                <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '40px' }}>
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{ padding: '8px 12px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  
                  <span>Halaman <strong>{currentPage}</strong> dari {pagination.totalPages}</span>
                  
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    style={{ padding: '8px 12px', cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
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
            </div>

            <button className="detail-action-btn" style={{ backgroundColor: selectedReport.type === 'hilang' ? '#007bff' : '#28a745' }} onClick={() => setShowClaimModal(true)}>
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

      {/* ZOOM IMAGE MODAL */}
      {zoomedImage && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, cursor: "zoom-out" }} onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} alt="Fullscreen Preview" style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", borderRadius: "8px" }} />
        </div>
      )}
    </div>
  );
}

export default SemuaLaporan;