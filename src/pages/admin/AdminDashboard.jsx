import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import './AdminDashboard.css';
import logo from '../../assets/logo.png';
import VerificationModal from '../../components/modals/VerificationModal';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const AdminDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const modalData = [
    { id: '#005', name: 'Kalkulator', loc: 'Kampus 2 / 08 April 2026', status: 'Hilang', foto: 'https://via.placeholder.com/50' },
    { id: '#006', name: 'Kabel usb Type-C', loc: 'Kampus 1 / 07 April 2026', status: 'Hilang', foto: 'https://via.placeholder.com/50' },
    { id: '#007', name: 'Tas Slempang H     itam', loc: 'Kampus 2 / 07 April 2026', status: 'Ditemukan', foto: 'https://via.placeholder.com/50' },
  ];

  const statsData = [
    { id: 1, title: 'Total Hilang', count: 3, bgColor: 'bg-blue', borderColor: 'border-blue', textColor: 'text-blue', icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>) },
    { id: 2, title: 'Total Ditemukan', count: 2, bgColor: 'bg-green', borderColor: 'border-green', textColor: 'text-green', icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>) },
    { id: 3, title: 'Klaim Menunggu Verifikasi', count: 3, bgColor: 'bg-yellow', borderColor: 'border-yellow', textColor: 'text-yellow', icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>) },
    { id: 4, title: 'Pengguna Terdaftar', count: 10, bgColor: 'bg-red', borderColor: 'border-red', textColor: 'text-red', icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>) }
  ];

  const activitiesData = [
    { id: 1, title: 'Laporan Kunci Hilang: Aktif', time: '2 jam yang lalu', userAvatar: null },
    { id: 2, title: 'Laporan Dompet Hilang: Aktif', time: '2 jam yang lalu', userAvatar: null },
    { id: 3, title: 'Klaim Kunci Hilang: Sedang Diverifikasi', time: '2 jam yang lalu', userAvatar: null },
    { id: 4, title: 'Laporan Jaket Hilang: Aktif', time: '2 jam yang lalu', userAvatar: null },
    { id: 5, title: 'Klaim Handphone: Sedang Diverifikasi', time: '2 jam yang lalu', userAvatar: null },
    { id: 6, title: 'Laporan Botol Hilang: Sedang Diverifikasi', time: '2 jam yang lalu', userAvatar: null },
  ];

  const doughnutData = {
    labels: ['Elektronik', 'Aksesoris', 'Kunci', 'Dokumen', 'Dompet & Sejenisnya', 'Lainnya'],
    datasets: [{ data: [30, 20, 15, 10, 15, 10], backgroundColor: ['#A7E4F2', '#FFC0CB', '#FFFACD', '#98FB98', '#FF6B6B', '#DDA0DD'], borderWidth: 0 }]
  };

  const doughnutOptions = { plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { size: 10 } } } }, maintainAspectRatio: false };

  const barData = {
    labels: ['Januari', 'Februari', 'Maret', 'April'],
    datasets: [
      { label: 'Barang Hilang', data: [10, 17, 48, 14], backgroundColor: '#36A2EB', borderRadius: 4 },
      { label: 'Barang Ditemukan', data: [20, 7, 15, 25], backgroundColor: '#28A745', borderRadius: 4 },
    ]
  };

  const barOptions = { plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { size: 10 } } } }, scales: { y: { beginAtZero: true, max: 60, ticks: { stepSize: 15 } } }, maintainAspectRatio: false };

  return (
    <div className="admin-layout">
      <header className="top-navbar">
        <div className="nav-logo">
          <img src={logo} alt="Logo Findora" className="logo-img" />
          <div className="logo-text"><h2>FINDORA</h2><span>Lost & Found</span></div>
        </div>
        
        <div className="nav-center">
          <div className="search-box">
            <input type="text" placeholder="Search" />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#5A3929" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="dashboard-search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>

        <div className="nav-profile" onClick={() => navigate('/admin/profile')} style={{ cursor: 'pointer' }}>
          <div className="avatar-circle">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
            <span className="admin-name">Admin</span>
        </div>
      </header>

      <main className="main-content">
        <h1 className="page-title">Dashboard Admin</h1>
        <div className="stats-container">
          {statsData.map((stat) => (
            <div key={stat.id} className={`stat-card ${stat.borderColor}`}>
              <div className={`stat-icon ${stat.bgColor}`}>{stat.icon}</div>
              <div className="stat-info"><p>{stat.title}</p><h3 className={stat.textColor}>{stat.count}</h3></div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          <div className="left-column">
            <div className="quick-actions-card">
              <h3>Tindakan Cepat Admin</h3>
              
              <div className="action-buttons">
                <button className="btn" onClick={() => setIsModalOpen(true)}>Verifikasi Laporan Masuk</button>
                <button className="btn" onClick={() => navigate('/admin/users')}>Kelola Pengguna</button>
                <button className="btn" onClick={() => navigate('/admin/archive')}>Arsip Data</button>
              </div>
            </div>

            <div className="charts-panel">
              <h3 className="panel-title text-red">Ringkasan laporan Kampus</h3>
              <div className="charts-wrapper">
                {/* PENAMBAHAN JUDUL GRAFIK DI SINI */}
                <div className="chart-box">
                  <h3 className="chart-subtitle">Laporan Berdasarkan Kategori</h3>
                  <div className="chart-canvas-container">
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  </div>
                </div>
                
                <div className="chart-box">
                  <h3 className="chart-subtitle">Statistik Laporan Bulanan</h3>
                  <div className="chart-canvas-container">
                    <Bar data={barData} options={barOptions} />
                  </div>
                </div>
                {/* SELESAI PENAMBAHAN */}
              </div>
            </div>
          </div>

          <div className="activity-panel">
            <h3 className="panel-title">Aktivitas Terbaru</h3>
            <div className="activity-list-container">
              <ul className="activity-list">
                {activitiesData.map((activity) => (
                  <li key={activity.id}>
                    <div className="activity-avatar-container">
                      <div className="activity-avatar-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </div>
                    </div>
                    <div className="activity-text">
                      <p><strong>{activity.title}</strong></p>
                      <span>{activity.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      <VerificationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={modalData} />
    </div>
  );
};

export default AdminDashboard;