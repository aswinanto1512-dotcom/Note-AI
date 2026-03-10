const ACCENT_COLORS = {
  reminder: '#F59E0B',
  personal: '#8B5CF6',
  shopping: '#EC4899',
  work: '#10B981',
  'voice-notes': '#3B82F6',
}

const BADGE_STYLES = {
  reminder:      { bg: 'rgba(245,158,11,0.12)',  border: '1px solid rgba(245,158,11,0.3)',  color: '#D97706' },
  personal:      { bg: 'rgba(139,92,246,0.12)',  border: '1px solid rgba(139,92,246,0.3)',  color: '#7C3AED' },
  shopping:      { bg: 'rgba(236,72,153,0.12)',  border: '1px solid rgba(236,72,153,0.3)',  color: '#DB2777' },
  work:          { bg: 'rgba(16,185,129,0.12)',  border: '1px solid rgba(16,185,129,0.3)',  color: '#059669' },
  'voice-notes': { bg: 'rgba(59,130,246,0.12)',  border: '1px solid rgba(59,130,246,0.3)',  color: '#2563EB' },
}

const CATEGORY_META = {
  reminder: { label: 'Reminder', emoji: '⏰' },
  personal: { label: 'Personal', emoji: '🔒' },
  shopping: { label: 'Shopping', emoji: '🛒' },
  work: { label: 'Work', emoji: '💼' },
  'voice-notes': { label: 'Voice Notes', emoji: '🎤' },
}

export default function NoteCard({ note, onEdit, onTogglePin, darkMode }) {
  const accentColor = ACCENT_COLORS[note.category] || '#8B5CF6'
  const badgeStyle = BADGE_STYLES[note.category] || BADGE_STYLES.work
  const meta = CATEGORY_META[note.category] || { label: note.category, emoji: '📝' }

  const handlePinClick = (e) => {
    e.stopPropagation()
    onTogglePin(note.id)
  }

  return (
    <div
      onClick={() => onEdit(note)}
      className="rounded-2xl p-4 cursor-pointer transition-all duration-200 flex flex-col gap-2 hover:scale-[1.02] hover:brightness-110"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.9)',
        borderTop: `3px solid ${accentColor}`,
        boxShadow: '0 4px 24px rgba(139,92,246,0.08), 0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* Top row: badge + pin */}
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: badgeStyle.bg, border: badgeStyle.border, color: badgeStyle.color }}
        >
          <span>{meta.emoji}</span>
          <span>{meta.label}</span>
        </span>

        <button
          onClick={handlePinClick}
          className={`text-base leading-none transition-opacity duration-150 focus:outline-none ${
            note.isPinned
              ? 'opacity-100'
              : 'opacity-30 hover:opacity-70'
          }`}
          aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
          title={note.isPinned ? 'Unpin' : 'Pin'}
        >
          📌
        </button>
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-900 text-sm leading-snug">
        {note.title}
      </h3>

      {/* Content preview */}
      <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
        {note.content}
      </p>

      {/* Due date (and optional time) */}
      {note.dueDate && (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-sm">📅</span>
          <span className="text-orange-500 text-xs font-medium">
            {note.dueDate}
            {note.dueTime && (() => {
              const [h, m] = note.dueTime.split(':').map(Number);
              const hour = h % 12 || 12;
              const min = String(m).padStart(2, '0');
              const ampm = h >= 12 ? 'PM' : 'AM';
              return ` at ${hour}:${min} ${ampm}`;
            })()}
          </span>
        </div>
      )}

      {/* Attachment indicator */}
      {note.attachedFileName && (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-sm">📎</span>
          <span className="text-xs text-gray-400 truncate max-w-[160px]">
            {note.attachedFileName}
          </span>
        </div>
      )}
    </div>
  )
}
