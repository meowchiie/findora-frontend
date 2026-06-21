import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig'; 
import './VerificationModal.css'; 

const VerificationModal = ({ isOpen, onClose }) => {
  const [localData, setLocalData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [kategori, setKategori] = useState('Semua'); // Menyimpan ID kategori / "Semua"
  const [status, setStatus] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // 🛠️ KATEGORI SEKARANG BERBENTUK ARRAY OF OBJECTS
  const [kategoriOptions, setKategoriOptions] = useState([{ id: 'Semua', name: 'Semua' }]);
  const statusOptions = ['Semua', 'Menunggu Verifikasi', 'Diverifikasi', 'Ditolak'];
  
  const itemsPerPage = 3;

  // FETCH DATA KATEGORI DARI DATABASE
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories');
        if (response.data.success) {
          // Satukan opsi 'Semua' dengan seluruh data dari backend
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

  // FETCH DATA CLAIMS DENGAN EMIT PARAMETER FILTER YANG BENAR
  const fetchClaims = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/claims', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          status: status === 'Semua' ? undefined : status,
          category_id: kategori === 'Semua' ? undefined : kategori // 🛠️ KIRIM ID BUKAN STRING NAMA
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
    setKategori(e.target.value); // Nilai ini akan berupa ID kategori angka
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleBulkVerify = async () => {
    if (selectedItems.length === 0) return;

    try {
      const response = await api.post('/api/verifications/bulk', {
        claim_ids: selectedItems,
        status: 'Diverifikasi' 
      });

      if (response.data.success) {
        alert(response.data.message || "Laporan berhasil diverifikasi!");
        setSelectedItems([]);
        onClose();
        window.location.reload(); 
      }
    } catch (error) {
      console.error("Error bulk verification:", error);
      if (error.response?.data?.message) {
        alert(`Gagal: ${error.response.data.message}`);
      } else {
        alert('Terjadi kesalahan pada server.');
      }
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
              {/* 🛠️ VALUE MENGGUNAKAN OPT.ID SEBAGAI VALUE UTAMA */}
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
                <th>ID Laporan</th>
                <th>Foto Bukti</th>
                <th>Nama Barang</th>
                <th>Lokasi Barang</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>Memuat data...</td></tr>
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
                  <td>
                    {item.proof_photo_path ? (
                      <img 
                        src={`http://localhost:5000${item.proof_photo_path}`} 
                        alt="Bukti" 
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    ) : (
                      <div className="foto-placeholder"></div>
                    )}
                  </td>
                  <td>{item.Item?.name || 'Tanpa Nama'}</td>
                  <td className="loc-date">{item.Item?.location || '-'}</td>
                  <td>
                    <span className={`status-pill ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>Tidak ada data ditemukan.</td></tr>
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
          <div className="modal-actions">
            <button className="btn-batal" onClick={onClose}>Batal</button>
            <button 
              className="btn-verifikasi" 
              disabled={selectedItems.length === 0}
              onClick={handleBulkVerify}
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