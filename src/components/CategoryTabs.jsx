const TABS = [
  { id: 'all', label: 'All', emoji: '📋' },
  { id: 'voice-notes', label: 'Voice Notes', emoji: '🎤' },
  { id: 'work', label: 'Work', emoji: '💼' },
  { id: 'reminder', label: 'Reminder', emoji: '⏰' },
  { id: 'shopping', label: 'Shopping', emoji: '🛒' },
  { id: 'personal', label: 'Personal', emoji: '🔒' },
]

export default function CategoryTabs({ activeCategory, onSelect, notes, darkMode }) {
  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-hide py-3 -mx-1 px-1"
      style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(139,92,246,0.1)' }}
    >
      {TABS.map(tab => {
        const isActive = activeCategory === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400/50 flex-shrink-0"
            style={
              isActive
                ? {
                    background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                    boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
                    color: 'white',
                    border: '1px solid transparent',
                  }
                : {
                    background: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    color: '#6B7280',
                  }
            }
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
