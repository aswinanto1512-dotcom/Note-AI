const CATEGORY_CONFIG = {
  'voice-notes': { label: 'Voice Notes', emoji: '🎤' },
  work: { label: 'Work', emoji: '💼' },
  reminder: { label: 'Reminder', emoji: '⏰' },
  shopping: { label: 'Shopping', emoji: '🛒' },
  personal: { label: 'Personal', emoji: '🔒' },
}

const CATEGORY_ORDER = ['voice-notes', 'work', 'reminder', 'shopping', 'personal']

export default function CategoryStats({ notes, darkMode }) {
  // Count notes per category
  const counts = notes.reduce((acc, note) => {
    acc[note.category] = (acc[note.category] || 0) + 1
    return acc
  }, {})

  // Only show categories that have notes, in defined order
  const activeCategories = CATEGORY_ORDER.filter(cat => counts[cat] > 0)

  if (activeCategories.length === 0) return null

  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2 -mx-1 px-1 mb-2">
      {activeCategories.map(cat => {
        const config = CATEGORY_CONFIG[cat]
        return (
          <div
            key={cat}
            className="flex flex-col items-center p-4 rounded-2xl cursor-pointer transition-all hover:scale-105 flex-shrink-0 min-w-[100px]"
            style={{
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(139,92,246,0.15)',
              boxShadow: '0 4px 20px rgba(139,92,246,0.08)',
            }}
          >
            <span className="text-2xl mb-1">{config.emoji}</span>
            <span className="text-purple-600 font-bold text-xl leading-tight">{counts[cat]}</span>
            <span className="text-gray-500 text-xs mt-0.5 text-center">{config.label}</span>
          </div>
        )
      })}
    </div>
  )
}
