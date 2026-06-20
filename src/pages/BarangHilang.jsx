import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/report.css";
import { Camera } from "lucide-react";

import api from "../utils/axiosConfig"; 

function BarangHilang() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [profileName, setProfileName] = useState("User");
  const [profileImage, setProfileImage] = useState(null);
  const [userId, setUserId] = useState(""); 
  
  // 1. TAMBAHKAN STATE BARU UNTUK KATEGORI
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    nama: "",
    deskripsi: "",
    kategori: "", 
    lokasi: "",
    tanggal: "",
    waktu: "",
    email: "",
  });

  useEffect(() => {
    // Ambil data user dari local storage
    const name = localStorage.getItem("profileName");
    const image = localStorage.getItem("profileImage");
    const id = localStorage.getItem("userId") || "1"; 
    
    if (name) setProfileName(name);
    if (image) setProfileImage(image);
    if (id) setUserId(id);
    
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setForm((prev) => ({ ...prev, email: savedEmail }));
    }

    // 2. FUNGSI UNTUK MENGAMBIL DATA KATEGORI DARI BACKEND
    const fetchCategories = async () => {
      try {
        const response = await api.get("/api/categories");
        // Sesuaikan dengan struktur response dari Controller kamu
        // Asumsi struktur standarnya: { success: true, data: [...] }
        if (response.data && response.data.data) {
          setCategories(response.data.data);
        } else if (Array.isArray(response.data)) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Gagal memuat kategori:", error);
      }
    };

    fetchCategories(); // Jalankan fungsi saat komponen pertama kali dimuat
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
      
      formData.append("user_id", parseInt(userId)); 
      formData.append("category_id", parseInt(form.kategori)); 
      formData.append("type", "hilang"); 
      formData.append("name", form.nama);
      formData.append("description", form.deskripsi);
      formData.append("location", form.lokasi);
      formData.append("lost_date", form.tanggal);
      formData.append("lost_time", form.waktu);
      formData.append("contact", form.email);

      if (selectedFile) {
        formData.append("photo_path", selectedFile);
      }

      const response = await api.post("/api/items", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = response.data;

      // SINKRONISASI KE LOCALSTORAGE (DASHBOARD)
      let imageBase64 = null;
      if (selectedFile) {
        try {
          imageBase64 = await convertFileToBase64(selectedFile);
        } catch (err) {
          console.error("Gagal mengonversi gambar ke base64:", err);
        }
      }

      const existingReports = JSON.parse(localStorage.getItem("allReports") || "[]");

      const newReportItem = {
        id: result.data?.id || Date.now(),
        type: "hilang",
        name: form.nama,
        image: imageBase64, 
        status: "Menunggu", 
        // Mengubah ID kembali menjadi Nama Kategori untuk tampilan di Dashboard
        category: categories.find(c => c.id === parseInt(form.kategori))?.name || "Lainnya", 
        description: form.deskripsi,
        location: form.lokasi,
        date: form.tanggal, 
        time: form.waktu,
        contact: form.email,
      };

      existingReports.push(newReportItem);
      localStorage.setItem("allReports", JSON.stringify(existingReports));

      setShowSuccess(true);
      
    } catch (error) {
      console.error("Error submitting report:", error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        alert(`Error Validasi: ${error.response.data.errors[0].message}`);
      } else if (error.response && error.response.data) {
        alert(error.response.data.message || "Gagal mengirimkan laporan.");
      } else {
        alert("Terjadi kesalahan koneksi ke server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-app">
      <div className="report-topbar">
        <div className="report-left-header">
          <button className="report-back" type="button" onClick={() => navigate("/dashboard")}>←</button>
          <img src={logo} alt="Findora" className="report-logo" />
        </div>

        <div className="report-profile" onClick={() => navigate("/profile")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="report-avatar" style={{ width: "35px", height: "35px", borderRadius: "50%", objectFit: "cover" }} />
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
              <input type="text" name="nama" value={form.nama} onChange={handleChange} placeholder="Dompet" required />

              <label>Deskripsi Detail Barang</label>
              <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} placeholder="warna hitam polos, didalamnya ada KTP" required />

              <label>Kategori Barang</label>
              {/* 3. MAPPING DATA KATEGORI KE DALAM OPTION DROPDOWN */}
              <select
                name="kategori"
                value={form.kategori}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <label>Lokasi Terakhir Terlihat</label>
              <input type="text" name="lokasi" value={form.lokasi} onChange={handleChange} placeholder="lab 203 kampus 1" required />

              <button className="report-submit-btn" type="submit" disabled={loading}>
                {loading ? "Mengirim..." : "Kirim Laporan"}
              </button>
            </div>

            <div className="report-right-form">
              <label>Foto Barang (opsional, sangat disarankan)</label>

              <div className="report-upload-box">
                {previewImage ? (
                  <img src={previewImage} alt="Preview barang" className="report-preview-img" />
                ) : (
                  <>
                    <div className="report-camera" style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                      <Camera size={32} color="#888" />
                    </div>
                    <p>Unggah gambar atau drag <br /> dan drop disini (Maks. 5 MB)</p>
                  </>
                )}

                <label className="report-upload-btn">
                  Upload
                  <input type="file" accept="image/*" className="report-file-input" onChange={handleUpload} />
                </label>
              </div>

              <div className="report-date-row">
                <div>
                  <label>Tanggal Kehilangan</label>
                  <input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} required />
                </div>
                <div>
                  <label>Waktu Kehilangan</label>
                  <input type="time" name="waktu" value={form.waktu} onChange={handleChange} required />
                </div>
              </div>

              <label>Informasi Kontak Anda (Nama, Email)</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="revalno@gmail.com" required />
            </div>
          </div>
        </form>
      </div>

      {showConfirm && (
        <div className="report-modal-bg">
          <div className="report-modal report-confirm-box">
            <div className="report-warning-icon">!</div>
            <p>Yakin ingin mengirim Laporan?</p>
            <div className="report-modal-buttons">
              <button type="button" className="report-cancel-btn" onClick={() => setShowConfirm(false)} disabled={loading}>Batalkan</button>
              <button type="button" className="report-yes-btn" onClick={handleYes} disabled={loading}>Ya</button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="report-modal-bg">
          <div className="report-modal report-success-box">
            <div className="report-success-icon">✓</div>
            <p>Laporan berhasil terkirim</p>
            <button type="button" className="report-close-btn" onClick={() => navigate("/dashboard")}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BarangHilang;