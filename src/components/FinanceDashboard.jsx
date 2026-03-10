import { useState, useEffect } from 'react'
import BalanceCard from './finance/BalanceCard.jsx'
import TransactionForm from './finance/TransactionForm.jsx'
import TransactionList from './finance/TransactionList.jsx'
import SpendingChart from './finance/SpendingChart.jsx'

const CURRENCIES = ['₹', '$', '€', '£', '¥']

export default function FinanceDashboard({ onClose, financeData, onUpdateFinance, onAddTransaction, onDeleteTransaction, darkMode }) {
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState('manual')   // 'manual' | 'screenshot'
  const [showSalaryPanel, setShowSalaryPanel] = useState(false)
  const [tempSalary, setTempSalary] = useState(String(financeData.salary))
  const [tempCurrency, setTempCurrency] = useState(financeData.currency)

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSaveSalary = () => {
    const val = parseFloat(tempSalary)
    if (isNaN(val) || val < 0) return
    onUpdateFinance({ salary: val, currency: tempCurrency })
    setShowSalaryPanel(false)
  }

  const handleAddTransaction = (txData) => {
    onAddTransaction(txData)
    setShowForm(false)
  }

  const handleDeleteTransaction = (id) => {
    onDeleteTransaction(id)
  }

  const openForm = (mode) => {
    setFormMode(mode)
    setShowForm(true)
    setShowSalaryPanel(false)
  }

  const inputCls = `px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors ${
    darkMode
      ? 'bg-gray-700 border-gray-600 text-gray-100'
      : 'bg-white border-gray-200 text-gray-800'
  }`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`w-full max-w-lg flex flex-col rounded-3xl shadow-2xl overflow-hidden ${
          darkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}
        style={{ height: '88vh', maxHeight: '780px' }}
      >
        {/* ── Header ── */}
        <div
          className="px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Finance Tracker</h2>
              <p className="text-white/60 text-xs leading-tight">
                {financeData.currency}{financeData.salary.toLocaleString('en-IN')} / month
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTempSalary(String(financeData.salary))
                setTempCurrency(financeData.currency)
                setShowSalaryPanel(s => !s)
                setShowForm(false)
              }}
              className="text-white/80 hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-white/20 transition-colors focus:outline-none"
              title="Configure salary"
            >
              ⚙️ Salary
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl leading-none focus:outline-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* ── Salary panel ── */}
        {showSalaryPanel && (
          <div
            className={`px-6 py-4 border-b flex-shrink-0 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-purple-50 border-purple-100'
            }`}
          >
            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-purple-700'}`}>
              Monthly Salary / Starting Balance
            </p>
            <div className="flex gap-2 items-center">
              {/* Currency selector */}
              <select
                className={`${inputCls} w-16`}
                value={tempCurrency}
                onChange={e => setTempCurrency(e.target.value)}
              >
                {CURRENCIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {/* Salary amount */}
              <input
                type="number"
                className={`${inputCls} flex-1`}
                placeholder="e.g. 10000"
                min="0"
                value={tempSalary}
                onChange={e => setTempSalary(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveSalary() }}
                autoFocus
              />
              <button
                onClick={handleSaveSalary}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors"
                style={{ background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%)' }}
              >
                Save
              </button>
            </div>
            <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              This sets your monthly starting balance for tracking.
            </p>
          </div>
        )}

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4">

          {/* Balance card */}
          <BalanceCard
            salary={financeData.salary}
            currency={financeData.currency}
            transactions={financeData.transactions}
            darkMode={darkMode}
          />

          {/* Action buttons — only show when form is closed */}
          {!showForm && (
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => openForm('screenshot')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                  darkMode
                    ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>📷</span>
                <span>From Screenshot</span>
              </button>
              <button
                onClick={() => openForm('manual')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
                style={{ background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%)' }}
              >
                <span>✏️</span>
                <span>Add Manual</span>
              </button>
            </div>
          )}

          {/* Transaction form */}
          {showForm && (
            <TransactionForm
              onSave={handleAddTransaction}
              onCancel={() => setShowForm(false)}
              darkMode={darkMode}
              initialMode={formMode}
            />
          )}

          {/* Spending chart */}
          <SpendingChart
            transactions={financeData.transactions}
            currency={financeData.currency}
            darkMode={darkMode}
          />

          {/* Transaction list */}
          <TransactionList
            transactions={financeData.transactions}
            currency={financeData.currency}
            onDelete={handleDeleteTransaction}
            darkMode={darkMode}
          />

          {/* Bottom padding so last item isn't clipped */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  )
}
