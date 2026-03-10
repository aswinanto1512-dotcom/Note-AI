import { useState, useEffect, useCallback, useRef } from 'react'
import Header from './components/Header.jsx'
import SearchBar from './components/SearchBar.jsx'
import CategoryTabs from './components/CategoryTabs.jsx'
import CategoryStats from './components/CategoryStats.jsx'
import NotesGrid from './components/NotesGrid.jsx'
import NoteModal from './components/NoteModal.jsx'
import AskAIModal from './components/AskAIModal.jsx'
import VoiceRecordModal from './components/VoiceRecordModal.jsx'
import NotificationBanner from './components/NotificationBanner.jsx'
import FinanceDashboard from './components/FinanceDashboard.jsx'
import {
  registerServiceWorker,
  checkAndNotify,
  syncNotesToServiceWorker,
  scheduleAllTimedNotifications,
} from './utils/notifications.js'
import {
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
} from './utils/notesService.js'
import {
  fetchFinanceSettings,
  upsertFinanceSettings,
  fetchTransactions,
  createTransaction,
  deleteTransaction,
} from './utils/financeService.js'

const STORAGE_KEY = 'af-notebook-notes'
const DARK_MODE_KEY = 'af-notebook-dark'
const AI_KEY_STORAGE = 'gemini_api_key'
const FINANCE_KEY = 'af_finance'

// Build sample transactions seeded relative to today
function buildSampleTransactions() {
  const today = new Date()
  const fmt = (d) => d.toISOString().split('T')[0]
  const daysAgo = (n) => {
    const d = new Date(today)
    d.setDate(d.getDate() - n)
    return fmt(d)
  }
  const firstOfMonth = fmt(new Date(today.getFullYear(), today.getMonth(), 1))
  return [
    {
      id: crypto.randomUUID(),
      description: 'Monthly Salary',
      amount: 10000,
      type: 'income',
      category: 'salary',
      date: firstOfMonth,
      screenshotName: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      description: 'Swiggy Order',
      amount: 250,
      type: 'expense',
      category: 'food',
      date: daysAgo(3),
      screenshotName: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      description: 'Electricity Bill',
      amount: 800,
      type: 'expense',
      category: 'bills',
      date: daysAgo(5),
      screenshotName: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      description: 'Uber Ride',
      amount: 150,
      type: 'expense',
      category: 'transport',
      date: daysAgo(1),
      screenshotName: null,
      createdAt: new Date().toISOString(),
    },
  ]
}

const DEFAULT_FINANCE = {
  salary: 10000,
  currency: '₹',
  transactions: buildSampleTransactions(),
}

function loadFinanceFromLocalStorage() {
  try {
    const raw = localStorage.getItem(FINANCE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') return parsed
    }
  } catch {
    // ignore
  }
  return DEFAULT_FINANCE
}

const DEFAULT_NOTES = [
  {
    id: crypto.randomUUID(),
    title: "Mom's Birthday",
    content: "March 15 - Don't forget to order cake 🎂",
    category: 'reminder',
    isPinned: true,
    dueDate: '2026-03-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Passport Info',
    content: 'Passport No: XXXXXXXX Expiry: 2030',
    category: 'personal',
    isPinned: true,
    dueDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Grocery List',
    content: 'Milk, Eggs, Bread, Butter, Coffee',
    category: 'shopping',
    isPinned: false,
    dueDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Meeting Notes',
    content: 'Q1 review meeting at 10am. Prepare slides.',
    category: 'work',
    isPinned: false,
    dueDate: '2026-03-12',
    dueTime: '10:00',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Voice Memo #1',
    content: 'Remember to call the doctor tomorrow morning.',
    category: 'voice-notes',
    isPinned: false,
    dueDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

function loadNotesFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore
  }
  return DEFAULT_NOTES
}

function loadDarkMode() {
  try {
    return localStorage.getItem(DARK_MODE_KEY) === 'true'
  } catch {
    return false
  }
}

export default function App() {
  // Notes start empty; populated asynchronously from Supabase or localStorage.
  const [notes, setNotes] = useState([])
  const [darkMode, setDarkMode] = useState(() => loadDarkMode())
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [voiceModalOpen, setVoiceModalOpen] = useState(false)
  const [aiApiKey, setAiApiKey] = useState(() => {
    try { return localStorage.getItem(AI_KEY_STORAGE) || '' } catch { return '' }
  })
  const [financeOpen, setFinanceOpen] = useState(false)
  // Finance starts with the localStorage snapshot; Supabase load will overwrite it.
  const [financeData, setFinanceData] = useState(() => loadFinanceFromLocalStorage())
  const [notifPermission, setNotifPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission // 'default' | 'granted' | 'denied'
    }
    return 'unsupported'
  })

  // Holds the setTimeout IDs for timed (date + time) notifications so they can
  // be cancelled when notes change or the component unmounts.
  const scheduledTimeoutsRef = useRef([])

  // Stores the Supabase UUID of the finance_settings row so we can update (not
  // insert) it on subsequent saves.
  const financeSettingsIdRef = useRef(null)

  // ── Load notes on mount (Supabase first, localStorage fallback) ────────────
  useEffect(() => {
    async function loadNotes() {
      try {
        const dbNotes = await fetchNotes()
        if (dbNotes !== null) {
          setNotes(dbNotes)
          // Mirror to localStorage so the app works offline after first load.
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(dbNotes)) } catch {}
          return
        }
      } catch (e) {
        console.error('Supabase notes load failed, falling back to localStorage:', e)
      }
      setNotes(loadNotesFromLocalStorage())
    }
    loadNotes()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep localStorage in sync whenever notes change (offline safety net).
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)) } catch {}
  }, [notes])

  // Persist dark mode
  useEffect(() => {
    try { localStorage.setItem(DARK_MODE_KEY, String(darkMode)) } catch {}
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Persist AI key
  useEffect(() => {
    try { localStorage.setItem(AI_KEY_STORAGE, aiApiKey) } catch {}
  }, [aiApiKey])

  // ── Load finance data on mount (Supabase first, localStorage fallback) ─────
  useEffect(() => {
    async function loadFinance() {
      try {
        const [settings, transactions] = await Promise.all([
          fetchFinanceSettings(),
          fetchTransactions(),
        ])
        if (settings !== null && transactions !== null) {
          const merged = {
            salary: settings.salary,
            currency: settings.currency,
            transactions,
          }
          financeSettingsIdRef.current = settings.id
          setFinanceData(merged)
          try { localStorage.setItem(FINANCE_KEY, JSON.stringify(merged)) } catch {}
          return
        }
      } catch (e) {
        console.error('Supabase finance load failed, falling back to localStorage:', e)
      }
      setFinanceData(loadFinanceFromLocalStorage())
    }
    loadFinance()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep localStorage in sync whenever finance data changes.
  useEffect(() => {
    try { localStorage.setItem(FINANCE_KEY, JSON.stringify(financeData)) } catch {}
  }, [financeData])

  const handleUpdateFinance = useCallback((partial) => {
    setFinanceData(prev => {
      const next = { ...prev, ...partial }

      // Persist salary/currency changes to Supabase when they are included.
      if ('salary' in partial || 'currency' in partial) {
        upsertFinanceSettings(next.salary, next.currency, financeSettingsIdRef.current)
          .then(async () => {
            // If we just inserted a new row, refresh the id for future updates.
            if (!financeSettingsIdRef.current) {
              try {
                const settings = await fetchFinanceSettings()
                if (settings) financeSettingsIdRef.current = settings.id
              } catch { /* non-critical */ }
            }
          })
          .catch(e => console.error('Supabase finance settings save failed:', e))
      }

      return next
    })
  }, [])

  const handleAddTransaction = useCallback((txData) => {
    const newTx = {
      id: crypto.randomUUID(),
      ...txData,
      createdAt: new Date().toISOString(),
    }
    // Optimistic UI update.
    setFinanceData(prev => ({ ...prev, transactions: [newTx, ...prev.transactions] }))
    // Persist to Supabase in the background.
    createTransaction(newTx).catch(e => console.error('Supabase transaction create failed:', e))
  }, [])

  const handleDeleteTransaction = useCallback((id) => {
    // Optimistic UI update.
    setFinanceData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id),
    }))
    // Persist deletion to Supabase in the background.
    deleteTransaction(id).catch(e => console.error('Supabase transaction delete failed:', e))
  }, [])

  // Register service worker once on mount.
  useEffect(() => {
    registerServiceWorker()
  }, [])

  // Check notes against today's date on mount and every 60 minutes.
  // Also syncs the notes list to the service worker for background use.
  useEffect(() => {
    checkAndNotify(notes)
    syncNotesToServiceWorker(notes)

    const interval = setInterval(() => {
      checkAndNotify(notes)
    }, 60 * 60 * 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-check whenever the notes array changes (new note added, date edited, etc.).
  useEffect(() => {
    checkAndNotify(notes)
    syncNotesToServiceWorker(notes)
  }, [notes])

  // Schedule (or re-schedule) precise timed notifications whenever notes change.
  // Previous timeouts are always cleared first to avoid stale duplicates.
  useEffect(() => {
    // Cancel any previously scheduled timed notifications.
    scheduledTimeoutsRef.current.forEach(t => clearTimeout(t.timeoutId))
    // Schedule fresh timeouts for all notes that carry a dueDate + dueTime.
    scheduledTimeoutsRef.current = scheduleAllTimedNotifications(notes)

    return () => {
      // Cleanup on unmount.
      scheduledTimeoutsRef.current.forEach(t => clearTimeout(t.timeoutId))
    }
  }, [notes])

  const handleSaveNote = useCallback((noteData) => {
    if (editingNote) {
      const updatedNote = { ...editingNote, ...noteData, updatedAt: new Date().toISOString() }
      // Optimistic UI update.
      setNotes(prev => prev.map(n => n.id === editingNote.id ? updatedNote : n))
      // Persist to Supabase in the background.
      updateNote(updatedNote).catch(e => console.error('Supabase note update failed:', e))
    } else {
      const newNote = {
        id: crypto.randomUUID(),
        ...noteData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      // Optimistic UI update.
      setNotes(prev => [newNote, ...prev])
      // Persist to Supabase in the background.
      createNote(newNote).catch(e => console.error('Supabase note create failed:', e))
    }
    setModalOpen(false)
    setEditingNote(null)
  }, [editingNote])

  const handleDeleteNote = useCallback((id) => {
    // Optimistic UI update.
    setNotes(prev => prev.filter(n => n.id !== id))
    setModalOpen(false)
    setEditingNote(null)
    // Persist deletion to Supabase in the background.
    deleteNote(id).catch(e => console.error('Supabase note delete failed:', e))
  }, [])

  const handleTogglePin = useCallback((id) => {
    setNotes(prev => {
      const next = prev.map(n =>
        n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() } : n
      )
      // Persist the toggled note to Supabase in the background.
      const toggled = next.find(n => n.id === id)
      if (toggled) updateNote(toggled).catch(e => console.error('Supabase pin toggle failed:', e))
      return next
    })
  }, [])

  const handleOpenAdd = () => {
    setEditingNote(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (note) => {
    setEditingNote(note)
    setModalOpen(true)
  }

  const handleVoiceNoteSave = useCallback((transcribedText) => {
    const voiceCount = notes.filter(n => n.category === 'voice-notes').length
    const newNote = {
      id: crypto.randomUUID(),
      title: `Voice Memo #${voiceCount + 1}`,
      content: transcribedText,
      category: 'voice-notes',
      isPinned: false,
      dueDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    // Optimistic UI update.
    setNotes(prev => [newNote, ...prev])
    setVoiceModalOpen(false)
    // Persist to Supabase in the background.
    createNote(newNote).catch(e => console.error('Supabase voice note create failed:', e))
  }, [notes])

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingNote(null)
  }

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch =
      search === '' ||
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      activeCategory === 'all' || note.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const pinnedNotes = filteredNotes.filter(n => n.isPinned)
  const otherNotes = filteredNotes.filter(n => !n.isPinned)

  const totalNotes = notes.length
  const categoryCount = [...new Set(notes.map(n => n.category))].length

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen transition-colors duration-200 bg-transparent">
        <Header
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(d => !d)}
          onOpenAI={() => setAiModalOpen(true)}
          onOpenVoice={() => setVoiceModalOpen(true)}
          totalNotes={totalNotes}
          categoryCount={categoryCount}
          notifPermission={notifPermission}
          onNotifPermissionChange={setNotifPermission}
          onOpenFinance={() => setFinanceOpen(true)}
        />

        <NotificationBanner
          notes={notes}
          onPermissionChange={setNotifPermission}
        />

        <SearchBar search={search} onSearch={setSearch} darkMode={darkMode} />

        <main className="relative z-10 max-w-5xl mx-auto px-4 py-6 flex flex-col gap-5">
          <CategoryTabs
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
            notes={notes}
            darkMode={darkMode}
          />

          <CategoryStats notes={notes} darkMode={darkMode} />

          <NotesGrid
            pinnedNotes={pinnedNotes}
            otherNotes={otherNotes}
            onEditNote={handleOpenEdit}
            onTogglePin={handleTogglePin}
            darkMode={darkMode}
          />
        </main>

        {/* FAB */}
        <button
          onClick={handleOpenAdd}
          className="fixed bottom-6 right-6 z-40 group focus:outline-none"
          aria-label="New Note"
        >
          {/* Outer glow ring - pulses on hover */}
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #4F46E5, #06B6D4)',
              filter: 'blur(12px)',
              transform: 'scale(1.3)',
            }}
          />
          {/* Main button */}
          <div
            className="relative flex items-center gap-2 px-5 py-3.5 rounded-full shadow-2xl text-white font-bold text-sm transition-all duration-300 group-hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 50%, #06B6D4 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 3s ease infinite',
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.4)',
            }}
          >
            {/* Animated + icon with rotation on hover */}
            <span className="text-xl font-light transition-transform duration-300 group-hover:rotate-90 inline-block">
              +
            </span>
            <span className="tracking-wide">New Note</span>
            {/* Shimmer overlay */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, white 50%, transparent 60%)',
                  animation: 'shimmer 1.5s ease infinite',
                }}
              />
            </div>
          </div>
        </button>

        {modalOpen && (
          <NoteModal
            note={editingNote}
            onSave={handleSaveNote}
            onDelete={handleDeleteNote}
            onClose={handleCloseModal}
            darkMode={darkMode}
          />
        )}

        {aiModalOpen && (
          <AskAIModal
            onClose={() => setAiModalOpen(false)}
            apiKey={aiApiKey}
            onSaveApiKey={setAiApiKey}
            notes={notes}
            darkMode={darkMode}
          />
        )}

        {voiceModalOpen && (
          <VoiceRecordModal
            onSave={handleVoiceNoteSave}
            onClose={() => setVoiceModalOpen(false)}
            darkMode={darkMode}
          />
        )}

        {financeOpen && (
          <FinanceDashboard
            onClose={() => setFinanceOpen(false)}
            financeData={financeData}
            onUpdateFinance={handleUpdateFinance}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  )
}
