let deferredPrompt;
const installBtn = document.getElementById("installBtn");

// Tangkap event sebelum install muncul
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "block"; // tampilkan tombol install
});

// Klik tombol install
installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log("User response:", outcome);
  deferredPrompt = null;
  installBtn.style.display = "none";
});

// Service Worker register
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((reg) => console.log("Service Worker terdaftar:", reg.scope))
      .catch((err) => console.error("SW gagal:", err));
  });
}
// Tombol update manual
const updateBtn = document.getElementById("updateBtn");
if (updateBtn) {
  updateBtn.addEventListener("click", async () => {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (let reg of regs) {
        await reg.unregister(); // hapus worker lama
      }
      caches.keys().then(keys => {
        keys.forEach(key => caches.delete(key)); // hapus cache lama
      });
      alert("Aplikasi diperbarui! Silakan muat ulang halaman.");
      location.reload(true); // paksa reload ambil versi terbaru
    } else {
      alert("Browser tidak mendukung Service Worker.");
    }
  });
}

