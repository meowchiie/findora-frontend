import { useParams, useNavigate } from "react-router-dom";

function DetailBarang() {
  const { id } = useParams();
  const navigate = useNavigate();

  // sementara dummy data
  const barang = {
    id,
    nama: "Dompet Hitam",
    kategori: "Aksesoris",
    lokasi: "Kantin Kampus",
    tanggal: "19 Mei 2026",
    deskripsi: "Dompet hitam berisi kartu mahasiswa",
    gambar:
      "https://via.placeholder.com/400x250",
  };

  return (
    <div className="container">
      <div className="detail-card">
        <img src={barang.gambar} alt={barang.nama} />

        <h1>{barang.nama}</h1>

        <p>
          <strong>Kategori:</strong> {barang.kategori}
        </p>

        <p>
          <strong>Lokasi:</strong> {barang.lokasi}
        </p>

        <p>
          <strong>Tanggal:</strong> {barang.tanggal}
        </p>

        <p>
          <strong>Deskripsi:</strong> {barang.deskripsi}
        </p>

        <button onClick={() => navigate(`/klaim/${barang.id}`)}>
          Klaim Barang
        </button>
      </div>
    </div>
  );
}

export default DetailBarang;