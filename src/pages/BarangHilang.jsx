import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/report.css";
import { Camera } from "lucide-react";
import api from "../utils/axiosConfig"; // Menggunakan instance Axios terpusat

function BarangHilang() {
  const navigate = useNavigate();
  
  // State Modal UI & Loader
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State File Gambar & Preview
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // State Identitas User ID (Diambil langsung dari localStorage)
  const [userId, setUserId] = useState(""); 
  
  // State untuk menyimpan daftar kategori dari database
  const [categories, setCategories] = useState([]);

  // State Form Isian Laporan
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
    // Ambil info dasar user dari local storage
    const id = localStorage.getItem("userId") || "1"; 
    setUserId(id);
    
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setForm((prev) => ({ ...prev, email: savedEmail }));
    }

    // Ambil daftar kategori secara dinamis dari backend
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
    setShowConfirm(true);
  };

  // Handler simpan data multipart ke backend
  // Handler simpan data multipart ke backend
  const handleYes = async () => {
    setShowConfirm(false);
    setLoading(true);

    try {
      const formData = new FormData();
      
      // Konstruksi payload sesuai skema Express Validator backend
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

      // --- PERBAIKAN DI SINI: Hapus logika convertFileToBase64 ---
      // Ambil path gambar yang disimpan di backend server (asumsi key-nya: photo_path)
      const serverImagePath = result.data?.photo_path || "";
      const fullImageUrl = serverImagePath ? import.meta.env.VITE_API_URL + `/public${serverImagePath}` : null;

      const existingReports = JSON.parse(localStorage.getItem("allReports") || "[]");

      const newReportItem = {
        id: result.data?.id || Date.now(),
        type: "hilang",
        name: form.nama,
        image: fullImageUrl, // SEKARANG BERISI URL STRING RINGAN, BUKAN BASE64 YANG BERAT!
        status: "Menunggu", 
        category: categories.find(c => c.id === parseInt(form.kategori))?.name || "Lainnya", 
        description: form.deskripsi,
        location: form.lokasi,
        date: form.tanggal, 
        time: form.waktu,
        contact: form.email,
      };

      existingReports.push(newReportItem);
      localStorage.setItem("allReports", JSON.stringify(existingReports));
      // -----------------------------------------------------------

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
      
      {/* HEADER DAN TOPBAR SEBELUMNYA DI SINI TELAH DIHAPUS PENUH KARENA SUDAH DIATUR LAYOUT UTAMA */}

      <div className="report-main">
        <h1>Laporkan Barang Hilang</h1>

        <form className="report-form-card" onSubmit={handleSubmit}>
          <p className="report-info-text">
            Lengkapi formulir dibawah ini dengan detail yang akurat untuk membantu kami mencari barang anda.
          </p>

          <div className="report-form-grid">
            
            {/* FORM KOLOM KIRI */}
            <div className="report-left-form">
              <label>Nama Barang</label>
              <input type="text" name="nama" value={form.nama} onChange={handleChange} placeholder="Dompet" required />

              <label>Deskripsi Detail Barang</label>
              <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} placeholder="warna hitam polos, didalamnya ada KTP" required />

              <label>Kategori Barang</label>
              <select name="kategori" value={form.kategori} onChange={handleChange} required>
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

            {/* FORM KOLOM KANAN */}
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

      {/* MODAL KONFIRMASI */}
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

      {/* MODAL BERHASIL */}
      {showSuccess && (
        <div className="report-modal-bg">
          <div className="report-modal report-success-box">
            <div className="report-success-icon">✓</div>
            <p>Laporan berhasil terkirim</p>
            <button type="button" className="report-close-btn" onClick={() => navigate("/")}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BarangHilang;