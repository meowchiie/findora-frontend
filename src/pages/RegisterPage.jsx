import "../styles/register.css";
import bg from "../assets/ith_bg.jpg";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    nim: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Tambahan state loading biar user tidak spam klik tombol

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Validasi field kosong
    if (!formData.name || !formData.email || !formData.role || !formData.nim || !formData.password || formData.role === "Pilih Peran") {
      setError("Semua field wajib diisi!");
      return;
    }

    // 2. Validasi minimal 8 karakter
    if (formData.password.length < 8) {
      setError("Kata sandi harus minimal 8 karakter!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch( import.meta.env.VITE_API_URL + '/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        name: formData.name, 
        email: formData.email,
        role: formData.role, 
        nim: formData.nim,
        password: formData.password
        })
      });
      
      const data = await response.json();

      if (response.ok) {
        alert("Registrasi Berhasil! Silakan Login.");
        navigate('/login');
      } else {
        // ================================================================
        // DISINI NOTIFIKASI ERROR DARI BACKEND DITAMPILKAN
        // (Misal: "Email sudah terdaftar!", "NIM/NIP sudah digunakan!")
        // ================================================================
        if (data.errors && data.errors.length > 0) {
        setError(data.errors[0].message); // Mengambil pesan error pertama dari backend
      } else {
        setError(data.message || 'Registrasi gagal. Silakan coba lagi.');
      }
    }
    } catch (err) {
      setError('Gagal terhubung ke server. Pastikan backend menyala.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="register-container">
      {/* LEFT (BG GAMBAR + FORM DI DALAM) */}
      <div className="register-left" style={{ backgroundImage: `url(${bg})` }}>
        <div className="register-overlay">
          <div className="register-card">
            <img src={logo} alt="logo" className="register-logo" />
            <h2>Daftar Akun</h2>

            <label>Name Lengkap</label>
            <input 
              type="text" 
              placeholder="Nama lengkap" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />

            <label>Email</label>
            <input 
              type="email" 
              placeholder="contoh@gmail.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />

            <label>Peran</label>
            <select 
              className="select" 
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option>Pilih Peran</option>
              <option>Mahasiswa</option>
              <option>Dosen</option>
              <option>Staff</option>
            </select>

            <label>NIM / NIP</label>
            <input 
              type="text" 
              placeholder="Masukkan NIM / NIP" 
              value={formData.nim}
              onChange={(e) => setFormData({...formData, nim: e.target.value})}
            />

            <label>Buat Kata Sandi</label>
            <div className="register-password-field">
              <input 
                type="password" 
                placeholder="Minimal 8 karakter" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {/* BOX NOTIFIKASI ERROR */}
            {error && (
              <div className="register-error-message">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
              </div>
            )}

            <button 
              className="register-btn" 
              onClick={handleSubmit} 
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "MEMPROSES..." : "DAFTAR"}
            </button>

            <p className="register-login-text">
              Sudah punya akun?{" "}
              <span onClick={() => navigate("/login")}>Masuk</span>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT (BG POLOS + TEKS) */}
      <div className="register-right">
        <div className="text-content">
          <h1>Selamat Datang di <br />Portal Lost & Found <br />Kampus ITH</h1>
          <p>Temukan barang berharga anda yang hilang dengan cepat dan aman</p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;