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

// ✅ Added this to disable service worker and fix layout cache issues in APK
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(function (registration) {
        registration.unregister();
      })
      .catch(function (error) {
        console.error('❌ ServiceWorker unregistration failed:', error);
      });
  }
}
