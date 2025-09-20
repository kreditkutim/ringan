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

  let faktor = (lama <= 5) ? 1.125 : 1 + (lama * 0.025);
  const hargaSetelahDP = harga - dp;
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
