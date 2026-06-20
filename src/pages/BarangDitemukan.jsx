import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/report.css";
import { Camera } from "lucide-react";

// Gunakan instance Axios yang sudah dibuat
import api from "../utils/axiosConfig";

function BarangDitemukan() {
  const navigate = useNavigate();

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); 
  
  const [profileName, setProfileName] = useState("User");
  const [profileImage, setProfileImage] = useState(null);
  const [userId, setUserId] = useState(""); 
  
  // State untuk menyimpan daftar kategori dari database
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    nama: "",
    deskripsi: "",
    kategori: "",
    lokasi: "",
    tanggal: "",
    waktu: "",
    email: "", // Ditambahkan karena validator mewajibkan field 'contact'
  });

  useEffect(() => {
    // Ambil info user dari localStorage
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

    // Ambil data kategori dari backend
    const fetchCategories = async () => {
      try {
        const response = await api.get("/api/categories");
        if (response.data && response.data.data) {
          setCategories(response.data.data);
        } else if (Array.isArray(response.data)) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Gagal memuat kategori:", error);
      }
    };

    fetchCategories();
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
    if (!selectedFile) {
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
    setLoading(true);

    try {
      const formData = new FormData();
      
      // Sesuaikan key dengan validator item di backend
      formData.append("user_id", parseInt(userId));
      formData.append("category_id", parseInt(form.kategori));
      formData.append("type", "ditemukan"); // Set tipe secara dinamis ke 'ditemukan'
      formData.append("name", form.nama);
      formData.append("description", form.deskripsi);
      formData.append("location", form.lokasi);
      
      // Note: Validator backend menggunakan 'lost_date' & 'lost_time' untuk kedua tipe
      formData.append("lost_date", form.tanggal); 
      formData.append("lost_time", form.waktu);
      formData.append("contact", form.email); 

      // Field gambar disesuaikan dengan multer (photo_path)
      if (selectedFile) {
        formData.append("photo_path", selectedFile);
      }

      // Kirim via Axios
      const response = await api.post("/api/items", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = response.data;

      // =================================================================
      // SINKRONISASI KE LOCALSTORAGE (DASHBOARD)
      // =================================================================
      let imageBase64 = null;
      if (selectedFile) {
        try {
          imageBase64 = await convertFileToBase64(selectedFile);
        } catch (err) {
          console.error("Gagal mengonversi base64:", err);
        }
      }

      const existingReports = JSON.parse(localStorage.getItem("allReports") || "[]");

      const newReportItem = {
        id: result.data?.id || Date.now(),
        type: "ditemukan",
        name: form.nama,
        image: imageBase64,
        status: "Ditemukan", // Set status default tampilan
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
      
      // Tangkap pesan error spesifik dari Express Validator
      if (error.response && error.response.data && error.response.data.errors) {
        alert(`Error Validasi: ${error.response.data.errors[0].message}`);
      } else if (error.response && error.response.data) {
        alert(error.response.data.message || "Gagal menyimpan laporan.");
      } else {
        alert("Gagal terhubung ke server. Pastikan backend Anda menyala.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-app">
      <div className="report-topbar">

        <div className="report-left-header">
          <button className="report-back" type="button" onClick={() => navigate("/dashboard")}>
            ←
          </button>
          <img src={logo} alt="Findora" className="report-logo" />
        </div>

        <div className="report-profile" onClick={() => navigate("/profile")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
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

        <form className="report-form-card" onSubmit={handleSubmit}>
          <p className="report-info-text">
            Lengkapi formulir dibawah ini dengan detail yang akurat.
            Berikan deskripsi umum untuk keamanan klaim.
          </p>

          <div className="report-form-grid">

            <div className="report-left-form">
              <label>Nama Barang</label>
              <input type="text" name="nama" value={form.nama} onChange={handleChange} placeholder="Dompet" required />

              <label>Deskripsi Umum Barang</label>
              <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} placeholder="warna hitam, bahan kulit kasar" required />

              <label>Kategori Barang</label>
              <select name="kategori" value={form.kategori} onChange={handleChange} required>
                <option value="" disabled>Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <label>Lokasi Penemuan</label>
              <input type="text" name="lokasi" value={form.lokasi} onChange={handleChange} placeholder="lab 203 kampus 1" required />
              
              {/* Posisi tombol menyesuaikan layout */}
              <button 
                className="report-submit-btn report-found-btn" 
                type="submit"
                disabled={loading}
              >
                {loading ? "Mengirim..." : "Kirim Laporan"}
              </button>
            </div>

            <div className="report-right-form">
              <label>Foto Barang (wajib)</label>

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

              <p className="report-warning-text">
                ⚠ Hanya unggah gambar yang jelas tapi tidak menampilkan detail unik spesifik (misal: nomor seri, isi dompet).
              </p>

              <div className="report-date-row">
                <div>
                  <label>Tanggal Ditemukan</label>
                  <input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} required />
                </div>
                <div>
                  <label>Waktu Ditemukan</label>
                  <input type="time" name="waktu" value={form.waktu} onChange={handleChange} required />
                </div>
              </div>

              {/* Tambahan Field Kontak karena diwajibkan oleh Validator Backend */}
              <label>Informasi Kontak Penemu (Nama/Email/No HP)</label>
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
              <button type="button" className="report-cancel-btn" onClick={() => setShowConfirm(false)} disabled={loading}>
                Batalkan
              </button>
              <button type="button" className="report-yes-btn" onClick={handleYes} disabled={loading}>
                Ya
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="report-modal-bg">
          <div className="report-modal report-success-box">
            <div className="report-success-icon">✓</div>
            <p>Laporan berhasil terkirim</p>
            <button type="button" className="report-close-btn" onClick={() => navigate("/dashboard")}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BarangDitemukan;