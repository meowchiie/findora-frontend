import "../styles/profile.css";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import { Eye, EyeOff, Pencil, CheckCircle2, Camera } from "lucide-react";
import api from "../utils/axiosConfig";

// 1. SUB-KOMPONEN UNTUK INPUT FIELD (Mencegah Duplikasi JSX & Style)
function ProfileInputField({ label, name, value, isEditing, onChange, onToggleEdit, type = "text" }) {
  return (
    <>
      <label>{label}</label>
      <div style={{ position: "relative", display: "flex", alignItems: "center", marginBottom: "15px" }}>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required
          disabled={!isEditing}
          style={{
            width: "100%",
            paddingRight: "40px",
            marginBottom: "0px",
            backgroundColor: isEditing ? "#fff" : "#f5f5f5",
            border: isEditing ? "1px solid #007bff" : "1px solid #ccc",
            color: isEditing ? "#000" : "#666"
          }}
        />
        <span 
          style={{ position: "absolute", right: "12px", cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center" }} 
          onClick={onToggleEdit}
        >
          {isEditing ? <CheckCircle2 color="#28a745" size={18} /> : <Pencil color="#007bff" size={16} />}
        </span>
      </div>
    </>
  );
}

function ProfilePage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") || "default";

  // --- REFACTOR STATE FORM (Digabung menjadi Objek) ---
  const [formData, setFormData] = useState({
    nama: localStorage.getItem("profileName") || "",
    email: localStorage.getItem("userEmail") || "",
    nim: localStorage.getItem("userNim") || ""
  });
  
  const [editStates, setEditStates] = useState({ nama: false, email: false, nim: false });
  const [displayName, setDisplayName] = useState(localStorage.getItem("profileName") || "User");

  // State UI & Password
  const [activeTab, setActiveTab] = useState("hilang");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State Gambar
  const [profileImage, setProfileImage] = useState(localStorage.getItem("profileImage") || null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  // State Password
  const [passwords, setPasswords] = useState({ old: "", new: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false });

  // State Laporan & Pop-up Detail
  const [userReports, setUserReports] = useState([]);
  const [isFetchingReports, setIsFetchingReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null); // State untuk modal detail barang
  const [zoomedImage, setZoomedImage] = useState(null);       // State jika gambar detail di-klik zoom

  // Handle Perubahan Input Form Dinamis
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- EFFECT: FETCH DATA LAPORAN ---
  useEffect(() => {
    const fetchUserReports = async () => {
      if (!userId || userId === "default") return;
      setIsFetchingReports(true);
      try {
        const response = await api.get("/api/items", {
          params: { user_id: userId, type: activeTab, limit: 20 }
        });
        const rawItems = response.data?.data || [];
        const formatted = rawItems.map((item) => ({
          id: item.id,
          name: item.name || "Tanpa Nama",
          status: item.status || (activeTab === "hilang" ? "HILANG" : "DITEMUKAN"),
          type: item.type || activeTab,
          date: item.lost_date 
            ? (item.lost_date.includes("T") ? item.lost_date.split("T")[0] : item.lost_date)
            : new Date(item.createdAt).toLocaleDateString("id-ID"),
          // Tambahan field pelengkap agar modal detail terisi dengan benar:
          image: item.photo_path ? `${import.meta.env.VITE_API_URL}/public/${item.photo_path}` : null,
          category: item.category || item.Category?.name || "Umum",
          description: item.description || "Tidak ada deskripsi",
          location: item.location || "Tidak diketahui",
          time: item.lost_time || "-",
          contact: item.contact || "-"
        }));
        setUserReports(formatted);
      } catch (error) {
        console.error("Gagal mengambil laporan milik user:", error);
      } finally {
        setIsFetchingReports(false);
      }
    };
    fetchUserReports();
  }, [activeTab, userId]);

  // --- FUNGSI IMAGE CROPPER ---
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
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return canvas.toDataURL("image/jpeg");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran foto profil terlalu besar! Maksimal beralokasi 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    try {
      const croppedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      setProfileImage(croppedImageBase64); 
      setShowCropModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const base64ToBlob = (base64Data) => {
    const byteCharacters = atob(base64Data.split(',')[1]);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: 'image/jpeg' });
  };

  // --- SAVE DATA TO API ---
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (isChangingPassword || passwords.new.trim() !== "") {
      const actualOldPassword = localStorage.getItem("userPassword");
      if (passwords.old !== actualOldPassword) {
        alert("Password lama yang Anda masukkan salah!");
        return;
      }
      if (passwords.new.trim() === "") {
        alert("Password baru tidak boleh kosong!");
        return;
      }
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("id", userId);
      formDataToSend.append("nama", formData.nama);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("nim", formData.nim);

      if (passwords.new.trim() !== "") {
        formDataToSend.append("passwordBaru", passwords.new);
      }

      if (profileImage && profileImage.startsWith("data:image")) {
        const imageBlob = base64ToBlob(profileImage);
        formDataToSend.append("fotoProfil", imageBlob, "profile.jpg");
      }

      const response = await api.put("/api/profile/update", formDataToSend);

      if (passwords.new.trim() !== "") {
        localStorage.setItem("userPassword", passwords.new);
        setPasswords({ old: "", new: "" });
        setIsChangingPassword(false);
      }

      const serverImagePath = response.data?.profile_picture || response.data?.data?.profile_picture;
      if (serverImagePath) {
        const fullImageUrl =  import.meta.env.VITE_API_URL + `/public${serverImagePath}`;
        setProfileImage(fullImageUrl); 
        localStorage.setItem(`profileImage_${userId}`, fullImageUrl);
        localStorage.setItem("profileImage", fullImageUrl);
      } else if (profileImage && profileImage.startsWith("data:image")) {
        localStorage.setItem("profileImage", profileImage);
      }

      localStorage.setItem("profileName", formData.nama);
      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("userNim", formData.nim);

      setDisplayName(formData.nama);
      setEditStates({ nama: false, email: false, nim: false });
      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Database Update Error:", error);
      alert(error.response?.data?.message || "Gagal terhubung ke server database.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear(); 
    setShowLogoutConfirm(false);
    navigate("/login");
  };

  return (
    <div className="profile-page">
      <h1 className="profile-title">Profil Saya - {displayName}</h1>

      <div className="profile-layout">
        <form className="profile-card" onSubmit={handleSaveChanges}>
          <div className="big-avatar">
            {profileImage ? <img src={profileImage} alt="Foto Profil" className="avatar-img" /> : <span>👤</span>}
          </div>

          <label className="photo-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", margin: "10px auto 20px auto", width: "max-content" }}>
            <Camera size={16} /> Sunting Foto
            <input type="file" accept="image/*" className="photo-input" onChange={handlePhotoChange} />
          </label>

          <ProfileInputField 
            label="Nama Lengkap" name="nama" value={formData.nama} 
            isEditing={editStates.nama} onChange={handleInputChange} 
            onToggleEdit={() => setEditStates(prev => ({ ...prev, nama: !prev.nama }))} 
          />
          <ProfileInputField 
            label="Email" name="email" value={formData.email} 
            isEditing={editStates.email} onChange={handleInputChange} type="email"
            onToggleEdit={() => setEditStates(prev => ({ ...prev, email: !prev.email }))} 
          />
          <ProfileInputField 
            label="NIM/NIP" name="nim" value={formData.nim} 
            isEditing={editStates.nim} onChange={handleInputChange} 
            onToggleEdit={() => setEditStates(prev => ({ ...prev, nim: !prev.nim }))} 
          />

          <div className="password-section" style={{ marginTop: "15px", borderTop: "1px solid #eee", paddingTop: "10px" }}>
            {!isChangingPassword ? (
              <button type="button" className="change-pw-toggle-btn" onClick={() => setIsChangingPassword(true)} style={{ background: "none", color: "#007bff", border: "none", cursor: "pointer", padding: 0, fontWeight: "500" }}>
                🔒 Ubah Password?
              </button>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                  <label style={{ fontWeight: "bold", color: "#d9534f", margin: 0 }}>Mengubah Password</label>
                  <button type="button" onClick={() => { setIsChangingPassword(false); setPasswords({ old: "", new: "" }); }} style={{ background: "none", border: "none", color: "#999", cursor: "pointer" }}>Batal</button>
                </div>
                
                <label>Password Lama</label>
                <div style={{ position: "relative", display: "flex", alignItems: "center", marginBottom: "15px" }}>
                  <input type={showPasswords.old ? "text" : "password"} placeholder="Masukkan password saat ini" value={passwords.old} onChange={(e) => setPasswords(prev => ({ ...prev, old: e.target.value }))} required style={{ width: "100%", paddingRight: "40px" }} />
                  <span style={{ position: "absolute", right: "12px", cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}>
                    {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>

                <label>Password Baru</label>
                <div style={{ position: "relative", display: "flex", alignItems: "center", marginBottom: "15px" }}>
                  <input type={showPasswords.new ? "text" : "password"} placeholder="Masukkan password baru" value={passwords.new} onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))} required style={{ width: "100%", paddingRight: "40px" }} />
                  <span style={{ position: "absolute", right: "12px", cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}>
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="profile-actions" style={{ marginTop: "20px" }}>
            <button className="save-btn" type="submit" disabled={isLoading}>{isLoading ? "Menyimpan..." : "Simpan"}</button>
            <button className="logout-btn" type="button" onClick={() => setShowLogoutConfirm(true)}>Keluar</button>
          </div>
        </form>

        {/* Aktivitas Saya */}
        <div className="activity-card">
          <h2>Aktivitas Saya</h2>
          <div className="tabs">
            <button className={activeTab === "hilang" ? "active" : ""} type="button" onClick={() => setActiveTab("hilang")}>Laporan Hilang</button>
            <button className={activeTab === "ditemukan" ? "active" : ""} type="button" onClick={() => setActiveTab("ditemukan")}>Laporan Ditemukan</button>
          </div>

          {isFetchingReports ? (
            <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>Memuat laporan...</p>
          ) : userReports.length > 0 ? (
            userReports.map((item) => (
              <div className="report-box" key={item.id}>
                <div>
                  <h3>Laporan #{item.id}:</h3>
                  <p>{item.name}</p>
                  <p>Status: <span className={`status ${item.status.toUpperCase() === "SELESAI" ? "claim" : "lost"}`}>{item.status}</span></p>
                  <p>Tanggal: {item.date}</p>
                </div>
                {/* DIUBAH: Mengganti navigasi halaman menjadi pemicu open modal detail */}
                <button className="detail-btn" type="button" onClick={() => setSelectedReport(item)}>Lihat Detail</button>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", padding: "30px 0", color: "#888" }}>Kamu belum membuat laporan barang {activeTab} apapun.</p>
          )}
        </div>
      </div>

      {/* ==================== POPUP/MODAL DETAIL BARANG ==================== */}
      {selectedReport && (
        <div className="detail-modal-bg" style={{ display: "flex", position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", zIndex: 999 }}>
          <div className="action-modal" style={{ position: "relative", backgroundColor: "#fff", padding: "20px", borderRadius: "8px", maxWidth: "500px", width: "90%", maxHeight: "95vh", overflowY: "auto" }}>
            <button className="close-detail" onClick={() => setSelectedReport(null)} style={{ position: "absolute", top: "10px", right: "15px", background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}>✕</button>
            
            <div className="detail-image" style={{ width: "100%", height: "200px", backgroundColor: "#f0f0f0", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "8px", overflow: "hidden", marginBottom: "15px" }}>
              {selectedReport.image ? (
                <img src={selectedReport.image} alt={selectedReport.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px", cursor: "zoom-in" }} onClick={() => setZoomedImage(selectedReport.image)} />
              ) : (
                <span style={{ fontSize: "48px" }}>📦</span>
              )}
            </div>
            
            <h2>{selectedReport.name}</h2>
            <div className={`detail-status ${selectedReport.type === 'hilang' ? 'status-blue' : 'status-green'}`}>
              {selectedReport.status}
            </div>
            
            <div className="detail-info" style={{ marginTop: "15px", textAlign: "left" }}>
              <p><strong>Kategori:</strong> {selectedReport.category}</p>
              <p><strong>Deskripsi:</strong> {selectedReport.description}</p>
              <p><strong>Lokasi:</strong> {selectedReport.location}</p>
              <p><strong>Tanggal:</strong> {selectedReport.date}</p>
              <p><strong>Waktu:</strong> {selectedReport.time}</p>
              <p><strong>Kontak:</strong> {selectedReport.contact}</p>
            </div>
            {/* Tombol Klaim Berhasil Dihilangkan Sesuai Permintaan */}
          </div>
        </div>
      )}

      {/* ==================== POPUP ZOOM GAMBAR BARANG ==================== */}
      {zoomedImage && (
        <div className="profile-modal-bg" onClick={() => setZoomedImage(null)} style={{ zIndex: 1050, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ maxWidth: "90%", maxHeight: "90%" }}>
            <img src={zoomedImage} alt="Zoomed" style={{ width: "100%", height: "auto", maxHeight: "85vh", objectFit: "contain", borderRadius: "8px" }} />
          </div>
        </div>
      )}

      {/* MODAL CROPPER */}
      {showCropModal && (
        <div className="profile-modal-bg" style={{ zIndex: 1000 }}>
          <div className="logout-modal" style={{ maxWidth: "450px", width: "90%", padding: "20px" }}>
            <h3>Atur Foto Profil</h3>
            <div style={{ position: "relative", width: "100%", height: "250px", backgroundColor: "#333", borderRadius: "8px", overflow: "hidden", marginTop: "10px" }}>
              <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "15px 0" }}>
              <span>➖</span>
              <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} style={{ flex: 1, cursor: "pointer" }} />
              <span>➕</span>
            </div>
            <div className="modal-actions" style={{ justifyContent: "flex-end", gap: "10px" }}>
              <button className="cancel-modal" type="button" onClick={() => { setShowCropModal(false); setImageSrc(null); }}>Batal</button>
              <button className="yes-modal" type="button" onClick={handleSaveCrop} style={{ backgroundColor: "#007bff" }}>Terapkan</button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP SUKSES & LOGOUT */}
      {showSuccessPopup && (
        <div className="profile-modal-bg">
          <div className="logout-modal" style={{ borderTop: "5px solid #28a745" }}>
            <div className="warning-circle" style={{ backgroundColor: "#e8f5e9", color: "#28a745", borderColor: "#28a745" }}>✓</div>
            <h3 style={{ marginTop: "10px", color: "#333" }}>Berhasil!</h3>
            <p>Data diri Anda telah berhasil diperbarui.</p>
            <div className="modal-actions" style={{ justifyContent: "center", marginTop: "15px" }}>
              <button className="yes-modal" type="button" onClick={() => setShowSuccessPopup(false)} style={{ backgroundColor: "#28a745", minWidth: "100px" }}>Selesai</button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="profile-modal-bg">
          <div className="logout-modal">
            <div className="warning-circle">!</div>
            <p>Apakah anda yakin ingin Log out?</p>
            <div className="modal-actions">
              <button className="cancel-modal" type="button" onClick={() => setShowLogoutConfirm(false)}>Batalkan</button>
              <button className="yes-modal" type="button" onClick={handleLogout}>Ya</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;