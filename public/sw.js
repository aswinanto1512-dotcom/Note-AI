// AF Notebook — Service Worker
// Handles notification clicks and background push events.

const APP_CACHE = 'af-notebook-sw-v1';

// ── Message from the main thread ────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SCHEDULE_NOTIFICATIONS') {
    // Store notes payload in the SW cache so future background checks
    // (e.g. periodic-sync) can access them without needing a live page.
    const notes = event.data.notes || [];
    caches.open(APP_CACHE).then((cache) => {
      const body = JSON.stringify({ notes, updatedAt: Date.now() });
      cache.put(
        '/__sw_notes_cache__',
        new Response(body, { headers: { 'Content-Type': 'application/json' } })
      );
    });
  }
});

// ── Notification click ───────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If the app is already open, focus it.
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window.
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// ── Push (future use — Web Push API) ────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'AF Notebook', body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'AF Notebook', {
      body: payload.body || '',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: true,
      data: payload.data || {},
    })
  );
});
