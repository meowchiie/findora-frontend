import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig'; 
import './VerificationModal.css'; 

const VerificationModal = ({ isOpen, onClose }) => {
  const [localData, setLocalData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [kategori, setKategori] = useState('Semua'); 
  const [status, setStatus] = useState('Menunggu Verifikasi');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [kategoriOptions, setKategoriOptions] = useState([{ id: 'Semua', name: 'Semua' }]);
  const statusOptions = ['Semua', 'Menunggu Verifikasi', 'Diverifikasi', 'Ditolak'];
  
  const itemsPerPage = 3;

  // FETCH DATA KATEGORI
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories');
        if (response.data.success) {
          setKategoriOptions([{ id: 'Semua', name: 'Semua' }, ...response.data.data]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // FETCH DATA CLAIMS
  const fetchClaims = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/claims', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          status: status === 'Semua' ? undefined : status,
          category_id: kategori === 'Semua' ? undefined : kategori 
        }
      });

      if (response.data.success) {
        setLocalData(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching claims:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchClaims();
    }
  }, [isOpen, currentPage, kategori, status]);

  useEffect(() => {
    if (isOpen) {
      setSelectedItems([]);
    }
  }, [isOpen]);

  const handleKategoriChange = (e) => {
    setKategori(e.target.value); 
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setCurrentPage(1);
  };

  // 🛠️ HANDLER AKSI MASSAL (Bisa Terima / Tolak)
  const handleBulkAction = async (actionStatus) => {
    if (selectedItems.length === 0) return;

    const confirmAction = window.confirm(`Apakah Anda yakin ingin mengubah ${selectedItems.length} laporan menjadi "${actionStatus}"?`);
    if (!confirmAction) return;

    try {
      const response = await api.post('/api/verifications/bulk', {
        claim_ids: selectedItems,
        status: actionStatus // Berisi 'Diverifikasi' atau 'Ditolak'
      });

      if (response.data.success) {
        alert(response.data.message || `Laporan berhasil diupdate ke status ${actionStatus}!`);
        setSelectedItems([]);
        fetchClaims(); // Refresh data modal secara realtime
      }
    } catch (error) {
      console.error(`Error bulk ${actionStatus}:`, error);
      alert(error.response?.data?.message || 'Terjadi kesalahan pada server.');
    }
  };

  // 🛠️ HANDLER AKSI INDIVIDU (Per Baris)
  const handleIndividualAction = async (claimId, actionStatus) => {
    const confirmAction = window.confirm(`Apakah Anda yakin ingin memilih "${actionStatus}" untuk laporan ini?`);
    if (!confirmAction) return;

    try {
      const response = await api.post('/api/verifications/bulk', {
        claim_ids: [claimId],
        status: actionStatus
      });

      if (response.data.success) {
        alert(`Laporan #${claimId} berhasil di${actionStatus.toLowerCase()}!`);
        fetchClaims(); 
      }
    } catch (error) {
      console.error("Error individual action:", error);
      alert(error.response?.data?.message || 'Terjadi kesalahan.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="verification-modal-overlay">
      <div className="verification-modal-content">
        
        {/* --- HEADER --- */}
        <div className="modal-header">
          <div className="header-title-group">
            <span className="pre-title">Verifikasi Laporan Masuk</span>
            <h2>Daftar Laporan Masuk</h2>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* --- FILTER KONTROL --- */}
        <div className="filter-controls">
          <label className="filter-label">Kategori 
            <select value={kategori} onChange={handleKategoriChange}>
              {kategoriOptions.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-label">Status 
            <select value={status} onChange={handleStatusChange}>
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </label>
        </div>

        {/* --- TABEL DATA --- */}
        <div className="table-wrapper">
          <table className="modal-table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    onChange={(e) => setSelectedItems(e.target.checked ? localData.map(i => i.id) : [])} 
                    checked={localData.length > 0 && selectedItems.length === localData.length}
                  />
                </th>
                <th>ID</th>
                <th>Foto Barang</th> 
                <th>Foto Bukti Claim</th> 
                <th>Nama Barang</th>
                <th>Lokasi Barang</th>
                <th>Jenis</th>
                <th style={{ textAlign: 'center' }}>Aksi</th> 
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{textAlign:'center', padding:'20px'}}>Memuat data...</td></tr>
              ) : localData.length > 0 ? localData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(item.id)} 
                      onChange={() => setSelectedItems(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])} 
                    />
                  </td>
                  <td>#{item.id}</td>
                  
                  {/* 📸 FOTO BARANG (DARI DATA ITEM YANG DILAPORKAN) */}
                  <td>
                    {item.Item?.photo_path ? (
                      <img 
                        src={import.meta.env.VITE_API_URL + `/public/${item.Item.photo_path}`} 
                        alt="Barang Asli" 
                        className="img-comparison"
                      />
                    ) : (
                      <div className="foto-placeholder-tabel">Tidak ada foto</div>
                    )}
                  </td>

                  {/* 📸 FOTO BUKTI (DARI DATA CLAIM USER) */}
                  <td>
                    {item.proof_photo_path ? (
                      <img 
                        src={import.meta.env.VITE_API_URL + `/public/${item.proof_photo_path}`} 
                        alt="Bukti Klaim" 
                        className="img-comparison"
                      />
                    ) : (
                      <div className="foto-placeholder-tabel">Tidak ada bukti</div>
                    )}
                  </td>

                  <td>{item.Item?.name || 'Tanpa Nama'}</td>
                  <td className="loc-date">{item.Item?.location || '-'}</td>
                  <td>
                    <span className={`status-pill ${item.Item.type.toLowerCase().replace(/\s+/g, '-')}`}>
                      {item.Item.type}
                    </span>
                  </td>
                  
                  {/* 🛠️ TOMBOL AKSI INDIVIDU */}
                  <td>
                    <div className="row-actions">
                      <button 
                        className="action-icon-btn btn-accept" 
                        title="Verifikasi Laporan"
                        onClick={() => handleIndividualAction(item.id, 'Diverifikasi')}
                        disabled={item.status === 'Diverifikasi'}
                      >
                        ✓
                      </button>
                      <button 
                        className="action-icon-btn btn-reject" 
                        title="Tolak Laporan"
                        onClick={() => handleIndividualAction(item.id, 'Ditolak')}
                        disabled={item.status === 'Ditolak'}
                      >
                        ✕
                      </button>
                    </div>
                  </td>

                </tr>
              )) : (
                <tr><td colSpan="8" style={{textAlign:'center', padding:'20px'}}>Tidak ada data ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- FOOTER & PAGINASI --- */}
        <div className="modal-footer">
          <div className="pagination">
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              &#9664;
            </button>
            <span className="page-active">{currentPage} dari {totalPages}</span>
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              &#9654;
            </button>
          </div>
          
          {/* 🛠️ TOMBOL AKSI MASSAL */}
          <div className="modal-actions">
            <button className="btn-batal" onClick={onClose}>Tutup</button>
            
            <button 
              className="btn-tolak-bulk" 
              disabled={selectedItems.length === 0}
              onClick={() => handleBulkAction('Ditolak')}
            >
              Tolak ({selectedItems.length})
            </button>

            <button 
              className="btn-verifikasi" 
              disabled={selectedItems.length === 0}
              onClick={() => handleBulkAction('Diverifikasi')}
            >
              Verifikasi ({selectedItems.length})
            </button>
          </div>
        </div>

      </div>
    </div>
    </>
  );
};

export default VerificationModal;