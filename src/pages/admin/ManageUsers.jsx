import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig'; 
import './ManageUsers.css';
import logo from '../../assets/logo.png';

const ManageUsers = () => {
  const navigate = useNavigate();

  // --- STATE CORE DATA ---
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalMahasiswa: 0, totalDosen: 0, totalStaff: 0 });
  const [loading, setLoading] = useState(false);
  
  // --- STATE PAGINATION & SEARCH ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const limitPerPage = 5;

  // --- STATE MODAL TAMBAH ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '', email: '', nim: '', role: 'Mahasiswa', password: '', status: 'Aktif'
  });

  // --- STATE MODAL EDIT ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  // --- STATE MODAL HAPUS ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // ================= FETCH DATA FROM API =================
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/users', {
        params: {
          page: currentPage,
          limit: limitPerPage,
          search: searchQuery
        }
      });
      if (response.data.success) {
        setUsers(response.data.users);
        setStats(response.data.stats);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery]);

  // ================= FUNGSI TAMBAH =================
  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddFormData({ ...addFormData, [name]: value });
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/users', addFormData);
      if (response.data.success) {
        alert(response.data.message);
        setIsAddModalOpen(false);
        setAddFormData({ name: '', email: '', nim: '', role: 'Mahasiswa', password: '', status: 'Aktif' });
        fetchUsers(); // Refresh data
      }
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menambah pengguna");
    }
  };

  // ================= FUNGSI EDIT =================
  const handleEditClick = (user) => {
    setEditFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      nim: user.nim,
      role: user.role,
      status: user.status || 'Aktif'
    });
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/api/users/${editFormData.id}`, editFormData);
      if (response.data.success) {
        alert(response.data.message);
        setIsEditModalOpen(false);
        setEditFormData(null);
        fetchUsers();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Gagal memperbarui pengguna");
    }
  };

  // ================= FUNGSI HAPUS =================
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirmation(false);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    try {
      const response = await api.delete(`/api/users/${userToDelete.id}`);
      if (response.data.success) {
        alert(response.data.message);
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        fetchUsers();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menghapus pengguna");
    }
  };

  return (
    <div className="admin-layout">

      {/* --- KONTEN UTAMA --- */}
      <main className="main-content">
        <h1 className="page-title">Kelola Pengguna Kampus</h1>

        <div className="mu-top-actions">
          <div className="mu-stats-container">
            <div className="mu-stat-card mu-card-total">
              <div className="mu-stat-title">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#d35400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Total Pengguna Terdaftar
              </div>
              <div className="mu-stat-number">{stats.totalUsers}</div>
            </div>

            <div className="mu-stat-card mu-card-details">
              <div className="mu-stat-detail">
                <span className="mu-text-orange">Total Mahasiswa</span>
                <div className="mu-stat-number mu-text-orange">{stats.totalMahasiswa}</div>
              </div>
              <div className="mu-divider"></div>
              <div className="mu-stat-detail">
                <span className="mu-text-blue">Total Dosen</span>
                <div className="mu-stat-number mu-text-blue">{stats.totalDosen}</div>
              </div>
              <div className="mu-divider"></div>
              <div className="mu-stat-detail">
                <span className="mu-text-red">Total Staff</span>
                <div className="mu-stat-number mu-text-red">{stats.totalStaff}</div>
              </div>
            </div>
          </div>
        </div>

        {/* --- TABEL CONTAINER --- */}
        <div className="mu-table-container">
          <div className="mu-table-header">
            <div className="th-left">
              <h3>DAFTAR PENGGUNA</h3>
            </div>
            
            <div className="th-right-actions">
              <div className="mu-search-box">
                <input 
                  type="text" 
                  placeholder="Cari nama atau NIM..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#5A3929" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              {/* PEMBETULAN AKSI KLIK TAMBAH PENGGUNA */}
              <button className="btn-add-user" onClick={() => setIsAddModalOpen(true)}>
                <span>+</span> Tambah Pengguna Baru
              </button>
            </div>
          </div>
          
          <div className="table-responsive">
            <table className="mu-users-table">
              <thead>
                <tr>
                  <th>ID Pengguna</th>
                  <th>Nama Lengkap</th>
                  <th>Email</th>
                  <th>NIM/NIP</th>
                  <th>Hak Akses</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{textAlign:'center', padding:'20px'}}>Memuat data sistem...</td></tr>
                ) : users.length > 0 ? users.map((u) => (
                  <tr key={u.id}>
                    <td><strong>#{u.id}</strong></td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.nim}</td>
                    <td><span className={`mu-badge mu-access-${u.role.toLowerCase()}`}>{u.role}</span></td>
                    <td><span className={`mu-badge mu-status-${(u.status || 'Aktif').toLowerCase()}`}>{u.status || 'Aktif'}</span></td>
                    <td className="mu-actions">
                      <button className="mu-icon-btn mu-edit" onClick={() => handleEditClick(u)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button className="mu-icon-btn mu-delete" onClick={() => handleDeleteClick(u)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" style={{textAlign:'center', padding:'20px'}}>Tidak ada data pengguna ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* SINKRONISASI NAVIGASI HALAMAN SERVER */}
          <div className="mu-pagination">
            <button className="mu-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>◀</button>
            <span style={{padding: '0 15px', fontWeight: 'bold'}}>{currentPage} dari {totalPages}</span>
            <button className="mu-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>▶</button>
          </div>
        </div>
      </main>

      {/* ================= MODAL TAMBAH BARU (PERBAIKAN UTAMA) ================= */}
      {isAddModalOpen && (
        <div className="mu-modal-overlay">
          <div className="mu-modal-content">
            <div className="mu-modal-header">
              <h3>Tambah Pengguna Baru</h3>
              <button className="mu-close-btn" onClick={() => setIsAddModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveAdd}>
              <div className="mu-form-group">
                <label>Nama Lengkap</label>
                <input type="text" name="name" value={addFormData.name} onChange={handleAddInputChange} required />
              </div>
              <div className="mu-form-group">
                <label>Email Resmi</label>
                <input type="email" name="email" value={addFormData.email} onChange={handleAddInputChange} required />
              </div>
              <div className="mu-form-group">
                <label>NIM / NIP</label>
                <input type="text" name="nim" value={addFormData.nim} onChange={handleAddInputChange} required />
              </div>
              <div className="mu-form-group">
                <label>Kata Sandi Akun</label>
                <input type="password" name="password" value={addFormData.password} onChange={handleAddInputChange} required placeholder="Minimal 6 karakter" />
              </div>
              <div className="mu-form-group">
                <label>Hak Akses Sistem</label>
                <select name="role" value={addFormData.role} onChange={handleAddInputChange}>
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="Staff">Staff</option>
                  <option value="Dosen">Dosen</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="mu-form-group">
                <label>Status Sistem</label>
                <select name="status" value={addFormData.status} onChange={handleAddInputChange}>
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
              <div className="mu-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsAddModalOpen(false)}>Batal</button>
                <button type="submit" className="btn-save" style={{backgroundColor: '#27ae60'}}>Simpan User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL EDIT ================= */}
      {isEditModalOpen && editFormData && (
        <div className="mu-modal-overlay">
          <div className="mu-modal-content">
            <div className="mu-modal-header">
              <h3>Edit Pengguna</h3>
              <button className="mu-close-btn" onClick={() => setIsEditModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="mu-form-group">
                <label>ID Pengguna</label>
                <input type="text" name="id" value={editFormData.id} disabled />
              </div>
              <div className="mu-form-group">
                <label>Nama Lengkap</label>
                <input type="text" name="name" value={editFormData.name} onChange={handleEditInputChange} required />
              </div>
              <div className="mu-form-group">
                <label>Email Resmi</label>
                <input type="email" name="email" value={editFormData.email} onChange={handleEditInputChange} required />
              </div>
              <div className="mu-form-group">
                <label>NIM / NIP</label>
                <input type="text" name="nim" value={editFormData.nim} onChange={handleEditInputChange} required />
              </div>
              <div className="mu-form-group">
                <label>Hak Akses</label>
                <select name="role" value={editFormData.role} onChange={handleEditInputChange}>
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="Staff">Staff</option>
                  <option value="Dosen">Dosen</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="mu-form-group">
                <label>Status</label>
                <select name="status" value={editFormData.status} onChange={handleEditInputChange}>
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
              <div className="mu-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>Batal</button>
                <button type="submit" className="btn-save">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL HAPUS ================= */}
      {isDeleteModalOpen && userToDelete && (
        <div className="mu-modal-overlay">
          <div className="mu-delete-modal">
            <div className="mu-delete-header">
              <h4>Konfirmasi Hapus Pengguna</h4>
              <button className="mu-close-btn" onClick={() => setIsDeleteModalOpen(false)}>&times;</button>
            </div>
            <div className="mu-delete-body">
              <div className="mu-warning-icon-wrapper">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L22 20H2L12 2Z" fill="#C0392B"/>
                  <path d="M11 10H13V15H11V10ZM11 17H13V19H11V17Z" fill="white"/>
                </svg>
              </div>
              <h2 className="mu-delete-title">Hapus Pengguna {userToDelete.name}?</h2>
              {showDeleteConfirmation ? (
                <div className="mu-inner-confirm-box">
                  <p>Yakin ingin menghapus pengguna?</p>
                  <div className="mu-inner-actions">
                    <button className="btn-cancel-green" onClick={() => setShowDeleteConfirmation(false)}>Batalkan</button>
                    <button className="btn-confirm-red" onClick={executeDelete}>Ya</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mu-delete-info-list">
                    <div className="mu-info-row"><span className="mu-info-label">Nama Lengkap:</span><span className="mu-info-value">{userToDelete.name}</span></div>
                    <div className="mu-info-row"><span className="mu-info-label">NIM/NIP:</span><span className="mu-info-value">{userToDelete.nim}</span></div>
                    <div className="mu-info-row"><span className="mu-info-label">Email:</span><span className="mu-info-value">{userToDelete.email}</span></div>
                  </div>
                  <p className="mu-warning-text-red">Peringatan: Tindakan ini tidak dapat dipulihkan.</p>
                </>
              )}
            </div>
            <div className="mu-delete-footer">
              <button className="btn-delete-trigger" onClick={() => setShowDeleteConfirmation(true)} disabled={showDeleteConfirmation} style={{ opacity: showDeleteConfirmation ? 0.5 : 1 }}>
                Hapus Pengguna
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;