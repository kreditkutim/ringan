console.log("App.js aktif...");

// Variabel untuk simpan event install
let deferredPrompt;

// Tombol
const installBtn = document.getElementById("installBtn");
const updateBtn = document.getElementById("updateBtn");

// Sembunyikan tombol di awal
if (installBtn) installBtn.style.display = "none";
if (updateBtn) updateBtn.style.display = "none";

// --- Deteksi dan Tampilkan Tombol Instal ---
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log("Event beforeinstallprompt ditangkap");

  if (installBtn) installBtn.style.display = "inline-block";
});

if (installBtn) {
  installBtn.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("User memilih:", outcome);
      deferredPrompt = null;
      installBtn.style.display = "none";
    }
  });
}

// --- Daftarkan dan Deteksi Service Worker ---
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((reg) => {
        console.log("Service Worker terdaftar:", reg.scope);

        // Jika ada versi baru yang menunggu aktivasi
        if (reg.waiting) {
          console.log("Versi baru service worker tersedia");
          if (updateBtn) updateBtn.style.display = "inline-block";

          updateBtn.addEventListener("click", () => {
            reg.waiting.postMessage({ type: "SKIP_WAITING" });
          });
        }

        // Jika ada update baru ditemukan
        reg.addEventListener("updatefound", () => {
          const newSW = reg.installing;
          newSW.addEventListener("statechange", () => {
            if (newSW.state === "installed" && navigator.serviceWorker.controller) {
              console.log("Versi baru siap, tampilkan tombol update");
              if (updateBtn) updateBtn.style.display = "inline-block";

              updateBtn.addEventListener("click", () => {
                newSW.postMessage({ type: "SKIP_WAITING" });
              });
            }
          });
        });
      })
      .catch((err) => console.error("Service Worker gagal:", err));
  });

  // Listener untuk reload halaman setelah update
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data && event.data.type === "RELOAD_PAGE") {
      console.log("Reload halaman karena versi baru aktif");
      window.location.reload();
    }
  });
}
