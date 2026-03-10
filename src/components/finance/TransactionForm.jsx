import { useState, useRef } from 'react'
import { extractTextFromFile } from '../../utils/documentReader.js'
import { parseTransactionFromOCR } from '../../utils/parseTransactionOCR.js'

const CATEGORIES = [
  { value: 'food',          label: 'Food',          emoji: '🍔' },
  { value: 'transport',     label: 'Transport',     emoji: '🚌' },
  { value: 'shopping',      label: 'Shopping',      emoji: '🛍️' },
  { value: 'bills',         label: 'Bills',         emoji: '📱' },
  { value: 'health',        label: 'Health',        emoji: '🏥' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { value: 'salary',        label: 'Salary',        emoji: '💼' },
  { value: 'other',         label: 'Other',         emoji: '📦' },
]

const TODAY = new Date().toISOString().split('T')[0]

const EMPTY_FORM = {
  description: '',
  amount: '',
  type: 'expense',
  category: 'other',
  date: TODAY,
}

export default function TransactionForm({ onSave, onCancel, darkMode, initialMode = 'manual' }) {
  const [mode, setMode] = useState(initialMode) // 'manual' | 'screenshot'
  const [form, setForm] = useState(EMPTY_FORM)
  const [autoDetected, setAutoDetected] = useState({}) // which fields were auto-filled
  const [ocrProgress, setOcrProgress] = useState(null) // null | 0-100
  const [ocrError, setOcrError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const set = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleFile = async (file) => {
    if (!file) return
    setOcrError('')
    setOcrProgress(0)
    try {
      const { text } = await extractTextFromFile(file, (p) => setOcrProgress(p))
      setOcrProgress(100)
      const parsed = parseTransactionFromOCR(text, file.name)
      // Pre-fill any detected fields
      const detected = {}
      const updated = { ...EMPTY_FORM }
      if (parsed.amount !== null) { updated.amount = String(parsed.amount); detected.amount = true }
      if (parsed.description)     { updated.description = parsed.description; detected.description = true }
      if (parsed.type)            { updated.type = parsed.type; detected.type = true }
      if (parsed.category)        { updated.category = parsed.category; detected.category = true }
      if (parsed.date)            { updated.date = parsed.date; detected.date = true }
      setForm(prev => ({ ...prev, ...updated, screenshotName: file.name }))
      setAutoDetected(detected)
      // Switch to manual mode so user can review and save
      setMode('review')
    } catch (err) {
      setOcrError(err.message || 'Could not read file. Try a clearer screenshot.')
      setOcrProgress(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleFileInput = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0) return
    onSave({
      description: form.description.trim() || 'Unnamed',
      amount,
      type: form.type,
      category: form.category,
      date: form.date || TODAY,
      screenshotName: form.screenshotName || null,
    })
  }

  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors ${
    darkMode
      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500'
      : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
  }`

  const labelCls = `block text-xs font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`

  const AutoBadge = ({ field }) =>
    autoDetected[field] ? (
      <span className="ml-1.5 text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-medium">
        auto
      </span>
    ) : null

  return (
    <div
      className={`rounded-2xl border p-5 mb-4 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}
    >
      {/* Mode tabs */}
      {mode !== 'review' && (
        <div className={`flex gap-2 mb-4 p-1 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <button
            type="button"
            onClick={() => setMode('screenshot')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors focus:outline-none ${
              mode === 'screenshot'
                ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-300 shadow-sm'
                : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📷 From Screenshot
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors focus:outline-none ${
              mode === 'manual'
                ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-300 shadow-sm'
                : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ✏️ Manual Entry
          </button>
        </div>
      )}

      {/* Screenshot upload panel */}
      {mode === 'screenshot' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/bmp,image/gif"
            className="hidden"
            onChange={handleFileInput}
          />
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : darkMode
                ? 'border-gray-600 hover:border-purple-500'
                : 'border-gray-200 hover:border-purple-400'
            }`}
          >
            <p className="text-4xl mb-2">📷</p>
            <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Drop screenshot here or click to upload
            </p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              PNG, JPG, WEBP supported · OCR auto-detects amount &amp; details
            </p>
          </div>

          {/* OCR progress */}
          {ocrProgress !== null && ocrProgress < 100 && (
            <div className="mt-3">
              <div className="flex justify-between mb-1">
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Reading screenshot...
                </span>
                <span className={`text-xs font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {ocrProgress}%
                </span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div
                  className="h-full rounded-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
            </div>
          )}

          {ocrError && (
            <p className="mt-2 text-xs text-red-500 text-center">{ocrError}</p>
          )}
        </div>
      )}

      {/* Manual entry form (and review mode after OCR) */}
      {(mode === 'manual' || mode === 'review') && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'review' && (
            <div className="flex items-center gap-2 mb-1 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/20">
              <span className="text-purple-500">✓</span>
              <p className="text-xs text-purple-600 dark:text-purple-300 font-semibold">
                Auto-detected from screenshot. Review and save.
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <label className={labelCls}>
              Description <AutoBadge field="description" />
            </label>
            <input
              type="text"
              className={inputCls}
              placeholder="e.g. Swiggy Order, Electricity Bill"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {/* Amount */}
          <div>
            <label className={labelCls}>
              Amount <AutoBadge field="amount" />
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="0.00"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              required
            />
          </div>

          {/* Type toggle */}
          <div>
            <label className={labelCls}>
              Type <AutoBadge field="type" />
            </label>
            <div className={`flex gap-2 p-1 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              {['expense', 'income'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('type', t)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors focus:outline-none ${
                    form.type === t
                      ? t === 'expense'
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'bg-green-500 text-white shadow-sm'
                      : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t === 'expense' ? '💸 Expense' : '💰 Income'}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>
              Category <AutoBadge field="category" />
            </label>
            <select
              className={inputCls}
              value={form.category}
              onChange={e => set('category', e.target.value)}
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className={labelCls}>
              Date <AutoBadge field="date" />
            </label>
            <input
              type="date"
              className={inputCls}
              value={form.date}
              onChange={e => set('date', e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={onCancel}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors focus:outline-none ${
                darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
              style={{ background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%)' }}
            >
              Save Transaction
            </button>
          </div>
        </form>
      )}

      {/* Cancel button for screenshot mode */}
      {mode === 'screenshot' && (
        <div className="mt-3">
          <button
            type="button"
            onClick={onCancel}
            className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors focus:outline-none ${
              darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
