import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/report.css";
// Import ikon Camera dari lucide-react jika ingin seragam dengan profil
import { Camera } from "lucide-react";

function BarangHilang() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // State untuk menampung info profile pengguna yang sedang login
  const [profileName, setProfileName] = useState("User");
  const [profileImage, setProfileImage] = useState(null);

  const [form, setForm] = useState({
    nama: "",
    deskripsi: "",
    kategori: "",
    lokasi: "",
    tanggal: "",
    waktu: "",
    email: "",
  });

  // Mengambil data profile dari localStorage saat komponen dimuat
  useEffect(() => {
    const name = localStorage.getItem("profileName");
    const image = localStorage.getItem("profileImage");
    if (name) setProfileName(name);
    if (image) setProfileImage(image);
    
    // Auto-fill email dari user jika ada di localStorage
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setForm((prev) => ({ ...prev, email: savedEmail }));
    }
  }, []);

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

    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  // Helper untuk mengubah File Objek Gambar menjadi string Base64 agar aman disimpan di localStorage
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleYes = async () => {
    setShowConfirm(false);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.nama);
      formData.append("description", form.deskripsi);
      formData.append("category", form.kategori);
      formData.append("location", form.lokasi);
      formData.append("lost_date", form.tanggal);
      formData.append("lost_time", form.waktu);
      formData.append("contact", form.email);

      if (selectedFile) {
        formData.append("photo_path", selectedFile);
      }

      // 1. Kirim data ke backend database utama terlebih dahulu
      const response = await fetch("http://localhost:5000/api/lost-items", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        
        // =================================================================
        // PROSES PENYIMPANAN KE LOCALSTORAGE (UNTUK SINKRONISASI DASHBOARD)
        // =================================================================
        let imageBase64 = null;
        if (selectedFile) {
          try {
            imageBase64 = await convertFileToBase64(selectedFile);
          } catch (err) {
            console.error("Gagal mengonversi gambar ke base64:", err);
          }
        }

        // Ambil data laporan lama yang ada di localStorage
        const existingReports = JSON.parse(localStorage.getItem("allReports") || "[]");

        // Format data baru disamakan dengan struktur Dashboard
        const newReportItem = {
          id: result.id || Date.now(), // Gunakan ID dari backend jika ada, atau fallback timestamp
          type: "hilang",
          name: form.nama,
          image: imageBase64, // Format Base64 / data:image
          status: "Hilang",
          category: form.kategori,
          description: form.deskripsi,
          location: form.lokasi,
          date: form.tanggal, 
          time: form.waktu,
          contact: form.email,
        };

        // Tambahkan ke dalam array list laporan
        existingReports.push(newReportItem);

        // Tulis kembali ke localStorage dengan key "allReports"
        localStorage.setItem("allReports", JSON.stringify(existingReports));

        setShowSuccess(true);
      } else {
        alert(result.message || "Gagal mengirimkan laporan.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
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

          <img src={logo} alt="Findora" className="report-logo" />
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
        <h1>Laporkan Barang Hilang</h1>

        <form className="report-form-card" onSubmit={handleSubmit}>
          <p className="report-info-text">
            Lengkapi formulir dibawah ini dengan detail yang akurat untuk membantu kami mencari barang anda.
          </p>

          <div className="report-form-grid">
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

              <label>Deskripsi Detail Barang</label>
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                placeholder="warna hitam polos, didalamnya ada KTP"
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
                <option>Dompet</option>
                <option>Elektronik</option>
                <option>Kunci</option>
                <option>Buku</option>
                <option>Lainnya</option>
              </select>

              <label>Lokasi Terakhir Terlihat</label>
              <input
                type="text"
                name="lokasi"
                value={form.lokasi}
                onChange={handleChange}
                placeholder="lab 203 kampus 1"
                required
              />

              <button 
                className="report-submit-btn" 
                type="submit" 
                disabled={loading}
              >
                {loading ? "Mengirim..." : "Kirim Laporan"}
              </button>
            </div>

            <div className="report-right-form">
              <label>Foto Barang (opsional, sangat disarankan)</label>

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

              <div className="report-date-row">
                <div>
                  <label>Tanggal Kehilangan</label>
                  <input
                    type="date"
                    name="tanggal"
                    value={form.tanggal}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label>Waktu Kehilangan</label>
                  <input
                    type="time"
                    name="waktu"
                    value={form.waktu}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <label>Informasi Kontak Anda (Nama, Email)</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="revalno@gmail.com"
                required
              />
            </div>
          </div>
        </form>
      </div>

      {/* MODAL KONFIRMASI */}
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
                disabled={loading}
              >
                Batalkan
              </button>

              <button 
                type="button" 
                className="report-yes-btn" 
                onClick={handleYes}
                disabled={loading}
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUKSES */}
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

export default BarangHilang;