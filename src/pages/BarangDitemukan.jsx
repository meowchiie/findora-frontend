import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/report.css";
import { Camera } from "lucide-react";

function BarangDitemukan() {
  const navigate = useNavigate();

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // State Gambar dan File Aktual untuk Database
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null); 
  
  // State Profile Pengguna
  const [profileName, setProfileName] = useState("User");
  const [profileImage, setProfileImage] = useState(null);

  // Ambil data profile dari localStorage saat komponen dimuat
  useEffect(() => {
    const name = localStorage.getItem("profileName");
    const image = localStorage.getItem("profileImage");
    if (name) setProfileName(name);
    if (image) setProfileImage(image);
  }, []);

  const [form, setForm] = useState({
    nama: "",
    deskripsi: "",
    kategori: "",
    lokasi: "",
    tanggal: "",
    waktu: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    }); 
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5 MB");
      return;
    }

    setImageFile(file); // Simpan file aslinya untuk dikirim ke backend
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Foto barang wajib diunggah!");
      return;
    }
    setShowConfirm(true);
  };

  // ==========================================================
  // FUNGSI UNTUK MENYIMPAN DATA KE DATABASE BACKEND
  // ==========================================================
  const handleYes = async () => {
    setShowConfirm(false);

    try {
      const userId = localStorage.getItem("userId") || "1"; // Ambil ID User yang login

      // Gunakan FormData untuk mengirim text + file binary gambar
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("name", form.nama);
      formData.append("description", form.deskripsi);
      formData.append("category", form.kategori);
      formData.append("location", form.lokasi);
      formData.append("found_date", form.tanggal);
      formData.append("found_time", form.waktu);
      formData.append("photo", imageFile); // 'photo' disesuaikan dengan destinasi multer di backend

      const response = await fetch("http://localhost:5000/api/found-items", {
        method: "POST",
        body: formData, // Jangan pasang header Content-Type jika memakai FormData (browser mengaturnya otomatis)
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Laporan berhasil disimpan ke DB:", result);
        setShowSuccess(true);
      } else {
        const errorData = await response.json();
        alert(`Gagal menyimpan laporan: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Terjadi kesalahan jaringan saat menghubungi backend:", error);
      alert("Gagal terhubung ke server. Pastikan backend Anda menyala.");
    }
  };

  return (
    <div className="report-app">
      <div className="report-topbar">

        <div className="report-left-header">
          <button
            className="report-back"
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            ←
          </button>

          <img
            src={logo}
            alt="Findora"
            className="report-logo"
          />
        </div>

        {/* PROFILE CLICKABLE */}
        <div
          className="report-profile"
          onClick={() => navigate("/profile")}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
        >
          {profileImage ? (
            <img 
              src={profileImage} 
              alt="Profile" 
              className="report-avatar" 
              style={{ width: "35px", height: "35px", borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div className="report-avatar" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "35px", height: "35px", borderRadius: "50%", backgroundColor: "#e0e0e0", fontWeight: "bold" }}>
              {profileName.charAt(0).toUpperCase()}
            </div>
          )}
          <span>{profileName}</span>
        </div>

      </div>

      <div className="report-main">
        <h1 className="report-title">Laporkan Barang Ditemukan</h1>

        <form
          className="report-form-card"
          onSubmit={handleSubmit}
        >
          <p className="report-info-text">
            Lengkapi formulir dibawah ini dengan detail yang akurat.
            Berikan deskripsi umum untuk keamanan klaim
          </p>

          <div className="report-form-grid">

            {/* LEFT */}
            <div className="report-left-form">

              <label>Nama Barang</label>
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                placeholder="Dompet"
                required
              />

              <label>Deskripsi Umum Barang</label>
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                placeholder="warna hitam, bahan kulit kasar"
                required
              />

              <label>Kategori Barang</label>
              <select
                name="kategori"
                value={form.kategori}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Pilih
                </option>
                <option value="Dompet">Dompet & sejenisnya</option>
                <option value="Elektronik">Elektronik</option>
                <option value="Dokumen">Dokumen</option>
                <option value="Aksesoris">Aksesoris</option>
                <option value="Kunci">Kunci</option>
                <option value="Lainnya">Lainnya</option>
              </select>

              <label>Lokasi Penemuan</label>
              <input
                type="text"
                name="lokasi"
                value={form.lokasi}
                onChange={handleChange}
                placeholder="lab 203 kampus 1"
                required
              />

            </div>

            {/* RIGHT */}
            <div className="report-right-form">

              <label>Foto Barang (wajib)</label>

              <div className="report-upload-box">

                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview barang"
                    className="report-preview-img"
                  />
                ) : (
                  <>
                    <div className="report-camera" style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                      <Camera size={32} color="#888" />
                    </div>
                    <p>
                      Unggah gambar atau drag <br />
                      dan drop disini (Maks. 5 MB)
                    </p>
                  </>
                )}

                <label className="report-upload-btn">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="report-file-input"
                    onChange={handleUpload}
                  />
                </label>

              </div>

              <p className="report-warning-text">
                ⚠ Hanya unggah gambar yang jelas tapi tidak
                menampilkan detail unik spesifik
                (misal: nomor seri, isi dompet.)
              </p>

              <div className="report-date-row">

                <div>
                  <label>Tanggal Ditemukan</label>
                  <input
                    type="date"
                    name="tanggal"
                    value={form.tanggal}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label>Waktu Ditemukan</label>
                  <input
                    type="time"
                    name="waktu"
                    value={form.waktu}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              <button
                className="report-submit-btn report-found-btn"
                type="submit"
              >
                Kirim Laporan
              </button>

            </div>

          </div>
        </form>
      </div>

      {/* CONFIRM MODAL */}
      {showConfirm && (
        <div className="report-modal-bg">
          <div className="report-modal report-confirm-box">
            <div className="report-warning-icon">!</div>
            <p>Yakin ingin mengirim Laporan?</p>
            <div className="report-modal-buttons">
              <button
                type="button"
                className="report-cancel-btn"
                onClick={() => setShowConfirm(false)}
              >
                Batalkan
              </button>
              <button
                type="button"
                className="report-yes-btn"
                onClick={handleYes}
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="report-modal-bg">
          <div className="report-modal report-success-box">
            <div className="report-success-icon">✓</div>
            <p>Laporan berhasil terkirim</p>
            <button
              type="button" 
              className="report-close-btn"
              onClick={() => navigate("/dashboard")}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BarangDitemukan;