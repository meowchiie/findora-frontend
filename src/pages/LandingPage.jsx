import "../styles/landing.css";
import bg from "../assets/ith_bg.jpg";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      className="container"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="overlay">
        {/* Menggunakan class landing-card agar selaras dengan login-card */}
        <div className="landing-card">
          <div className="logo-container">
            <img src={logo} alt="Findora Logo" className="logo-img" />
          </div>

          <h1 className="title">
            Selamat Datang di Portal <br />
            Lost & Found Kampus ITH
          </h1>

          <p className="desc">
            Temukan barang berharga anda yang hilang dengan cepat dan aman
          </p>

          {/* Menambahkan class spesifik btn-orange untuk menghindari bug warna biru */}
          <button className="btn-orange" onClick={() => navigate("/login")}>
            Login
          </button>

          <button className="btn-orange secondary" onClick={() => navigate("/register")}>
            Registrasi
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;