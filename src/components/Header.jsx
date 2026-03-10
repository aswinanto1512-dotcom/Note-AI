import { useState } from 'react'
import { requestNotificationPermission, checkAndNotify } from '../utils/notifications.js'

/**
 * Bell icon colours:
 *   green  — notifications granted
 *   orange — permission not yet asked (default)
 *   red    — permission denied
 */
const DOT_COLOR = {
  granted: 'bg-green-400',
  default: 'bg-orange-400',
  denied: 'bg-red-500',
  unsupported: 'hidden',
}

export default function Header({
  darkMode,
  onToggleDark,
  onOpenAI,
  onOpenVoice,
  onOpenFinance,
  totalNotes,
  categoryCount,
  notifPermission,
  onNotifPermissionChange,
}) {
  const [toast, setToast] = useState(null)

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const handleBellClick = async () => {
    if (notifPermission === 'unsupported') {
      showToast('Your browser does not support notifications.')
      return
    }

    if (notifPermission === 'granted') {
      showToast('Notifications are enabled ✓')
      return
    }

    if (notifPermission === 'denied') {
      showToast('Notifications are blocked. Please enable them in your browser settings.')
      return
    }

    // 'default' — ask for permission
    const result = await requestNotificationPermission()
    if (onNotifPermissionChange) onNotifPermissionChange(result)
    if (result === 'granted') {
      showToast('Notifications enabled ✓')
    } else {
      showToast('Notifications not enabled.')
    }
  }

  const dotClass = DOT_COLOR[notifPermission] ?? 'hidden'

  return (
    <header
      className="w-full px-4 pt-5 pb-6 relative shadow-lg"
      style={{
        background: 'linear-gradient(135deg, #3B0764 0%, #6D28D9 50%, #4F46E5 100%)',
        boxShadow: '0 4px 24px rgba(109, 40, 217, 0.4)',
      }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Left: logo + title */}
        <div className="flex items-center gap-3">
          {/* SVG Logo Mark */}
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #fff 0%, #f0e6ff 100%)', boxShadow: '0 0 20px rgba(167,139,250,0.6), 0 4px 12px rgba(0,0,0,0.2)' }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                {/* Pencil/note body */}
                <rect x="5" y="3" width="12" height="16" rx="2" fill="url(#logoGrad1)" />
                {/* Lines on note */}
                <line x1="8" y1="8" x2="14" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
                <line x1="8" y1="11" x2="14" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                <line x1="8" y1="14" x2="11" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                {/* AI spark */}
                <circle cx="18" cy="17" r="6" fill="url(#logoGrad2)" />
                <text x="18" y="21" textAnchor="middle" fontSize="7" fontWeight="bold" fill="white">AI</text>
                <defs>
                  <linearGradient id="logoGrad1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6"/>
                    <stop offset="100%" stopColor="#4F46E5"/>
                  </linearGradient>
                  <linearGradient id="logoGrad2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F59E0B"/>
                    <stop offset="100%" stopColor="#EF4444"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-2xl animate-pulse"
              style={{ boxShadow: '0 0 16px rgba(139,92,246,0.7)', opacity: 0.6 }} />
          </div>

          {/* Brand text */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-white font-black text-2xl tracking-tight leading-none drop-shadow">Note</span>
              <span className="font-black text-2xl tracking-tight leading-none"
                style={{ background: 'linear-gradient(90deg, #FDE68A 0%, #FCA5A5 50%, #C4B5FD 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 8px rgba(253,230,138,0.8))' }}>AI</span>
            </div>
            <span className="text-white/60 text-xs font-medium tracking-wide">{totalNotes} notes · {categoryCount} categories</span>
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-3">
          {/* Bell / notification status */}
          <button
            onClick={handleBellClick}
            className="relative w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Notification settings"
            title={
              notifPermission === 'granted'
                ? 'Notifications enabled'
                : notifPermission === 'denied'
                ? 'Notifications blocked — click for info'
                : 'Enable notifications'
            }
          >
            🔔
            {/* Status dot */}
            {notifPermission !== 'unsupported' && (
              <span
                className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2 border-purple-700 ${dotClass}`}
              />
            )}
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDark}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          <button
            onClick={onOpenFinance}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-white/70 text-white font-semibold text-sm hover:bg-white hover:text-purple-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Finance tracker"
            title="Open finance tracker"
          >
            <span>💰</span>
            <span>Finance</span>
          </button>

          <button
            onClick={onOpenVoice}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-white/70 text-white font-semibold text-sm hover:bg-white hover:text-purple-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="New voice note"
            title="Record a new voice note"
          >
            <span>🎤</span>
            <span>Voice</span>
          </button>

          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-white text-white font-semibold text-sm hover:bg-white hover:text-purple-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <span>✨</span>
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      {/* Toast message */}
      {toast && (
        <div
          className="absolute bottom-2 right-4 bg-white text-gray-800 text-xs font-semibold px-4 py-2 rounded-full shadow-lg z-50 pointer-events-none transition-opacity duration-300"
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}
    </header>
  )
}
