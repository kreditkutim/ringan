// ======================
// Helper Functions
// ======================
function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

function toNumber(val) {
  if (!val) return 0;
  return Number(val.toString().replace(/[^0-9]/g, ""));
}

function pembulatanRibuan(nilai) {
  return Math.floor(nilai / 1000) * 1000;
}

// ======================
// Simulasi Cicilan
// ======================
function hitungCicilan() {
  const harga = parseFloat(document.getElementById("hargaBarang").value);
  const lama = parseInt(document.getElementById("lamaCicilan").value);
  const dp = parseFloat(document.getElementById("dp").value) || 0;
  const hasil = document.getElementById("hasilCicilan");

  if (isNaN(harga) || isNaN(lama)) {
    hasil.innerHTML = "Harap isi Harga dan Lama Cicilan.";
    return;
  }

  if (lama > 12) {
    hasil.innerHTML = "<b>Maaf, maksimal cicilan 12 bulan.</b>";
    return;
  }

  let faktor = lama <= 5 ? 1.1 : 1 + lama * 0.02;
  const hargaSetelahDP = harga - dp;
  const hargaJualSementara = hargaSetelahDP * faktor;
  const cicilanAwal = hargaJualSementara / lama;
  const cicilanFinal = pembulatanRibuan(cicilanAwal);
  const hargaJualFinal = cicilanFinal * lama;

  // Hitung batas akhir cicilan (lama + 1 bulan)
  const tanggalSekarang = new Date();
  tanggalSekarang.setMonth(tanggalSekarang.getMonth() + lama + 1);
  const opsiTanggal = { month: "long", year: "numeric" };
  const batasAkhir = tanggalSekarang.toLocaleDateString("id-ID", opsiTanggal);

  hasil.innerHTML = `
    <div class="hasil-box">
      <p><b>Harga Jual:</b> ${formatRupiah(hargaJualFinal)}</p>
      <p><b>Cicilan Bulanan:</b> ${formatRupiah(cicilanFinal)}</p>
      <p><b>Batas Akhir Cicilan:</b> ${batasAkhir}</p>
    </div>
  `;
}

// ======================
// Cek Data Konsumen
// ======================
async function cekData() {
  const kode = document.getElementById("kode").value.trim();
  const errorDiv = document.getElementById("error");
  const loadingDiv = document.getElementById("loading");
  const hasilDiv = document.getElementById("hasil");

  errorDiv.style.display = "none";
  hasilDiv.style.display = "none";
  loadingDiv.style.display = "block";

  if (!/^[A-Za-z0-9]{8}$/.test(kode)) {
    showError("Format kode harus 8 karakter huruf/angka");
    loadingDiv.style.display = "none";
    return;
  }

  try {
    const url = `https://script.google.com/macros/s/AKfycbz5VJRylw-dvset6w_JhzVkgUZ1zW5viLtJTKDS7hPSgHuRDBu3vYxqBEHu4cqebfxu/exec?kode=${kode}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Gagal mengambil data");
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    tampilkanData(data.data);
  } catch (error) {
    showError(error.message);
  } finally {
    loadingDiv.style.display = "none";
  }
}

function showError(message) {
  const errorDiv = document.getElementById("error");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}

function tampilkanData(data) {
  function cekStatus(harga, totalBayar) {
    const hargaNum = Number(harga);
    const totalBayarNum = Number(totalBayar);

    if (totalBayarNum >= hargaNum) {
      return '<span class="status-lunas">LUNAS</span>';
    } else {
      return '<span class="status-belum">BELUM LUNAS</span>';
    }
  }

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
      .map((cicilan) => {
        const nominal = toNumber(cicilan.nominal);
        return `
          <div class="cicilan-item">
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

function hitungCicilanTerakhirBulan(tanggalMulai, lamaBulan) {
  if (!tanggalMulai || !lamaBulan) return "-";

  const parts = tanggalMulai.split("/");
  if (parts.length !== 3) return "-";

  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  const mulaiDate = new Date(year, month, 1);
  mulaiDate.setMonth(mulaiDate.getMonth() + parseInt(lamaBulan, 10));

  const options = { month: "long", year: "numeric" };
  return mulaiDate.toLocaleDateString("id-ID", options);
}


  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("service-worker.js?v=2")
      .then(function (registration) {
        console.log("SW registered: ", registration);
      })
      .catch(function (registrationError) {
        console.log("SW registration failed: ", registrationError);
      });
  });
}
function toggleMenu() {
  const menu = document.getElementById("floating-links");
  menu.style.display = (menu.style.display === "flex") ? "none" : "flex";
}

