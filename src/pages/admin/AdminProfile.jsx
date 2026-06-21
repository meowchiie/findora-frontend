import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/AdminProfile.css';

const AdminProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('validasi');
  const [showLogout, setShowLogout] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  // --- STATE DATA ---
  const [validasiReports, setValidasiReports] = useState([
    { id: '#001', item: 'Dompet Hitam', status: 'HILANG', statusClass: 'hilang', date: '1 April 2026', action: 'Verifikasi', actionClass: 'btn-verifikasi' },
    { id: '#002', item: 'Jam Tangan', status: 'Klaim Diverifikasi', statusClass: 'diverifikasi', date: '1 April 2026', action: 'Selesai', actionClass: 'btn-selesai' },
    { id: '#003', item: 'Kunci Motor', status: 'HILANG', statusClass: 'hilang', date: '1 April 2026', action: 'Verifikasi', actionClass: 'btn-verifikasi' },
  ]);

  const [klaimReports, setKlaimReports] = useState([
    { id: '#004', item: 'Dompet Hitam', status: 'Klaim Berhasil', statusClass: 'berhasil', date: '1 April 2026', action: 'Selesai', actionClass: 'btn-selesai-gray' },
  ]);

  const currentReports = activeTab === 'validasi' ? validasiReports : klaimReports;

  // --- LOGIKA AKSI ---
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteReport = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus laporan ini?")) {
      if (activeTab === 'validasi') {
        setValidasiReports(validasiReports.filter(report => report.id !== id));
      } else {
        setKlaimReports(klaimReports.filter(report => report.id !== id));
      }
    }
  };

  const handleSaveProfile = () => alert("Profil berhasil disimpan!");
  const handleLogout = () => { alert("Berhasil Keluar!"); setShowLogout(false); };

  return (
    <div className="admin-container">
      {/* --- NAVBAR BERSIH (TANPA LOGO/TEKS ADMIN) --- */}
      <header className="mu-top-navbar">
        <div className="mu-nav-left">
          <button className="btn-back-nav" onClick={() => navigate(-1)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#5A3929" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
        </div>
      </header>

      {/* --- KONTEN UTAMA --- */}
      <main className="main-content">
        <h1 className="page-title">Profil Admin</h1>
        
        <div className="content-grid">
          <div className="card left-panel">
            <div className="avatar-container">
              <div className="avatar-large" style={{ backgroundImage: profileImage ? `url(${profileImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                {!profileImage && <svg viewBox="0 0 24 24" width="60" height="60" stroke="white" strokeWidth="2" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
              <button className="btn-sunting" onClick={() => fileInputRef.current.click()}>Sunting Foto</button>
            </div>
            
            <div className="form-group"><label>Email</label><input type="email" defaultValue="admin@gmail.com" /></div>
            <div className="form-group"><label>Kata Sandi</label><div className="input-wrapper"><input type="password" defaultValue="........" /><button className="badge-ubah-sandi">Ubah Sandi</button></div></div>
            
            <div className="action-buttons-profile">
              <button className="btn-simpan-profil" onClick={handleSaveProfile}>Simpan</button>
              <button className="btn-keluar-profil" onClick={() => setShowLogout(true)}>Keluar</button>
            </div>
          </div>

          <div className="card right-panel">
            <h3 className="section-title">Aktivitas Saya</h3>
            <div className="tabs-container">
              <button className={`tab-item ${activeTab === 'validasi' ? 'active' : ''}`} onClick={() => setActiveTab('validasi')}>Validasi Laporan</button>
              <button className={`tab-item ${activeTab === 'klaim' ? 'active' : ''}`} onClick={() => setActiveTab('klaim')}>Klaim Berhasil</button>
            </div>
            
            <div className="reports-container">
              {currentReports.length === 0 ? <p className="empty-state">Tidak ada laporan saat ini.</p> : currentReports.map((report) => (
                <div key={report.id} className="report-card">
                  <div className="report-info">
                    <h4 className="report-id">Validasi Laporan {report.id}:</h4>
                    <span className="report-item-name">{report.item}</span>
                    <div className="report-status-row"><span>Status : </span><span className={`status-badge ${report.statusClass}`}>{report.status}</span></div>
                    <span className="report-date">Tanggal : {report.date}</span>
                  </div>
                  <div className="report-actions">
                    <button className="btn-lihat-detail" onClick={() => alert("Lihat detail " + report.id)}>Lihat Detail</button>
                    <button className={`btn-action-primary ${report.actionClass}`} onClick={() => alert("Aksi: " + report.action)}>{report.action}</button>
                    <button className="btn-delete" onClick={() => handleDeleteReport(report.id)}>
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="white" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL LOGOUT --- */}
      {showLogout && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon-warning">!</div><p>Apakah anda yakin ingin Log out?</p>
            <div className="modal-buttons">
              <button className="btn-modal-cancel" onClick={() => setShowLogout(false)}>Batalkan</button>
              <button className="btn-modal-confirm" onClick={handleLogout}>Ya</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;