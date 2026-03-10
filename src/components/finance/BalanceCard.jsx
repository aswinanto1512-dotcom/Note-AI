export default function BalanceCard({ salary, currency, transactions, darkMode }) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Filter to transactions in the current month
  const monthlyTransactions = transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const totalExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  // Extra income this month (not counting the configured salary — that's the baseline)
  const extraIncome = monthlyTransactions
    .filter(t => t.type === 'income' && t.category !== 'salary')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = salary + extraIncome - totalExpenses
  const isNegative = balance < 0

  const spentRatio = salary > 0 ? Math.min(totalExpenses / salary, 1) : 0
  const barPercent = Math.round(spentRatio * 100)
  const barDanger = barPercent >= 80

  const fmt = (n) =>
    n.toLocaleString('en-IN', { maximumFractionDigits: 0 })

  return (
    <div
      className={`rounded-2xl p-5 mb-4 shadow-sm border ${
        darkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-100'
      }`}
    >
      {/* Big balance */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Available Balance
          </p>
          <p
            className={`text-4xl font-bold leading-none ${
              isNegative
                ? 'text-red-500'
                : 'text-green-500'
            }`}
          >
            {isNegative ? '-' : ''}{currency}{fmt(Math.abs(balance))}
          </p>
        </div>
        <span className="text-4xl select-none">💳</span>
      </div>

      {/* Row: salary / spent / extra income */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <div>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monthly Salary</p>
          <p className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            {currency}{fmt(salary)}
          </p>
        </div>
        <div>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Spent</p>
          <p className="text-sm font-semibold text-red-500">
            {currency}{fmt(totalExpenses)}
          </p>
        </div>
        {extraIncome > 0 && (
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Extra Income</p>
            <p className="text-sm font-semibold text-green-500">
              +{currency}{fmt(extraIncome)}
            </p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {salary > 0 && (
        <div>
          <div className="flex justify-between mb-1">
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Spent {barPercent}% of salary
            </span>
            <span
              className={`text-xs font-semibold ${barDanger ? 'text-red-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {barDanger ? 'High spending!' : `${currency}${fmt(salary - totalExpenses)} remaining`}
            </span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                barDanger ? 'bg-red-500' : 'bg-purple-500'
              }`}
              style={{ width: `${barPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
