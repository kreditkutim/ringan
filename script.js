 <script>
// fungsi.js
function pembulatanRibuan(nilai) {
    return Math.floor(nilai / 1000) * 1000;
}

function hitungCicilan() {
    const harga = parseFloat(document.getElementById('hargaBarang').value);
    const lama = parseInt(document.getElementById('lamaCicilan').value);
    const dp = parseFloat(document.getElementById('dp').value) || 0;
    const hasil = document.getElementById('hasilCicilan');

    if (isNaN(harga) || isNaN(lama)) {
        hasil.innerHTML = "Harap isi Harga dan Lama Cicilan.";
        return;
    }

    if (lama > 12) {
        hasil.innerHTML = "<b>Maaf, maksimal cicilan 12 bulan.</b>";
        return;
    }

    let faktor = (lama <= 5) ? 1.10 : 1 + (lama * 0.02);
    const hargaSetelahDP = harga - dp;
    const hargaJualSementara = hargaSetelahDP * faktor;
    const cicilanAwal = hargaJualSementara / lama;
    const cicilanFinal = pembulatanRibuan(cicilanAwal);
    const hargaJualFinal = cicilanFinal * lama;

    const tanggalSekarang = new Date();
    tanggalSekarang.setMonth(tanggalSekarang.getMonth() + lama + 1);
    const opsiTanggal = { month: 'long', year: 'numeric' };
    const batasAkhir = tanggalSekarang.toLocaleDateString('id-ID', opsiTanggal);

    hasil.innerHTML = `
        <p><b>Harga Jual:</b> Rp ${hargaJualFinal.toLocaleString('id-ID')}</p>
        <p><b>Cicilan Bulanan:</b> Rp ${cicilanFinal.toLocaleString('id-ID')}</p>
        <p><b>Batas Akhir Cicilan:</b> ${batasAkhir}</p>
    `;
}

// Fungsi untuk cek data cicilan
async function cekDataCicilan() {
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

        tampilkanDataCicilan(data.data);

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

function tampilkanDataCicilan(data) {
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(angka);
    };

    function cekStatus(harga, totalBayar) {
        const hargaNum = Number(harga);
        const totalBayarNum = Number(totalBayar);
    
        if (totalBayarNum >= hargaNum) {
            return '<span class="status-lunas">LUNAS</span>';
        } else {
            return '<span class="status-belum">BELUM LUNAS</span>';
        }
    }
    
    const toNumber = (val) => {
        if (!val) return 0;
        return Number(val.toString().replace(/[^0-9]/g, ""));
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
    
    function hitungCicilanTerakhirBulan(tanggalMulai, lamaBulan) {
        if (!tanggalMulai || !lamaBulan) return '-';
        
        // Pecah tanggal mulai (format dd/mm/yyyy)
        const parts = tanggalMulai.split('/');
        if (parts.length !== 3) return '-';

        const month = parseInt(parts[1], 10) - 1; // 0-based index
        const year = parseInt(parts[2], 10);

        const mulaiDate = new Date(year, month, 1);
        mulaiDate.setMonth(mulaiDate.getMonth() + parseInt(lamaBulan, 10));

        const options = { month: 'long', year: 'numeric' };
        return mulaiDate.toLocaleDateString('id-ID', options);
    }
    
    const riwayatDiv = document.getElementById("riwayatCicilan");
    if (data.cicilan && data.cicilan.length > 0) {
        riwayatDiv.innerHTML = data.cicilan.map(cicilan => {
            const nominal = toNumber(cicilan.nominal);
            return `
                <div class="cicilan-item">
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

// Service Worker Registration
if ('serviceWorker' in navigator) {
    // Unregister any existing service worker
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
            registration.unregister();
            console.log('Service Worker unregistered for update');
        }
    });
    
    // Register new service worker
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('service-worker.js?v=2')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
  </script>
