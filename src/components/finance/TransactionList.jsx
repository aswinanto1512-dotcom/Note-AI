import { useState } from 'react'

const CATEGORY_EMOJI = {
  food:          '🍔',
  transport:     '🚌',
  shopping:      '🛍️',
  bills:         '📱',
  health:        '🏥',
  entertainment: '🎬',
  salary:        '💼',
  other:         '📦',
}

const CATEGORY_LABEL = {
  food:          'Food',
  transport:     'Transport',
  shopping:      'Shopping',
  bills:         'Bills',
  health:        'Health',
  entertainment: 'Entertainment',
  salary:        'Salary',
  other:         'Other',
}

function formatDate(dateStr) {
  const today = new Date()
  const d = new Date(dateStr)
  // Normalize both to midnight local to compare dates only
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const dMid = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((todayMid - dMid) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function TransactionList({ transactions, currency, onDelete, darkMode }) {
  const [revealedId, setRevealedId] = useState(null)

  // Sort by date descending, then by createdAt descending
  const sorted = [...transactions].sort((a, b) => {
    const dateDiff = new Date(b.date) - new Date(a.date)
    if (dateDiff !== 0) return dateDiff
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  const fmt = (n) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 })

  if (sorted.length === 0) {
    return (
      <div
        className={`rounded-2xl p-5 border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}
      >
        <h3 className={`text-sm font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          Recent Transactions
        </h3>
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <span className="text-4xl">💸</span>
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            No transactions yet. Add one above!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-2xl border overflow-hidden ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}
    >
      <div className="px-5 py-4 flex items-center justify-between">
        <h3 className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          Recent Transactions
        </h3>
        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {sorted.length} total
        </span>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {sorted.map(t => {
          const isRevealed = revealedId === t.id
          const emoji = CATEGORY_EMOJI[t.category] || '📦'
          const catLabel = CATEGORY_LABEL[t.category] || 'Other'
          const isExpense = t.type === 'expense'

          return (
            <div
              key={t.id}
              className="relative overflow-hidden"
            >
              {/* Delete button revealed on tap */}
              <div
                className={`absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center bg-red-500 transition-transform duration-200 ${
                  isRevealed ? 'translate-x-0' : 'translate-x-full'
                }`}
              >
                <button
                  onClick={() => {
                    onDelete(t.id)
                    setRevealedId(null)
                  }}
                  className="text-white text-xs font-semibold px-2 py-1 focus:outline-none"
                  aria-label="Delete transaction"
                >
                  Delete
                </button>
              </div>

              {/* Row */}
              <div
                className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer select-none transition-transform duration-200 ${
                  isRevealed ? '-translate-x-20' : 'translate-x-0'
                } ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                onClick={() => setRevealedId(isRevealed ? null : t.id)}
              >
                {/* Emoji icon */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  {emoji}
                </div>

                {/* Description + meta */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    {t.description || 'Unnamed transaction'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {catLabel}
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {formatDate(t.date)}
                    </span>
                    {t.screenshotName && (
                      <span className={`text-xs ${darkMode ? 'text-purple-400' : 'text-purple-500'}`}>
                        📷
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <p
                  className={`text-sm font-bold flex-shrink-0 ${
                    isExpense ? 'text-red-500' : 'text-green-500'
                  }`}
                >
                  {isExpense ? '-' : '+'}{currency}{fmt(t.amount)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
