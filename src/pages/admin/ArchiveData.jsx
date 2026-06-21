import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/ArchiveData.css';
import logo from '../../assets/logo.png';

const ArchiveData = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pengguna');

  // State untuk menyimpan data Arsip Pengguna
  const [usersArchived, setUsersArchived] = useState([
    { id: 'U0011', name: 'Reynald', nim: '231011999', access: 'Mahasiswa', status: 'Nonaktif' },
    { id: 'U008', name: 'Elaine Calista', nim: '9823589237999', access: 'Dosen', status: 'Nonaktif' },
  ]);

  // State untuk menyimpan data Arsip Laporan
  const [reportsArchived, setReportsArchived] = useState([
    { id: '#009', item: 'Headphone Lenovo Hitam', date: '30 Maret 2026', status: 'Diarsipkan' },
    { id: '#008', item: 'Kepala cas hp', date: '03 April 2026', status: 'Diarsipkan' },
  ]);

  // --- LOGIKA AKSI ---

  // 1. Fungsi Pulihkan Data
  const handleRestore = (id, type) => {
    const isConfirmed = window.confirm(`Apakah Anda yakin ingin memulihkan ${type} dengan ID ${id}?`);
    
    if (isConfirmed) {
      if (type === 'pengguna') {
        setUsersArchived(usersArchived.filter(user => user.id !== id));
      } else {
        setReportsArchived(reportsArchived.filter(report => report.id !== id));
      }
      alert(`Data ${type} berhasil dipulihkan!`);
    }
  };

  // 2. Fungsi Hapus Permanen
  const handleDeletePermanent = (id, type) => {
    const isConfirmed = window.confirm(
      `PERINGATAN! Anda akan menghapus permanen ${type} dengan ID ${id}.\nTindakan ini tidak dapat dibatalkan. Lanjutkan?`
    );
    
    if (isConfirmed) {
      if (type === 'pengguna') {
        setUsersArchived(usersArchived.filter(user => user.id !== id));
      } else {
        setReportsArchived(reportsArchived.filter(report => report.id !== id));
      }
    }
  };

  // --- IKON SVG (Diselaraskan dengan Dashboard) ---
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
             <div className="mu-stat-number">{activeTab === 'pengguna' ? usersArchived.length : reportsArchived.length}</div>
          </div>
        </div>

        {/* --- TABEL CONTAINER --- */}
        <div className="mu-table-container">
          <div className="mu-table-header">
            <div style={{display: 'flex', gap: '20px'}}>
               <h3 className={`tab-title ${activeTab === 'pengguna' ? 'active' : ''}`} onClick={() => setActiveTab('pengguna')}>Arsip Pengguna</h3>
               <h3 className={`tab-title ${activeTab === 'laporan' ? 'active' : ''}`} onClick={() => setActiveTab('laporan')}>Arsip Laporan</h3>
            </div>
            
            <div className="mu-search-box">
                <input type="text" placeholder="Search" />
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#5A3929" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </div>
          
          <div className="table-responsive">
             <table className="mu-users-table">
                <thead>
                    {activeTab === 'pengguna' ? (
                        <tr><th>ID Pengguna</th><th>Nama Lengkap</th><th>NIM/NIP</th><th>Status</th><th>Aksi</th></tr>
                    ) : (
                        <tr><th>ID Laporan</th><th>Nama Barang</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr>
                    )}
                </thead>
                <tbody>
                    {activeTab === 'pengguna' ? usersArchived.map(u => (
                        <tr key={u.id}>
                            <td>{u.id}</td><td>{u.name}</td><td>{u.nim}</td>
                            <td><span className="mu-badge mu-status-nonaktif">{u.status}</span></td>
                            <td className="mu-actions">
                              <button className="mu-icon-btn mu-btn-restore" title="Pulihkan" onClick={() => handleRestore(u.id, 'pengguna')}>↺</button>
                              <button className="mu-icon-btn mu-btn-delete" title="Hapus Permanen" onClick={() => handleDeletePermanent(u.id, 'pengguna')}>🗑</button>
                            </td>
                        </tr>
                    )) : reportsArchived.map(r => (
                        <tr key={r.id}>
                            <td>{r.id}</td><td>{r.item}</td><td>{r.date}</td>
                            <td><span className="mu-badge mu-status-nonaktif">{r.status}</span></td>
                            <td className="mu-actions">
                              <button className="mu-icon-btn mu-btn-restore" title="Pulihkan" onClick={() => handleRestore(r.id, 'laporan')}>↺</button>
                              <button className="mu-icon-btn mu-btn-delete" title="Hapus Permanen" onClick={() => handleDeletePermanent(r.id, 'laporan')}>🗑</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArchiveData;