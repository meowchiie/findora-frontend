import "../styles/login.css";
import bg from "../assets/ith_bg.jpg";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios"; 

function LoginPage() {
  const navigate = useNavigate();
  
  // Mengubah nama state dari 'email' menjadi 'identifier' agar mewakili Email atau NIM/NIP
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError('');

    if (!identifier) {
      setError('Email atau NIM/NIP wajib diisi');
      return;
    }
    
    // Validasi Fleksibel: Jika input mengandung huruf atau karakter selain angka dan tidak punya '@'
    // Kita asumsikan dia mencoba memasukkan email namun formatnya salah.
    // Jika isinya murni angka (NIM), lewati validasi '@' ini.
    const isMaybeEmail = isNaN(identifier); 
    if (isMaybeEmail && !identifier.includes('@')) {
      setError('Format email tidak valid');
      return;
    }

    if (!password) {
      setError('Password wajib diisi');
      return;
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    try {
      // Mengirim properti 'identifier' (bisa berisi email atau nim) ke backend Express
      const response = await axios.post('http://127.0.0.1:5000/api/login', {
        identifier, 
        password
      });

      const data = response.data;
      console.log(response.data);

      if (response.status === 200) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("profileName", data.user.nama);
          localStorage.setItem("userNim", data.user.nim);
          localStorage.setItem("userEmail", data.user.email);
          localStorage.setItem("userId", data.user.id);

          // Selaraskan key profileImage tanpa embel-embel ID agar terbaca di dashboard dan profil
          if (data.user.fotoProfil) {
            localStorage.setItem("profileImage", data.user.fotoProfil);
            localStorage.setItem(`profileImage_${data.user.id}`, data.user.fotoProfil);
          } else {
            localStorage.removeItem("profileImage");
            localStorage.removeItem(`profileImage_${data.user.id}`);
          }

          navigate("/dashboard");
      } else {
          setError(data.message || 'Email/NIM atau kata sandi salah.');
      }
    } catch (error) {
        console.error(error);
        setError(error.response?.data?.message || 'Gagal terhubung ke server. Pastikan backend menyala.');
    }
  };

  return (
    <div className="login-container">
      <div className="left">
        <h1>
          Selamat Datang di <br />
          Portal Lost & Found <br />
          Kampus ITH
        </h1>
        <p>Temukan barang berharga anda yang hilang dengan cepat dan aman</p>
      </div>

      <div
        className="right"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="overlay">
          <form className="login-card" onSubmit={handleSubmit}>

            <img src={logo} alt="logo" className="logo" />
            <h2>Masuk ke Akun Anda</h2>

            {/* Perubahan Label & Input Tipe Text agar leluasa menerima Email / NIM */}
            <label>Email atau NIM/NIP</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="contoh@gmail.com atau NIM Anda"
            />

            <label>Kata Sandi</label>
            <div className="password-field">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
              />
            </div>

            {error && (
              <div className="register-error-message">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
              </div>
            )}

            <button type="submit" className="login-btn">
              MASUK
            </button>

            <p className="register-text">
              Belum punya akun?{" "}
              <span onClick={() => navigate("/register")}>
                Daftar Sekarang
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;