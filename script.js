console.log("Script utama jalan...");

// === Format angka ribuan saat diketik ===
document.querySelectorAll(".format-rupiah").forEach((input) => {
  input.addEventListener("input", function () {
    let angka = this.value.replace(/[^0-9]/g, "");
    this.value = formatAngka(angka);
  });
});

function formatAngka(angka) {
  return angka.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// === Ambil nilai asli untuk perhitungan ===
function getAngka(id) {
  const val = document.getElementById(id).value;
  return parseFloat(val.replace(/\./g, "")) || 0;
}

// === Hitung Cicilan ===
function pembulatanRibuan(nilai) {
  return Math.floor(nilai / 1000) * 1000;
}

function hitungCicilan() {
  const harga = getAngka("hargaBarang");
  const lama = parseInt(document.getElementById("lamaCicilan").value);
  const dp = getAngka("dp");
  const hasil = document.getElementById("hasilCicilan");

  if (isNaN(harga) || isNaN(lama)) {
    hasil.innerHTML = "Harap isi Harga dan Lama Cicilan.";
    return;
  }

  if (lama > 12) {
    hasil.innerHTML = "<h2>Maaf, lebih 12 bulan hubungi Admin.</h2>";
    return;
  }

  const hargaSetelahDP = harga - dp;
  const faktor = lama <= 6 ? 1.15 : 1 + lama * 0.025;
  const hargaJualSementara = hargaSetelahDP * faktor;
  const cicilanAwal = hargaJualSementara / lama;
  const cicilanFinal = pembulatanRibuan(cicilanAwal);
  const hargaJualFinal = cicilanFinal * lama;

  const tanggalSekarang = new Date();
  tanggalSekarang.setMonth(tanggalSekarang.getMonth() + (lama + 1));
  const opsiTanggal = { month: "long", year: "numeric" };
  const batasAkhir = tanggalSekarang.toLocaleDateString("id-ID", opsiTanggal);

  hasil.innerHTML = `
    <p><b>Harga Jual:</b> Rp ${hargaJualFinal.toLocaleString("id-ID")}</p>
    <p><b>Cicilan Bulanan:</b> Rp ${cicilanFinal.toLocaleString("id-ID")}</p>
    <p><b>Batas Akhir Cicilan:</b> ${batasAkhir}</p>
  `;
}

// === Cek Data Konsumen (Simulasi) ===
async function cekData() {
  const kode = document.getElementById("kode").value.trim();
  const errorDiv = document.getElementById("error");
  const hasilDiv = document.getElementById("hasil");
  const spinnerOverlay = document.getElementById("spinnerOverlay");
  const loadingTimer = document.getElementById("loadingTimer");

  // Reset UI
  errorDiv.textContent = "";
  hasilDiv.style.display = "none";
  loadingTimer.style.display = "none";

  // Validasi input
  if (kode.length !== 8 || isNaN(kode)) {
    errorDiv.textContent = "Kode harus 8 digit angka.";
    return;
  }

  // Tampilkan spinner + timer (pakai class active kalau CSS-mu pakai .active)
  spinnerOverlay.classList.add("active");
  loadingTimer.style.display = "block";
  loadingTimer.textContent = "Loading...";

  const startTime = performance.now();

  try {
    // === GANTI URL jika perlu. Ini URL Apps Script yang kamu pakai sebelumnya ===
    const url = `https://script.google.com/macros/s/AKfycbz5VJRylw-dvset6w_JhzVkgUZ1zW5viLtJTKDS7hPSgHuRDBu3vYxqBEHu4cqebfxu/exec?kode=${encodeURIComponent(kode)}`;

    console.log("Request URL:", url);

    const response = await fetch(url, { cache: "no-store" }); // no-store buat ngehindari cache aneh saat debug

    // cek response HTTP dulu
    if (!response.ok) {
      // HTTP error (404, 500, dll)
      const endTimeErr = ((performance.now() - startTime) / 1000).toFixed(2);
      loadingTimer.textContent = `Gagal (HTTP ${response.status}) setelah ${endTimeErr}s`;
      errorDiv.textContent = `Server mengembalikan status ${response.status}. Cek console → Network.`;
      console.error("HTTP error:", response.status, await response.text());
      return;
    }

    // parse JSON
    const result = await response.json();
    console.log("Response JSON:", result);

    const endTime = performance.now();
    const seconds = ((endTime - startTime) / 1000).toFixed(2);

    // struktur yang kamu kirim sebelumnya: { status: "success", data: { ... } }
    if (!result) {
      loadingTimer.textContent = `Gagal memuat data setelah ${seconds}s`;
      errorDiv.textContent = "Response kosong.";
      return;
    }

    if (result.status !== "success" || !result.data) {
      loadingTimer.textContent = `Selesai (${seconds}s)`;
      // Jika ada pesan error spesifik dari API, tampilkan
      const msg = result.message || "Data tidak ditemukan / format respon tidak sesuai.";
      errorDiv.textContent = msg;
      console.warn("API returned non-success:", result);
      return;
    }

    // ambil objek konsumen
    const konsumen = result.data;

    // tampilkan waktu muat sesaat sebelum render
    loadingTimer.textContent = `Loaded dalam ${seconds} detik`;

    // Panggil fungsi render yang sudah kamu punya (tampilkanData)
    try {
      tampilkanData(konsumen);
    } catch (renderErr) {
      console.error("Error saat render data:", renderErr);
      errorDiv.textContent = "Gagal menampilkan data (cek console).";
      return;
    }

    // tunjukkan hasil
    hasilDiv.style.display = "block";

    // Hilangkan timer otomatis setelah 3 detik agar UI rapi
    setTimeout(() => {
      loadingTimer.style.display = "none";
    }, 3000);

  } catch (err) {
    console.error("Fetch error:", err);
    loadingTimer.textContent = "Gagal memuat data!";
    errorDiv.textContent = "Terjadi masalah jaringan atau server. Cek console / network.";
  } finally {
    // pastikan spinner selalu disembunyikan
    spinnerOverlay.classList.remove("active");
  }
}


function showError(message) {
  const errorDiv = document.getElementById("error");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}

function tampilkanData(data) {
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const toNumber = (val) => {
    if (!val) return 0;
    return Number(val.toString().replace(/[^0-9]/g, ""));
  };

  const cekStatus = (harga, totalBayar) => {
    const hargaNum = toNumber(harga);
    const totalBayarNum = toNumber(totalBayar);
    const isLunas = totalBayarNum >= hargaNum;

    return `<div style="
    font-size: 1.4em;
    font-weight: bold;
    text-transform: uppercase;
    color: ${isLunas ? "green" : "red"};
  ">
    ${isLunas ? "LUNAS" : "BELUM LUNAS"}
  </div>`;
  };

  const hitungCicilanTerakhirBulan = (tanggalMulai, lamaBulan) => {
    if (!tanggalMulai || !lamaBulan) return "-";
    const parts = tanggalMulai.split("/");
    if (parts.length !== 3) return "-";
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const mulaiDate = new Date(year, month, 1);
    mulaiDate.setMonth(mulaiDate.getMonth() + parseInt(lamaBulan, 10));
    const options = { month: "long", year: "numeric" };
    return mulaiDate.toLocaleDateString("id-ID", options);
  };

  const harga = toNumber(data.harga);
  const cicilanPerBulan = toNumber(data.cicilanPerBulan);
  const totalBayar = toNumber(data.totalBayar);
  const sisaBayar = harga - totalBayar;

  document.getElementById("detailKonsumen").innerHTML = `
    <p><strong>Kode:</strong> ${data.kode || "-"}</p>
    <p><strong>Nama:</strong> ${data.nama || "-"}</p>
    <p><strong>Barang:</strong> ${data.barang || "-"}</p>
    <p><strong>Harga:</strong> ${harga ? formatRupiah(harga) : "-"}</p>
    <p><strong>Cicilan per Bulan:</strong> ${
      cicilanPerBulan ? formatRupiah(cicilanPerBulan) : "-"
    }</p>
    <p><strong>Lama Cicilan:</strong> ${data.lamaBulan || "-"} bulan</p>
    <p><strong>Cicilan Terakhir:</strong> ${hitungCicilanTerakhirBulan(
      data.tanggalMulai,
      data.lamaBulan
    )}</p>
    <p><strong>Status:</strong> ${cekStatus(harga, totalBayar)}</p>
    <p><strong>Total Dibayar:</strong> ${
      totalBayar ? formatRupiah(totalBayar) : "-"
    }</p>
    <p><strong>Sisa Pembayaran:</strong> ${
      sisaBayar ? formatRupiah(sisaBayar) : "-"
    }</p>
  `;

  const riwayatDiv = document.getElementById("riwayatCicilan");
  if (data.cicilan && data.cicilan.length > 0) {
    riwayatDiv.innerHTML = data.cicilan
      .map((cicilan, index) => {
        const nominal = toNumber(cicilan.nominal);
        return `
        <div class="cicilan-item" style="
          border: 1px solid #ccc;
          border-radius: 6px;
          padding: 10px;
          margin-bottom: 10px;
          background: #f9f9f9;
        ">
          <p><strong>Cicilan ke-${index + 1}</strong></p>
          <p><strong>Tanggal:</strong> ${cicilan.tanggal || "-"}</p>
          <p><strong>Nominal:</strong> ${
            nominal ? formatRupiah(nominal) : "-"
          }</p>
        </div>
      `;
      })
      .join("");
  } else {
    riwayatDiv.innerHTML = "<p>Belum ada riwayat pembayaran</p>";
  }

  document.getElementById("hasil").style.display = "block";
}

// === Floating Menu Toggle ===
function toggleMenu() {
  const menu = document.getElementById("floating-links");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}
function sembunyikanMenu() {
  const menu = document.getElementById("floating-links");
  menu.style.display = "none";
}

// === Panel Konten Dinamis ===
function bukaPanel(file) {
  fetch(file)
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("isiPanel").innerHTML = html;
      document.getElementById("panelKonten").style.display = "block";
      aktifkanAccordion(); // 🔥 aktifkan interaksi setelah konten dimuat
    })
    .catch((err) => {
      document.getElementById("isiPanel").innerHTML =
        "<p>Gagal memuat konten.</p>";
      document.getElementById("panelKonten").style.display = "block";
    });
}

function tutupPanel() {
  document.getElementById("panelKonten").style.display = "none";
  document.getElementById("isiPanel").innerHTML = "";
}

function aktifkanAccordion() {
  document.querySelectorAll("#isiPanel .accordion-header").forEach((header) => {
    header.addEventListener("click", () => {
      const parent = header.parentElement;
      parent.classList.toggle("active");
    });
  });
}
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  clients.claim();
});
