import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageUsers.css';
import logo from '../../assets/logo.png';

const ManageUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([
    { id: 'U001', name: 'Reval', nim: '231011999', access: 'Mahasiswa', status: 'Aktif' },
    { id: 'U002', name: 'Davira Elvina', nim: '9823589237999', access: 'Staff', status: 'Aktif' },
    { id: 'U003', name: 'Riska Haniriadi', nim: '231011087', access: 'Mahasiswa', status: 'Nonaktif' },
    { id: 'U004', name: 'Budi Prasetyo', nim: '2983593289893', access: 'Dosen', status: 'Aktif' },
    { id: 'U005', name: 'Husnul Khatimah', nim: '231011096', access: 'Mahasiswa', status: 'Aktif' },
  ]);

  // --- STATE MODAL EDIT ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  // --- STATE MODAL HAPUS ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // Untuk box "Yakin ingin menghapus?"

  // ================= FUNGSI EDIT =================
  const handleEditClick = (user) => {
    setEditFormData(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditFormData(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setUsers(users.map((u) => (u.id === editFormData.id ? editFormData : u)));
    handleCloseEditModal();
  };

  // ================= FUNGSI HAPUS =================
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirmation(false); // Reset konfirmasi lapis kedua
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
    setShowDeleteConfirmation(false);
  };

  const handleTriggerConfirmation = () => {
    setShowDeleteConfirmation(true);
  };

  const executeDelete = () => {
    setUsers(users.filter(u => u.id !== userToDelete.id));
    handleCloseDeleteModal();
  };

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
          <img src={logo} alt="Logo Findora" className="mu-logo-img" />
          <div className="logo-text"><h2>FINDORA</h2><span>Lost & Found</span></div>
        </div>
        
        <div className="mu-nav-right">
          <div className="mu-avatar-circle">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <span className="admin-name">Admin</span>
        </div>
      </header>

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
              <div className="mu-stat-number">{users.length}</div>
            </div>

            <div className="mu-stat-card mu-card-details">
              <div className="mu-stat-detail">
                <span className="mu-text-orange">Total Mahasiswa</span>
                <div className="mu-stat-number mu-text-orange">{users.filter(u => u.access === 'Mahasiswa').length}</div>
              </div>
              <div className="mu-divider"></div>
              <div className="mu-stat-detail">
                <span className="mu-text-blue">Total Dosen</span>
                <div className="mu-stat-number mu-text-blue">{users.filter(u => u.access === 'Dosen').length}</div>
              </div>
              <div className="mu-divider"></div>
              <div className="mu-stat-detail">
                <span className="mu-text-red">Total Staff</span>
                <div className="mu-stat-number mu-text-red">{users.filter(u => u.access === 'Staff').length}</div>
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
                <input type="text" placeholder="Search" />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#5A3929" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <button className="btn-add-user">
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
                  <th>NIM/NIP</th>
                  <th>Hak Akses <span className="sort-icon">⇅</span></th>
                  <th>Status <span className="sort-icon">⇅</span></th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.id}</strong></td>
                    <td>{u.name}</td>
                    <td>{u.nim}</td>
                    <td><span className={`mu-badge mu-access-${u.access.toLowerCase()}`}>{u.access}</span></td>
                    <td><span className={`mu-badge mu-status-${u.status.toLowerCase()}`}>{u.status}</span></td>
                    <td className="mu-actions">
                      <button className="mu-icon-btn mu-edit" onClick={() => handleEditClick(u)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button className="mu-icon-btn mu-delete" onClick={() => handleDeleteClick(u)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mu-pagination">
            <button className="mu-page-btn">◀</button>
            <button className="mu-page-btn active">1</button>
            <button className="mu-page-btn">2</button>
            <button className="mu-page-btn">▶</button>
          </div>
        </div>
      </main>

      {/* ================= MODAL EDIT ================= */}
      {isEditModalOpen && editFormData && (
        <div className="mu-modal-overlay">
          <div className="mu-modal-content">
            <div className="mu-modal-header">
              <h3>Edit Pengguna</h3>
              <button className="mu-close-btn" onClick={handleCloseEditModal}>&times;</button>
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
                <label>NIM/NIP</label>
                <input type="text" name="nim" value={editFormData.nim} onChange={handleEditInputChange} required />
              </div>
              <div className="mu-form-group">
                <label>Hak Akses</label>
                <select name="access" value={editFormData.access} onChange={handleEditInputChange}>
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="Staff">Staff</option>
                  <option value="Dosen">Dosen</option>
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
                <button type="button" className="btn-cancel" onClick={handleCloseEditModal}>Batal</button>
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
              <button className="mu-close-btn" onClick={handleCloseDeleteModal}>&times;</button>
            </div>

            <div className="mu-delete-body">
              <div className="mu-warning-icon-wrapper">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L22 20H2L12 2Z" fill="#C0392B"/>
                  <path d="M11 10H13V15H11V10ZM11 17H13V19H11V17Z" fill="white"/>
                </svg>
              </div>
              
              <h2 className="mu-delete-title">Hapus Pengguna {userToDelete.name}?</h2>

              {/* Tampilan Konfirmasi Lapis Kedua (Menimpa detail pengguna) */}
              {showDeleteConfirmation ? (
                <div className="mu-inner-confirm-box">
                  <div className="mu-inner-icon">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" fill="#E67E22"/>
                      <path d="M11 7H13V13H11V7ZM11 15H13V17H11V15Z" fill="white"/>
                    </svg>
                  </div>
                  <p>Yakin ingin menghapus pengguna?</p>
                  <div className="mu-inner-actions">
                    <button className="btn-cancel-green" onClick={() => setShowDeleteConfirmation(false)}>Batalkan</button>
                    <button className="btn-confirm-red" onClick={executeDelete}>Ya</button>
                  </div>
                </div>
              ) : (
                /* Tampilan Detail Pengguna (Awal) */
                <>
                  <div className="mu-delete-info-list">
                    <div className="mu-info-row">
                      <span className="mu-info-label">Nama Lengkap:</span>
                      <span className="mu-info-value">{userToDelete.name}</span>
                    </div>
                    <div className="mu-info-row">
                      <span className="mu-info-label">NIM/NIP:</span>
                      <span className="mu-info-value">{userToDelete.nim}</span>
                    </div>
                    <div className="mu-info-row">
                      <span className="mu-info-label">Email:</span>
                      <span className="mu-info-value">{userToDelete.name.split(' ')[0].toLowerCase()}@gmail.com</span>
                    </div>
                  </div>
                  <p className="mu-warning-text-red">Peringatan: Tindakan ini tidak dapat dipulihkan.</p>
                </>
              )}

              <div className="mu-access-info">
                <span>Hak Akses Sistem:</span>
                <p>[Pelapor, Penemu]</p>
              </div>
            </div>

            <div className="mu-delete-footer">
              <button 
                className="btn-delete-trigger" 
                onClick={handleTriggerConfirmation}
                disabled={showDeleteConfirmation} 
                style={{ opacity: showDeleteConfirmation ? 0.5 : 1 }}
              >
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