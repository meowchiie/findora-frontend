import "../styles/profile.css";
import logo from "../assets/logo.png";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// Import library react-easy-crop untuk fitur membesarkan/mengecilkan gambar
import Cropper from "react-easy-crop";
// Import ikon-ikon modern dari lucide-react
import { Eye, EyeOff, Pencil, CheckCircle2, Camera } from "lucide-react";

function ProfilePage() {
  const navigate = useNavigate();

  // Ambil ID User unik terlebih dahulu dari localStorage
  const userId = localStorage.getItem("userId") || "default";

  // State UI
  const [activeTab, setActiveTab] = useState("ditemukan");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); 
  const [isLoading, setIsLoading] = useState(false); 
  
  // Ambil foto profil utama dari database / local cache awal
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem(`profileImage_${userId}`) || null
  );

  // ==========================================
  // STATE FITUR CROP & ZOOM GAMBAR (BARU)
  // ==========================================
  const [imageSrc, setImageSrc] = useState(null); // Menyimpan source gambar asli sebelum di-crop
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempProfileImage, setTempProfileImage] = useState(null); // Menyimpan foto crop sementara (belum disave ke DB)

  // State untuk Nama di Header & Topbar
  const [displayName, setDisplayName] = useState(localStorage.getItem("profileName") || "User");

  // State Form Data Diri
  const [nama, setNama] = useState(localStorage.getItem("profileName") || "");
  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");
  const [nim, setNim] = useState(localStorage.getItem("userNim") || "");

  // State Akses Edit Input
  const [isEditingNama, setIsEditingNama] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingNim, setIsEditingNim] = useState(false);

  // State Manajemen Password
  const [oldPasswordInput, setOldPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // State baru untuk visibility mata password
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Fungsi helper untuk generate gambar hasil crop ke Base64
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL("image/jpeg");
  };

  // Handle ketika user memilih file gambar dari komputernya
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // VALIDASI UKURAN DI SINI (Maksimal 2 MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran foto profil terlalu besar! Maksimal beralokasi 2 MB.");
      e.target.value = null; // Reset input file
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setShowCropModal(true); // Tampilkan modal pembesar/pengecil gambar
    };
    reader.readAsDataURL(file);
    e.target.value = null; // Reset input file agar file yang sama bisa dipilih ulang
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Menyimpan hasil manipulasi gambar ke state sementara (belum dikirim ke server)
  const handleSaveCrop = async () => {
    try {
      const croppedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      setTempProfileImage(croppedImageBase64); // Hanya disimpan ke variabel penampung sementara
      setShowCropModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Simpan Perubahan ke Database (Disini aksi permanen dieksekusi)
  const handleSaveChanges = async (e) => {
    e.preventDefault();

    if (isChangingPassword || newPasswordInput.trim() !== "") {
      const actualOldPassword = localStorage.getItem("userPassword");

      if (oldPasswordInput !== actualOldPassword) {
        alert("Password lama yang Anda masukkan salah!");
        return;
      }

      if (newPasswordInput.trim() === "") {
        alert("Password baru tidak boleh kosong!");
        return;
      }
    }

    setIsLoading(true);

    // Tentukan foto mana yang dikirim. Pakai tempProfileImage jika ada perubahan, jika tidak pakai profileImage yang lama.
    const finalPhotoToSave = tempProfileImage !== null ? tempProfileImage : profileImage;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://127.0.0.1:5000/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          id: userId,        
          nama: nama,
          email: email,      
          nim: nim,          
          fotoProfil: finalPhotoToSave, 
          passwordBaru: newPasswordInput.trim() !== "" ? newPasswordInput : undefined
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal memperbarui data ke server.");
      }

      if (newPasswordInput.trim() !== "") {
        localStorage.setItem("userPassword", newPasswordInput);
        setOldPasswordInput("");
        setNewPasswordInput("");
        setIsChangingPassword(false);
        // Reset state mata kembali tersembunyi
        setShowOldPassword(false);
        setShowNewPassword(false);
      }

      // Komit perubahan dari data sementara menjadi data permanen
      if (tempProfileImage !== null) {
        setProfileImage(tempProfileImage);
        localStorage.setItem(`profileImage_${userId}`, tempProfileImage);
        localStorage.setItem("profileImage", tempProfileImage); // Menyelaraskan dengan Dashboard
        setTempProfileImage(null); // Reset penampung data sementara
      }

      localStorage.setItem("profileName", nama);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userNim", nim);

      setDisplayName(nama);
      setIsEditingNama(false);
      setIsEditingEmail(false);
      setIsEditingNim(false);
      setShowSuccessPopup(true);

    } catch (error) {
      console.error("Database Update Error:", error);
      alert(`Gagal menyimpan ke database: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Data Dummy untuk Laporan
  const lostReports = [
    { id: "004", name: "Dompet Hitam", status: "Hilang", date: "02 Maret 2026" },
  ];

  const foundReports = [
    { id: "001", name: "Kunci Motor Honda", status: "KLAIM BERHASIL", date: "28 Maret 2026" },
    { id: "002", name: "Tumbler", status: "DIAMANKAN", date: "31 Maret 2026" },
  ];

  const reports = activeTab === "hilang" ? lostReports : foundReports;

  const inputContainerStyle = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    marginBottom: "15px"
  };

  const inputStyle = (isEditing) => ({
    width: "100%",
    paddingRight: "40px", 
    marginBottom: "0px",
    backgroundColor: isEditing ? "#fff" : "#f5f5f5", 
    border: isEditing ? "1px solid #007bff" : "1px solid #ccc",
    color: isEditing ? "#000" : "#666"
  });

  const iconStyle = {
    position: "absolute",
    right: "12px",
    cursor: "pointer", 
    userSelect: "none"
  };

  // Penentuan preview gambar di halaman utama profil saat ini
  const activeAvatarPreview = tempProfileImage !== null ? tempProfileImage : profileImage;

  return (
    <div className="profile-page">
      {/* TOPBAR */}
      <div className="profile-topbar">
        <div className="topbar-left" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
          <span className="back-arrow">←</span>
          <img src={logo} alt="Findora Logo" />
        </div>
        <div className="topbar-user" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {activeAvatarPreview ? (
            <img 
              src={activeAvatarPreview} 
              alt="Mini Profile" 
              style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }} 
            />
          ) : (
            <span className="mini-user" style={{ fontSize: "18px" }}>👤</span>
          )}
          <span>{displayName}</span>
        </div>
      </div>

      <h1 className="profile-title">Profil Saya - {displayName}</h1>

      <div className="profile-layout">
        {/* KARTU PROFIL (FORM) */}
        <form className="profile-card" onSubmit={handleSaveChanges}>
          <div className="big-avatar">
            {activeAvatarPreview ? (
              <img src={activeAvatarPreview} alt="Foto Profil" className="avatar-img" />
            ) : (
              <span>👤</span>
            )}
          </div>

          <label 
            className="photo-btn" 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "8px", 
              cursor: "pointer",
              margin: "10px auto 20px auto", // Membuat tombol otomatis ke tengah
              width: "max-content" // Memastikan lebar tombol pas dengan isinya
            }}
          >
            <Camera size={16} /> Sunting Foto
            <input type="file" accept="image/*" className="photo-input" onChange={handlePhotoChange} />
          </label>

          {/* INPUT NAMA LENGKAP */}
          <label>Nama Lengkap</label>
          <div style={inputContainerStyle}>
            <input 
              type="text" 
              value={nama} 
              onChange={(e) => setNama(e.target.value)} 
              required 
              disabled={!isEditingNama} 
              style={inputStyle(isEditingNama)} 
            />
            <span 
              style={{ ...iconStyle, display: "flex", alignItems: "center" }} 
              onClick={() => setIsEditingNama(!isEditingNama)}
              title={isEditingNama ? "Kunci Input" : "Edit Nama"}
            >
              {isEditingNama ? <CheckCircle2 color="#28a745" size={18} /> : <Pencil color="#007bff" size={16} />}
            </span>
          </div>

          {/* INPUT EMAIL */}
          <label>Email</label>
          <div style={inputContainerStyle}>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              disabled={!isEditingEmail} 
              style={inputStyle(isEditingEmail)} 
            />
            <span 
              style={{ ...iconStyle, display: "flex", alignItems: "center" }} 
              onClick={() => setIsEditingEmail(!isEditingEmail)}
              title={isEditingEmail ? "Kunci Input" : "Edit Email"}
            >
              {isEditingEmail ? <CheckCircle2 color="#28a745" size={18} /> : <Pencil color="#007bff" size={16} />}
            </span>
          </div>

          {/* INPUT NIM/NIP */}
          <label>NIM/NIP</label>
          <div style={inputContainerStyle}>
            <input 
              type="text" 
              value={nim} 
              onChange={(e) => setNim(e.target.value)} 
              required 
              disabled={!isEditingNim} 
              style={inputStyle(isEditingNim)} 
            />
            <span 
              style={{ ...iconStyle, display: "flex", alignItems: "center" }} 
              onClick={() => setIsEditingNim(!isEditingNim)}
              title={isEditingNim ? "Kunci Input" : "Edit NIM/NIP"}
            >
              {isEditingNim ? <CheckCircle2 color="#28a745" size={18} /> : <Pencil color="#007bff" size={16} />}
            </span>
          </div>

          {/* BAGIAN PASSWORD */}
          <div className="password-section" style={{ marginTop: "15px", borderTop: "1px solid #eee", paddingTop: "10px" }}>
            {!isChangingPassword ? (
              <button 
                type="button" 
                className="change-pw-toggle-btn"
                onClick={() => setIsChangingPassword(true)}
                style={{ background: "none", color: "#007bff", border: "none", cursor: "pointer", padding: 0, fontWeight: "500" }}
              >
                🔒 Ubah Password?
              </button>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                  <label style={{ fontWeight: "bold", color: "#d9534f", margin: 0 }}>Mengubah Password</label>
                  <button 
                    type="button" 
                    onClick={() => { setIsChangingPassword(false); setOldPasswordInput(""); setNewPasswordInput(""); }}
                    style={{ background: "none", border: "none", color: "#999", cursor: "pointer" }}
                  >
                    Batal
                  </button>
                </div>
                
                <label>Password Lama</label>
                <div style={inputContainerStyle}>
                  <input 
                    type={showOldPassword ? "text" : "password"} 
                    placeholder="Masukkan password saat ini"
                    value={oldPasswordInput} 
                    onChange={(e) => setOldPasswordInput(e.target.value)} 
                    required
                    style={inputStyle(true)}
                  />
                  <span 
                    style={{ ...iconStyle, display: "flex", alignItems: "center", color: "#666" }} 
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    title={showOldPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                  >
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>

                <label>Password Baru</label>
                <div style={inputContainerStyle}>
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    placeholder="Masukkan password baru"
                    value={newPasswordInput} 
                    onChange={(e) => setNewPasswordInput(e.target.value)} 
                    required
                    style={inputStyle(true)}
                  />
                  <span 
                    style={{ ...iconStyle, display: "flex", alignItems: "center", color: "#666" }} 
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    title={showNewPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* AKSI TOMBOL */}
          <div className="profile-actions" style={{ marginTop: "20px" }}>
            <button className="save-btn" type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan"}
            </button>

            <button className="logout-btn" type="button" onClick={() => setShowLogoutConfirm(true)}>
              Keluar
            </button>
          </div>
        </form>

        {/* AKTIVITAS SAYA */}
        <div className="activity-card">
          <h2>Aktivitas Saya</h2>
          <div className="tabs">
            <button className={activeTab === "hilang" ? "active" : ""} type="button" onClick={() => setActiveTab("hilang")}>
              Laporan Hilang
            </button>
            <button className={activeTab === "ditemukan" ? "active" : ""} type="button" onClick={() => setActiveTab("ditemukan")}>
              Laporan Ditemukan
            </button>
          </div>

          {reports.map((item) => (
            <div className="report-box" key={item.id}>
              <div>
                <h3>Laporan #{item.id}:</h3>
                <p>{item.name}</p>
                <p>Status: <span className={item.status === "KLAIM BERHASIL" ? "status claim" : item.status === "DIAMANKAN" ? "status secured" : "status lost"}>{item.status}</span></p>
                <p>Tanggal: {item.date}</p>
              </div>
              <button className="detail-btn" type="button">Lihat Detail</button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL POP-UP UNTUK MEMBESARKAN / MENGECILKAN FOTO PROFIL (CROPPER) */}
      {showCropModal && (
        <div className="profile-modal-bg" style={{ zIndex: 1000 }}>
          <div className="logout-modal" style={{ maxWidth: "450px", width: "90%", padding: "20px" }}>
            <h3>Atur Foto Profil</h3>
            <p style={{ fontSize: "12px", color: "#666" }}>Geser gambar dan gunakan slider di bawah untuk memperbesar/memperkecil.</p>
            
            {/* Container Box untuk area Cropper */}
            <div style={{ position: "relative", width: "100%", height: "250px", backgroundColor: "#333", borderRadius: "8px", overflow: "hidden", marginTop: "10px" }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} 
                cropShape="round" 
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Slider Pengontrol Zoom */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "15px 0" }}>
              <span style={{ fontSize: "12px" }}>➖</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{ flex: 1, cursor: "pointer" }}
              />
              <span style={{ fontSize: "12px" }}>➕</span>
            </div>

            {/* Tombol aksi potong gambar */}
            <div className="modal-actions" style={{ justifyContent: "flex-end", gap: "10px" }}>
              <button 
                className="cancel-modal" 
                type="button" 
                onClick={() => { setShowCropModal(false); setImageSrc(null); }}
                style={{ padding: "8px 15px", fontSize: "14px" }}
              >
                Batal
              </button>
              <button 
                className="yes-modal" 
                type="button" 
                onClick={handleSaveCrop}
                style={{ backgroundColor: "#007bff", padding: "8px 15px", fontSize: "14px" }}
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP CUSTOM: BERHASIL SIMPAN DATA */}
      {showSuccessPopup && (
        <div className="profile-modal-bg">
          <div className="logout-modal" style={{ borderTop: "5px solid #28a745" }}>
            <div className="warning-circle" style={{ backgroundColor: "#e8f5e9", color: "#28a745", borderColor: "#28a745" }}>✓</div>
            <h3 style={{ marginTop: "10px", color: "#333" }}>Berhasil!</h3>
            <p>Data diri Anda telah berhasil diperbarui ke server dan disimpan.</p>
            <div className="modal-actions" style={{ justifyContent: "center", marginTop: "15px" }}>
              <button 
                className="yes-modal" 
                type="button" 
                onClick={() => setShowSuccessPopup(false)}
                style={{ backgroundColor: "#28a745", minWidth: "100px" }}
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LOGOUT */}
      {showLogoutConfirm && (
        <div className="profile-modal-bg">
          <div className="logout-modal">
            <div className="warning-circle">!</div>
            <p>Apakah anda yakin ingin Log out?</p>
            <div className="modal-actions">
              <button className="cancel-modal" type="button" onClick={() => setShowLogoutConfirm(false)}>Batalkan</button>
              <button className="yes-modal" type="button" onClick={() => navigate("/login")}>Ya</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;