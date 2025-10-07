/* firebase-messaging-sw.js — à placer à la RACINE du site (/) */
// Utilise les versions "compat" pour la simplicité côté Service Worker
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js');

// ⚠️ Il est important que messagingSenderId corresponde à votre projet
firebase.initializeApp({
  apiKey: "AIzaSyC5Rly--5aw3vSEuhRcyZxzD5fg1JJowbE",
  authDomain: "lift-agenda-app.firebaseapp.com",
  projectId: "lift-agenda-app",
  messagingSenderId: "162981688841",
  appId: "1:162981688841:web:8ceee20cd7500aedb1ead8"
});

const messaging = firebase.messaging();

// Affichage de la notification quand l'app est en arrière-plan / onglet fermé
messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || "Notification";
  const options = {
    body: payload?.notification?.body || "",
    tag: payload?.notification?.tag || "agenda",
    icon: payload?.notification?.icon || undefined,
    badge: payload?.notification?.badge || undefined,
    data: payload?.data || {}
  };
  self.registration.showNotification(title, options);
});

// Optionnel: clic sur la notification
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Ouvre / focus l'onglet principal
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let client of windowClients) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});