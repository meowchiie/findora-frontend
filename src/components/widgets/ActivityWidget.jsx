import { useState, useEffect } from "react";
import api from "../../utils/axiosConfig"; // Sesuaikan dengan konfigurasi axios kamu
import "../../styles/activity.css"; // Silakan buat atau satukan styling-nya

function ActivityWidget() {
  const [activities, setActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi pembantu untuk membuat format waktu relatif (e.g., "2 jam lalu")
  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now - past;
    
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return "Baru saja";
    if (diffInMins < 60) return `${diffInMins} menit lalu`;
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    return `${diffInDays} hari lalu`;
  };

  // Fetch data dari backend
  const fetchActivities = async (page) => {
    setIsLoading(true);
    try {
      // Mengirimkan parameter page ke endpoint backend
      const response = await api.get(`/api/activities?page=${page}`);
      
      if (response.data && response.data.success) {
        // Asumsi struktur respons: response.data.data = { activities, totalPages, ... }
        const { activities, totalPages } = response.data.data;
        setActivities(activities);
        setTotalPages(totalPages || 1);
      }
    } catch (error) {
      console.error("Gagal memuat aktivitas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Jalankan fetch setiap kali currentPage berubah
  useEffect(() => {
    fetchActivities(currentPage);
  }, [currentPage]);

  return (
    <aside className="activity-panel">
      <h2>Aktivitas</h2>
      
      {isLoading ? (
        <p className="loading-text">Memuat aktivitas...</p>
      ) : activities.length === 0 ? (
        <p className="empty-text">Belum ada riwayat aktivitas.</p>
      ) : (
        <div className="activity-list">
          {activities.map((item, index) => (
            <div className="activity-row" key={item.id || index}>
              {/* Menggunakan foto profil dari backend jika ada, jika tidak pakai emoji */}
              <div className="activity-avatar">
                {item.user?.profile_picture ? (
                  <img 
                    src={import.meta.env.VITE_API_URL + `/public${item.user.profile_picture}`} 
                    alt="Avatar" 
                    className="activity-avatar-img"
                  />
                ) : (
                  "👤"
                )}
              </div>
              <div>
                {/* item.detail berisi string utuh dari backend seperti "Damdam menemukan barang..." */}
                <h3>{item.detail}</h3>
                {/* Status tambahan opsional jika model backend mengembangkannya */}
                {item.status && <p>{item.status}</p>}
                <small>{formatRelativeTime(item.createdAt)}</small>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UI PENGENDALI PAGINATION */}
      {totalPages > 1 && (
        <div className="activity-pagination" style={{ display: "flex", justifyContent: "space-between", marginTop: "15px", alignItems: "center" }}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            style={{ padding: "4px 8px", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
          >
            Kembali
          </button>
          <span style={{ fontSize: "12px", fontWeight: "600" }}>
            Halaman {currentPage} dari {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            style={{ padding: "4px 8px", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
          >
            Lanjut
          </button>
        </div>
      )}
    </aside>
  );
}

export default ActivityWidget;