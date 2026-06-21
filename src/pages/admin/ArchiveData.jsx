import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig'; // Instance Axios Anda
import '../../styles/ArchiveData.css';
import logo from '../../assets/logo.png';

const ArchiveData = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pengguna');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- STATE DATA DARI BACKEND ---
  const [usersArchived, setUsersArchived] = useState([]);
  const [totalArchivedUsers, setTotalArchivedUsers] = useState(0);

  // State Sementara untuk Laporan (Sesuaikan jika API Laporan sudah siap)
  const [reportsArchived, setReportsArchived] = useState([
    { id: '#009', item: 'Headphone Lenovo Hitam', date: '30 Maret 2026', status: 'Diarsipkan' },
    { id: '#008', item: 'Kepala cas hp', date: '03 April 2026', status: 'Diarsipkan' },
  ]);

  // ================= FETCH DATA DARI API =================
  const fetchArchivedUsers = async () => {
    setLoading(true);
    try {
      // 1. Mengarah ke endpoint khusus data yang sudah ter-softdelete
      const response = await api.get('/api/users/archived', {
        params: {
          search: searchQuery
        }
      });
      
      if (response.data.success) {
        // Karena backend sudah otomatis memfilter data soft-delete, langsung set state
        setUsersArchived(response.data.users);
        setTotalArchivedUsers(response.data.users.length);
      }
    } catch (error) {
      console.error("Gagal memuat arsip pengguna:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pengguna') {
      fetchArchivedUsers();
    }
  }, [activeTab, searchQuery]);


  // ================= LOGIKA AKSI INTEGRASI BACKEND =================

  // 1. Fungsi Pulihkan Data (Menghubungkan ke Endpoint Restore)
  const handleRestore = async (user) => {
    const isConfirmed = window.confirm(`Apakah Anda yakin ingin memulihkan pengguna ${user.name} (ID: ${user.id})?`);
    
    if (isConfirmed) {
      try {
        // 2. Menggunakan POST ke endpoint restore baru
        const response = await api.post(`/api/users/${user.id}/restore`);
        if (response.data.success) {
          alert(`Pengguna ${user.name} berhasil dipulihkan ke daftar aktif!`);
          fetchArchivedUsers(); // Refresh data halaman arsip
        }
      } catch (error) {
        alert(error.response?.data?.message || "Gagal memulihkan pengguna");
      }
    }
  };

  // 2. Fungsi Hapus Permanen (Menghubungkan ke Endpoint Hard Delete)
  const handleDeletePermanent = async (id, name, type) => {
    const isConfirmed = window.confirm(
      `PERINGATAN KERAS!\nAnda akan menghapus PERMANEN ${type}: ${name} (ID: ${id}).\nTindakan ini menghapus data langsung dari database dan tidak dapat dibatalkan. Lanjutkan?`
    );
    
    if (isConfirmed) {
      if (type === 'pengguna') {
        try {
          // 3. Menggunakan endpoint /permanent agar tidak memicu soft-delete lagi
          const response = await api.delete(`/api/users/${id}/permanent`);
          if (response.data.success) {
            alert("Pengguna telah dihapus secara permanen dari sistem.");
            fetchArchivedUsers(); // Refresh data
          }
        } catch (error) {
          alert(error.response?.data?.message || "Gagal menghapus data permanen");
        }
      } else {
        // Logika hapus permanen untuk laporan (Simulasi)
        setReportsArchived(reportsArchived.filter(report => report.id !== id));
        alert("Laporan berhasil dihapus permanen (Simulasi).");
      }
    }
  };

  // --- IKON SVG ---
  const iconUser = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ED7D31" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );

  const iconReport = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ED7D31" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
  );

  return (
    <div className="admin-layout">
      {/* --- NAVBAR --- */}
      <header className="mu-top-navbar">
        <div className="mu-nav-left">
          <button className="btn-back-nav" onClick={() => navigate(-1)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#5A3929" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <img src={logo} alt="Logo" className="mu-logo-img" />
          <div className="logo-text"><h2>FINDORA</h2><span>Lost & Found</span></div>
        </div>
        
        <div className="mu-nav-right">
          <div className="mu-avatar-circle">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <span className="admin-name">Admin</span>
        </div>
      </header>

      {/* --- KONTEN UTAMA --- */}
      <main className="main-content">
        <h1 className="page-title">Arsip Data Pengguna & Laporan</h1>

        {/* --- STAT CARD --- */}
        <div className="mu-top-actions">
          <div className="mu-stat-card mu-card-total" style={{width: 'fit-content', minWidth: '280px'}}>
             <div className="mu-stat-title">
               {activeTab === 'pengguna' ? iconUser : iconReport}
               Total {activeTab === 'pengguna' ? 'Pengguna' : 'Laporan'} Diarsipkan
             </div>
             <div className="mu-stat-number">
               {activeTab === 'pengguna' ? totalArchivedUsers : reportsArchived.length}
             </div>
          </div>
        </div>

        {/* --- TABEL CONTAINER --- */}
        <div className="mu-table-container">
          <div className="mu-table-header">
            <div style={{display: 'flex', gap: '20px'}}>
               <h3 className={`tab-title ${activeTab === 'pengguna' ? 'active' : ''}`} onClick={() => { setActiveTab('pengguna'); setSearchQuery(''); }}>Arsip Pengguna</h3>
               <h3 className={`tab-title ${activeTab === 'laporan' ? 'active' : ''}`} onClick={() => { setActiveTab('laporan'); setSearchQuery(''); }}>Arsip Laporan</h3>
            </div>
            
            <div className="mu-search-box">
                <input 
                  type="text" 
                  placeholder={activeTab === 'pengguna' ? "Cari nama atau NIM..." : "Cari barang..."} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#5A3929" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </div>
          
          <div className="table-responsive">
             <table className="mu-users-table">
                <thead>
                    {activeTab === 'pengguna' ? (
                        <tr><th>ID Pengguna</th><th>Nama Lengkap</th><th>NIM/NIP</th><th>Hak Akses</th><th>Status</th><th>Aksi</th></tr>
                    ) : (
                        <tr><th>ID Laporan</th><th>Nama Barang</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr>
                    )}
                </thead>
                <tbody>
                    {loading ? (
                      <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>Memuat data arsip...</td></tr>
                    ) : activeTab === 'pengguna' ? (
                      usersArchived.length > 0 ? usersArchived.map(u => (
                        <tr key={u.id}>
                            <td><strong>#{u.id}</strong></td>
                            <td>{u.name}</td>
                            <td>{u.nim}</td>
                            <td><span className={`mu-badge mu-access-${u.role ? u.role.toLowerCase() : 'mahasiswa'}`}>{u.role}</span></td>
                            <td><span className="mu-badge mu-status-nonaktif">{u.status}</span></td>
                            <td className="mu-actions">
                              <button className="mu-icon-btn mu-btn-restore" title="Pulihkan Pengguna" onClick={() => handleRestore(u)}>↺</button>
                              <button className="mu-icon-btn mu-btn-delete" title="Hapus Permanen" onClick={() => handleDeletePermanent(u.id, u.name, 'pengguna')}>🗑</button>
                            </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>Tidak ada arsip pengguna.</td></tr>
                      )
                    ) : (
                      reportsArchived.length > 0 ? reportsArchived.map(r => (
                        <tr key={r.id}>
                            <td><strong>{r.id}</strong></td>
                            <td>{r.item}</td>
                            <td>{r.date}</td>
                            <td><span className="mu-badge mu-status-nonaktif">{r.status}</span></td>
                            <td className="mu-actions">
                              <button className="mu-icon-btn mu-btn-restore" title="Pulihkan Laporan" onClick={() => alert("Fitur pulihkan laporan akan aktif setelah API terhubung.")}>↺</button>
                              <button className="mu-icon-btn mu-btn-delete" title="Hapus Permanen" onClick={() => handleDeletePermanent(r.id, r.item, 'laporan')}>🗑</button>
                            </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>Tidak ada arsip laporan.</td></tr>
                      )
                    )}
                </tbody>
             </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArchiveData;