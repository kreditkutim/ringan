 <script>
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
      tanggalSekarang.setMonth(tanggalSekarang.getMonth() + lama);
      const opsiTanggal = { month: 'long', year: 'numeric' };
      const batasAkhir = tanggalSekarang.toLocaleDateString('id-ID', opsiTanggal);

      hasil.innerHTML = `
        <p><b>Harga Jual:</b> Rp ${hargaJualFinal.toLocaleString('id-ID')}</p>
        <p><b>Cicilan Bulanan:</b> Rp ${cicilanFinal.toLocaleString('id-ID')}</p>
        <p><b>Batas Akhir Cicilan:</b> ${batasAkhir}</p>
      `;
    }

 
  </script>
