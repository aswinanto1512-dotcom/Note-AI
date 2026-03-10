import { useState, useEffect } from 'react'
import { requestNotificationPermission, checkAndNotify } from '../utils/notifications.js'

const SESSION_DISMISS_KEY = 'notif_dismissed'

/**
 * Dismissible banner prompting the user to enable browser notifications.
 *
 * Visible when ALL of the following are true:
 *   - The browser supports notifications
 *   - Permission is still 'default' (not yet asked)
 *   - The user has at least one note with a dueDate
 *   - The user has not dismissed the banner this session
 *
 * Props:
 *   notes        — full notes array (used to detect dueDate presence)
 *   onPermissionChange(newPermission) — called after user clicks Enable
 */
export default function NotificationBanner({ notes, onPermissionChange }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Do not show if the browser does not support notifications.
    if (!('Notification' in window)) return

    // Already decided — no need to ask again.
    if (Notification.permission !== 'default') return

    // Dismissed this session.
    try {
      if (sessionStorage.getItem(SESSION_DISMISS_KEY)) return
    } catch {
      // ignore
    }

    // Only show the banner when there is at least one note with a reminder date
    // so we do not bother users who have no reminders at all.
    const hasReminders = notes.some((n) => n.dueDate)
    if (hasReminders) setVisible(true)
  }, [notes])

  if (!visible) return null

  const handleEnable = async () => {
    const permission = await requestNotificationPermission()
    setVisible(false)
    if (onPermissionChange) onPermissionChange(permission)
    if (permission === 'granted') {
      // Fire any due notifications straight away after the user grants access.
      checkAndNotify(notes)
    }
  }

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(SESSION_DISMISS_KEY, '1')
    } catch {
      // ignore
    }
    setVisible(false)
  }

  return (
    <div
      role="alert"
      className="w-full px-4 py-2.5 flex items-center justify-between gap-3 text-sm"
      style={{ background: 'linear-gradient(90deg, #4F1C8A 0%, #6D28D9 100%)' }}
    >
      <span className="text-white font-medium leading-snug">
        🔔 Enable notifications to get reminded on important dates
      </span>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleEnable}
          className="px-3 py-1 rounded-full bg-white text-purple-800 font-semibold text-xs hover:bg-purple-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          Enable
        </button>
        <button
          onClick={handleDismiss}
          className="px-3 py-1 rounded-full border border-white/50 text-white font-semibold text-xs hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
        >
          Not now
        </button>
      </div>
    </div>
  )
}
