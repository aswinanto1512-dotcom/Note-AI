const CATEGORY_META = {
  food:          { emoji: '🍔', label: 'Food',          color: '#FF6B6B' },
  transport:     { emoji: '🚌', label: 'Transport',     color: '#4ECDC4' },
  shopping:      { emoji: '🛍️', label: 'Shopping',      color: '#45B7D1' },
  bills:         { emoji: '📱', label: 'Bills',         color: '#96CEB4' },
  health:        { emoji: '🏥', label: 'Health',        color: '#FFEAA7' },
  entertainment: { emoji: '🎬', label: 'Entertainment', color: '#DDA0DD' },
  salary:        { emoji: '💼', label: 'Salary',        color: '#A8D8A8' },
  other:         { emoji: '📦', label: 'Other',         color: '#B0BEC5' },
}

export default function SpendingChart({ transactions, currency, darkMode }) {
  // Only count expenses
  const expenses = transactions.filter(t => t.type === 'expense')

  if (expenses.length === 0) {
    return (
      <div className={`rounded-2xl p-5 mb-4 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <h3 className={`text-sm font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          Spending by Category
        </h3>
        <p className={`text-sm text-center py-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          No expenses recorded yet.
        </p>
      </div>
    )
  }

  // Aggregate by category
  const totals = {}
  for (const t of expenses) {
    totals[t.category] = (totals[t.category] || 0) + t.amount
  }

  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0)

  // Sort by amount descending
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1])

  const fmt = (n) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 })

  return (
    <div
      className={`rounded-2xl p-5 mb-4 border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}
    >
      <h3 className={`text-sm font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        Spending by Category
      </h3>
      <div className="flex flex-col gap-3">
        {sorted.map(([cat, total]) => {
          const meta = CATEGORY_META[cat] || CATEGORY_META.other
          const pct = grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0
          return (
            <div key={cat}>
              {/* Label row */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">{meta.emoji}</span>
                  <span className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {meta.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {pct}%
                  </span>
                  <span className={`text-xs font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {currency}{fmt(total)}
                  </span>
                </div>
              </div>
              {/* Bar */}
              <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: meta.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
