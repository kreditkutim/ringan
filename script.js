console.log("Script utama jalan...");

// === Format angka ribuan saat diketik ===
document.querySelectorAll('.format-rupiah').forEach(input => {
  input.addEventListener('input', function () {
    let angka = this.value.replace(/[^0-9]/g, '');
    this.value = formatAngka(angka);
  });
});

function formatAngka(angka) {
  return angka.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// === Ambil nilai asli untuk perhitungan ===
function getAngka(id) {
  const val = document.getElementById(id).value;
  return parseFloat(val.replace(/\./g, '')) || 0;
}

// === Hitung Cicilan ===
function pembulatanRibuan(nilai) {
  return Math.floor(nilai / 1000) * 1000;
}

function hitungCicilan() {
  const harga = getAngka('hargaBarang');
  const lama = parseInt(document.getElementById('lamaCicilan').value);
  const dp = getAngka('dp');
  const hasil = document.getElementById('hasilCicilan');

  if (isNaN(harga) || isNaN(lama)) {
    hasil.innerHTML = "Harap isi Harga dan Lama Cicilan.";
    return;
  }

  if (lama > 12) {
    hasil.innerHTML = "<b>Maaf, lebih 12 bulan hubungi Admin.</b>";
    return;
  }

const hargaSetelahDP = harga - dp;
const faktor = (lama <= 5) ? 1.10 : 1 + (lama * 0.02);
const hargaJualSementara = hargaSetelahDP * faktor;
  const cicilanAwal = hargaJualSementara / lama;
  const cicilanFinal = pembulatanRibuan(cicilanAwal);
  const hargaJualFinal = cicilanFinal * lama;

  const tanggalSekarang = new Date();
  tanggalSekarang.setMonth(tanggalSekarang.getMonth() + (lama + 1));
  const opsiTanggal = { month: 'long', year: 'numeric' };
  const batasAkhir = tanggalSekarang.toLocaleDateString('id-ID', opsiTanggal);

  hasil.innerHTML = `
    <p><b>Harga Jual:</b> Rp ${hargaJualFinal.toLocaleString('id-ID')}</p>
    <p><b>Cicilan Bulanan:</b> Rp ${cicilanFinal.toLocaleString('id-ID')}</p>
    <p><b>Batas Akhir Cicilan:</b> ${batasAkhir}</p>
  `;
}

// === Cek Data Konsumen (Simulasi) ===
function cekData() {
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
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  const toNumber = (val) => {
    if (!val) return 0;
    return Number(val.toString().replace(/[^0-9]/g, ""));
  };

  const cekStatus = (harga, totalBayar) => {
    const hargaNum = toNumber(harga);
    const totalBayarNum = toNumber(totalBayar);
    return totalBayarNum >= hargaNum
      ? '<span class="status-lunas">LUNAS</span>'
      : '<span class="status-belum">BELUM LUNAS</span>';
  };

  const hitungCicilanTerakhirBulan = (tanggalMulai, lamaBulan) => {
    if (!tanggalMulai || !lamaBulan) return '-';
    const parts = tanggalMulai.split('/');
    if (parts.length !== 3) return '-';
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const mulaiDate = new Date(year, month, 1);
    mulaiDate.setMonth(mulaiDate.getMonth() + parseInt(lamaBulan, 10));
    const options = { month: 'long', year: 'numeric' };
    return mulaiDate.toLocaleDateString('id-ID', options);
  };

  const harga = toNumber(data.harga);
  const cicilanPerBulan = toNumber(data.cicilanPerBulan);
  const totalBayar = toNumber(data.totalBayar);
  const sisaBayar = harga - totalBayar;

  document.getElementById("detailKonsumen").innerHTML = `
    <p><strong>Kode:</strong> ${data.kode || '-'}</p>
    <p><strong>Nama:</strong> ${data.nama || '-'}</p>
    <p><strong>Barang:</strong> ${data.barang || '-'}</p>
    <p><strong>Harga:</strong> ${harga ? formatRupiah(harga) : '-'}</p>
    <p><strong>Cicilan per Bulan:</strong> ${cicilanPerBulan ? formatRupiah(cicilanPerBulan) : '-'}</p>
    <p><strong>Lama Cicilan:</strong> ${data.lamaBulan || '-'} bulan</p>
    <p><strong>Cicilan Terakhir:</strong> ${hitungCicilanTerakhirBulan(data.tanggalMulai, data.lamaBulan)}</p>
    <p><strong>Status:</strong> ${cekStatus(harga, totalBayar)}</p>
    <p><strong>Total Dibayar:</strong> ${totalBayar ? formatRupiah(totalBayar) : '-'}</p>
    <p><strong>Sisa Pembayaran:</strong> ${sisaBayar ? formatRupiah(sisaBayar) : '-'}</p>
  `;

  const riwayatDiv = document.getElementById("riwayatCicilan");
  if (data.cicilan && data.cicilan.length > 0) {
    riwayatDiv.innerHTML = data.cicilan.map((cicilan, index) => {
      const nominal = toNumber(cicilan.nominal);
      return `
        <div class="cicilan-item" style="
          border: 1px solid #ccc;
          border-radius: 6px;
          padding: 10px;
          margin-bottom: 10px;
          background: #f9f9f9;
        ">
          <p><strong>Bulan ke-${index + 1}</strong></p>
          <p><strong>Tanggal:</strong> ${cicilan.tanggal || '-'}</p>
          <p><strong>Nominal:</strong> ${nominal ? formatRupiah(nominal) : '-'}</p>
        </div>
      `;
    }).join('');
  } else {
    riwayatDiv.innerHTML = "<p>Belum ada riwayat pembayaran</p>";
  }

  document.getElementById("hasil").style.display = "block";
}
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
  menu.style.display = (menu.style.display === "flex") ? "none" : "flex";
}

// === Panel Konten Dinamis ===
function bukaPanel(file) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      document.getElementById("isiPanel").innerHTML = html;
      document.getElementById("panelKonten").style.display = "block";
    })
    .catch(err => {
      document.getElementById("isiPanel").innerHTML = "<p>Gagal memuat konten.</p>";
      document.getElementById("panelKonten").style.display = "block";
    });
}

function tutupPanel() {
  document.getElementById("panelKonten").style.display = "none";
  document.getElementById("isiPanel").innerHTML = "";
}
