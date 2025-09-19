console.log("Script utama jalan...");

// === Hitung Cicilan ===
function hitungCicilan() {
  const hargaBarang = parseInt(document.getElementById("hargaBarang").value) || 0;
  const lamaCicilan = parseInt(document.getElementById("lamaCicilan").value) || 0;
  const dp = parseInt(document.getElementById("dp").value) || 0;

  if (hargaBarang <= 0 || lamaCicilan <= 0) {
    document.getElementById("hasilCicilan").innerHTML = "<p style='color:red'>Masukkan data dengan benar.</p>";
    return;
  }

  const sisa = hargaBarang - dp;
  const cicilan = sisa / lamaCicilan;

  document.getElementById("hasilCicilan").innerHTML =
    `<p>Total: Rp${sisa.toLocaleString()}<br>Cicilan per bulan: Rp${cicilan.toLocaleString()}</p>`;
}

// === Cek Data Konsumen ===
function cekData() {
  const kode = document.getElementById("kode").value.trim();
  const loading = document.getElementById("loading");
  const error = document.getElementById("error");
  const hasil = document.getElementById("hasil");

  if (!kode) {
    error.innerText = "Kode wajib diisi.";
    return;
  }

  loading.style.display = "block";
  error.innerText = "";
  hasil.style.display = "none";

  // Simulasi data
  setTimeout(() => {
    loading.style.display = "none";
    if (kode === "23011188") {
      hasil.style.display = "block";
      document.getElementById("detailKonsumen").innerText = "Nama: Budi - Barang: HP Samsung";
      document.getElementById("riwayatCicilan").innerText = "Sudah membayar 3x cicilan dari 10 bulan.";
    } else {
      error.innerText = "Data tidak ditemukan.";
    }
  }, 1000);
}

// === Floating Menu Toggle ===
function toggleMenu() {
  const menu = document.getElementById("floating-links");
  menu.style.display = (menu.style.display === "block") ? "none" : "block";
}
