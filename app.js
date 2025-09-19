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
