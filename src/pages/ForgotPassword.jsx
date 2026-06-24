import "../styles/forgotpassword.css"; // Menggunakan css yang sama karena strukturnya mirip
import bg from "../assets/ith_bg.jpg";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import api from "../utils/axiosConfig";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Email wajib diisi');
      return;
    }

    try {
      // Sesuaikan URL endpoint ini dengan backend Express Anda nanti
      const response = await api.post('/api/forgot-password', { email });
      
      if (response.status === 200) {
        setMessage('Link instruksi reset password telah dikirim ke email Anda.');
      }
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || 'Email tidak terdaftar atau server error.');
    }
  };

  return (
    <div className="login-container">
      {/* Sisi Kiri (Sama dengan Halaman Login) */}
      <div className="left">
        <h1>
          Portal Lost & Found <br />
          Kampus ITH
        </h1>
        <p>Silakan masukkan email Anda untuk memulihkan kata sandi.</p>
      </div>

      {/* Sisi Kanan (Form Card) */}
      <div
        className="right"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="overlay">
          {/* Menggunakan class login-card agar desain card-nya sama persis */}
          <form className="login-card" onSubmit={handleResetSubmit}>
            <img src={logo} alt="logo" className="logo" />
            <h2>Lupa Password</h2>
            <p style={{ fontSize: '13px', color: '#555', marginBottom: '15px' }}>
              Masukkan email yang terdaftar pada akun Anda
            </p>

            <label>Alamat Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@gmail.com"
            />

            {error && (
              <div className="register-error-message" style={{ marginTop: '10px' }}>
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
              </div>
            )}

            {message && (
              <div style={{ color: 'green', fontSize: '13px', marginTop: '10px', textAlign: 'left' }}>
                ✅ {message}
              </div>
            )}

            <button type="submit" className="login-btn">
              KIRIM LINK RESET
            </button>

            <p className="register-text">
              Kembali ke{" "}
              <span onClick={() => navigate("/login")}>
                Halaman Login
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;