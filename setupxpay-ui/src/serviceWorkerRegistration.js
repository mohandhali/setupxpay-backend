// src/serviceWorkerRegistration.js

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(function (registration) {
          console.log('✅ ServiceWorker registered: ', registration);
        })
        .catch(function (error) {
          console.log('❌ ServiceWorker registration failed: ', error);
        });
    });
  }
}
