// AF Notebook — Notification utilities
// Handles permission requests, service-worker registration, and
// firing local notifications when a note's reminder date matches today.

// ── Permission ───────────────────────────────────────────────────────────────

/**
 * Request browser notification permission.
 * Returns: 'granted' | 'denied' | 'default' | 'unsupported'
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result;
}

// ── Service Worker ───────────────────────────────────────────────────────────

/**
 * Register /sw.js and return the ServiceWorkerRegistration, or null when
 * service workers are not supported.
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return reg;
  } catch (err) {
    console.warn('[AF Notebook] Service worker registration failed:', err);
    return null;
  }
}

/**
 * Send the current notes list to the service worker so it can cache them
 * for future background checks.
 */
export async function syncNotesToServiceWorker(notes) {
  if (!('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  if (reg.active) {
    reg.active.postMessage({ type: 'SCHEDULE_NOTIFICATIONS', notes });
  }
}

// ── Emoji picker ─────────────────────────────────────────────────────────────

function pickEmoji(note) {
  // Category takes first priority, then keywords in title + content.
  if (note.category === 'reminder') {
    const text = (note.title + ' ' + note.content).toLowerCase();
    if (text.includes('birthday') || text.includes('bday')) return '🎂';
    if (text.includes('anniversary')) return '💑';
    if (text.includes('meeting')) return '💼';
    if (text.includes('deadline')) return '⚡';
    return '⏰';
  }
  const text = (note.title + ' ' + note.content).toLowerCase();
  if (text.includes('birthday') || text.includes('bday')) return '🎂';
  if (text.includes('anniversary')) return '💑';
  if (text.includes('meeting')) return '💼';
  if (text.includes('deadline')) return '⚡';
  if (note.category === 'work') return '💼';
  if (note.category === 'shopping') return '🛒';
  if (note.category === 'personal') return '🔒';
  return '📅';
}

// ── Core check-and-notify ────────────────────────────────────────────────────

/**
 * Iterate over all notes and fire a browser notification for every note whose
 * reminder date matches today AND that has no specific dueTime set.
 *
 * Notes with both dueDate and dueTime are handled by scheduleTimedNotification
 * and are intentionally skipped here to avoid double-firing.
 *
 * Matching rules:
 *   - Exact date match  → fires once on the exact calendar day.
 *   - Annual (MM-DD) match → fires every year on the same month/day,
 *     enabling recurring reminders such as birthdays.
 *
 * De-duplication: a localStorage flag keyed to `notified_<id>_<YYYY-MM-DD>`
 * prevents the same notification from firing more than once per day, even
 * when the function is called repeatedly by the interval timer.
 */
export function checkAndNotify(notes) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (!Array.isArray(notes) || notes.length === 0) return;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
  const todayMM = String(today.getMonth() + 1).padStart(2, '0');
  const todayDD = String(today.getDate()).padStart(2, '0');
  const todayMMDD = `${todayMM}-${todayDD}`;

  notes.forEach((note) => {
    if (!note.dueDate) return;

    // Skip notes that have a specific time — those are handled by scheduleTimedNotification.
    if (note.dueTime) return;

    const dueDate = new Date(note.dueDate);
    // Guard against invalid date strings stored in older notes.
    if (isNaN(dueDate.getTime())) return;

    const dueMM = String(dueDate.getMonth() + 1).padStart(2, '0');
    const dueDD = String(dueDate.getDate()).padStart(2, '0');
    const dueMMDD = `${dueMM}-${dueDD}`;

    const exactMatch = note.dueDate.startsWith(todayStr);
    const annualMatch = todayMMDD === dueMMDD;

    if (!exactMatch && !annualMatch) return;

    // De-duplication — do not re-fire a notification we already showed today.
    const dedupKey = `notified_${note.id}_${todayStr}`;
    try {
      if (localStorage.getItem(dedupKey)) return;
    } catch {
      // localStorage unavailable — proceed anyway.
    }

    const emoji = pickEmoji(note);
    const bodyText = note.content
      ? note.content.slice(0, 100) + (note.content.length > 100 ? '...' : '')
      : 'Tap to open the note.';

    try {
      const notification = new Notification(`${emoji} ${note.title}`, {
        body: bodyText,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: note.id,          // prevents stacking duplicate notifications in OS
        requireInteraction: true,
        data: { noteId: note.id },
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Mark as notified for today.
      try {
        localStorage.setItem(dedupKey, '1');
      } catch {
        // ignore
      }
    } catch (err) {
      console.warn('[AF Notebook] Failed to show notification:', err);
    }
  });
}

// ── Timed notifications ───────────────────────────────────────────────────────

/**
 * Schedule a precise notification for a note that has both dueDate and dueTime.
 * Uses setTimeout to fire the notification at exactly the target moment.
 *
 * Returns the timeout ID so the caller can cancel it when notes change,
 * or null when the notification cannot or should not be scheduled.
 */
export function scheduleTimedNotification(note) {
  if (!note.dueDate || !note.dueTime) return null;
  if (!('Notification' in window)) return null;
  if (Notification.permission !== 'granted') return null;

  const [year, month, day] = note.dueDate.split('-').map(Number);
  const [hours, minutes] = note.dueTime.split(':').map(Number);

  const targetTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
  const now = new Date();
  const msUntil = targetTime.getTime() - now.getTime();

  if (msUntil < 0) return null; // already passed
  // More than 7 days away — skip; the next page load will re-schedule.
  if (msUntil > 7 * 24 * 60 * 60 * 1000) return null;

  const alreadyNotifiedKey = `notified_${note.id}_${note.dueDate}_${note.dueTime}`;
  try {
    if (localStorage.getItem(alreadyNotifiedKey)) return null;
  } catch {
    // localStorage unavailable — proceed anyway.
  }

  const timeoutId = setTimeout(() => {
    let emoji = '⏰';
    const text = (note.title + note.content).toLowerCase();
    if (text.includes('meeting')) emoji = '💼';
    if (text.includes('birthday') || text.includes('bday')) emoji = '🎂';
    if (text.includes('deadline')) emoji = '⚡';
    if (text.includes('call') || text.includes('phone')) emoji = '📞';
    if (text.includes('lunch') || text.includes('dinner')) emoji = '🍽️';

    // Format time for human-readable display in the notification body.
    const h = hours % 12 || 12;
    const m = String(minutes).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const timeStr = `${h}:${m} ${ampm}`;

    try {
      const notification = new Notification(`${emoji} ${note.title}`, {
        body: `${timeStr} — ${note.content.slice(0, 80)}${note.content.length > 80 ? '...' : ''}`,
        icon: '/favicon.ico',
        tag: `${note.id}_timed`,
        requireInteraction: true,
        data: { noteId: note.id },
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      try {
        localStorage.setItem(alreadyNotifiedKey, '1');
      } catch {
        // ignore
      }
    } catch (err) {
      console.warn('[AF Notebook] Failed to show timed notification:', err);
    }
  }, msUntil);

  return timeoutId;
}

/**
 * Schedule timed notifications for every note in the array that has both
 * dueDate and dueTime. Returns an array of { noteId, timeoutId } objects
 * so the caller can cancel them later.
 */
export function scheduleAllTimedNotifications(notes) {
  if (!Array.isArray(notes)) return [];
  const timeoutIds = [];
  notes.forEach(note => {
    if (note.dueDate && note.dueTime) {
      const id = scheduleTimedNotification(note);
      if (id !== null) timeoutIds.push({ noteId: note.id, timeoutId: id });
    }
  });
  return timeoutIds;
}
