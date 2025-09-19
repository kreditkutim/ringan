console.log("App.js jalan...");

// Variabel untuk simpan event install
let deferredPrompt;

// Tombol
const installBtn = document.getElementById("installBtn");
const updateBtn = document.getElementById("updateBtn");

// Awalnya sembunyikan tombol install
if (installBtn) {
  installBtn.style.display = "none";
}

// --- Install Aplikasi ---
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log("beforeinstallprompt ditangkap");

  if (installBtn) {
    installBtn.style.display = "inline-block"; // tampilkan tombol
  }
});

if (installBtn) {
  installBtn.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("User memilih:", outcome);
      deferredPrompt = null;
      installBtn.style.display = "none"; // sembunyikan lagi setelah klik
    }
  });
}

// --- Update Aplikasi ---
if (updateBtn) {
  updateBtn.addEventListener("click", () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister().then(() => {
            console.log("Service Worker unregistered. Reload halaman...");
            window.location.reload(true);
          });
        }
      });
    } else {
      console.log("Service Worker tidak tersedia di browser ini.");
    }
  });
}

// --- Daftarkan Service Worker ---
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((reg) => console.log("Service Worker terdaftar:", reg.scope))
      .catch((err) => console.error("Service Worker gagal:", err));
  });
}
