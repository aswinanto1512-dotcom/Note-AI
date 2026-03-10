import { useState, useRef, useEffect } from 'react'

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta'
const MODEL_PRIORITY = [
  'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash-8b',
  'gemini-1.5-pro', 'gemini-1.5-pro-latest', 'gemini-2.0-flash',
  'gemini-pro', 'gemini-1.0-pro',
]

let _cachedModel = null
const _failedModels = new Set()

async function resolveModel(apiKey) {
  if (_cachedModel && !_failedModels.has(_cachedModel)) return _cachedModel
  _cachedModel = null
  const res = await fetch(`${GEMINI_BASE}/models?key=${apiKey}`)
  const data = await res.json()
  const available = (data.models || [])
    .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
    .map(m => m.name.replace('models/', ''))
    .filter(m => !_failedModels.has(m))
  const picked = MODEL_PRIORITY.filter(m => !_failedModels.has(m)).find(m => available.includes(m))
    || available[0]
  if (!picked) throw new Error('All available Gemini models have exceeded their quota. Please create a new API key at aistudio.google.com.')
  _cachedModel = picked
  return picked
}

const STARTER_QUESTIONS = [
  { emoji: '💼', text: 'Summarize my work notes' },
  { emoji: '📅', text: 'What reminders do I have coming up?' },
  { emoji: '🛒', text: "What's on my shopping list?" },
  { emoji: '📓', text: 'What are my pinned notes about?' },
]

/**
 * Build a system prompt that includes all the user's notes as context.
 */
function buildSystemPrompt(notes) {
  const notesContext =
    notes.length > 0
      ? notes
          .map(
            (n) =>
              `[${n.category.toUpperCase()}${n.isPinned ? ' 📌' : ''}] ${n.title}\n${n.content}${
                n.dueDate
                  ? `\nDate: ${n.dueDate}${n.dueTime ? ` at ${n.dueTime}` : ''}`
                  : ''
              }`
          )
          .join('\n\n---\n\n')
      : '(No notes yet)'

  return `You are a helpful notebook assistant for AF Notebook. You have access to the user's notes below. Answer questions about their notes, help them find information, summarize, and provide helpful reminders.

USER'S NOTES:
${notesContext}

Be concise, helpful, and friendly. If the user asks about a specific note, quote the relevant part.`
}

/**
 * Call the Gemini API and return the assistant reply text.
 */
async function callGemini(apiKey, systemPrompt, chatHistory, userMessage, imageBase64 = null) {
  const model = await resolveModel(apiKey)
  // Build contents array using Gemini's user/model roles
  // Embed system prompt as first user/model turn (v1 API doesn't support system_instruction)
  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Understood. I have your notes and I am ready to help.' }] },
  ]

  chatHistory.forEach((msg) => {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })
  })

  // Build the current user turn — include inline image if provided
  const userParts = []
  userParts.push({ text: userMessage })
  if (imageBase64) {
    // Strip the data URL prefix (e.g. "data:image/jpeg;base64,") to get raw base64
    const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/)
    if (match) {
      userParts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2],
        },
      })
    }
  }

  contents.push({ role: 'user', parts: userParts })

  const response = await fetch(`${GEMINI_BASE}/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    const msg = err.error?.message || `API error ${response.status}`
    // If quota exceeded, blacklist this model and retry with next available
    if (response.status === 429 || msg.includes('quota') || msg.includes('Quota')) {
      _failedModels.add(model)
      _cachedModel = null
      return callGemini(apiKey, systemPrompt, chatHistory, userMessage, imageBase64)
    }
    throw new Error(msg)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
}

export default function AskAIModal({ onClose, apiKey, onSaveApiKey, notes, darkMode }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [tempKey, setTempKey] = useState(apiKey)

  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (apiKey) inputRef.current?.focus()
  }, [apiKey])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    if (!apiKey) {
      setShowApiKeyInput(true)
      return
    }

    const userMsg = { role: 'user', content: text }
    const updatedHistory = [...messages, userMsg]
    setMessages(updatedHistory)
    setInput('')
    setLoading(true)

    const systemPrompt = buildSystemPrompt(notes)

    // If there's exactly one note with an attached image, include it in the request
    // so the user can ask Gemini Vision about it
    let imageBase64 = null
    const notesWithImages = notes.filter((n) => n.attachedImage)
    if (notesWithImages.length === 1) {
      imageBase64 = notesWithImages[0].attachedImage
    }

    try {
      const reply = await callGemini(apiKey, systemPrompt, messages, text, imageBase64)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err.message}. Please check your API key and try again.`,
          isError: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSaveKey = () => {
    _cachedModel = null
    _failedModels.clear() // clear failed models so new key gets a fresh start
    onSaveApiKey(tempKey.trim())
    setShowApiKeyInput(false)
  }

  const handleStarterClick = (text) => {
    setInput(text)
    inputRef.current?.focus()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{ height: '75vh', maxHeight: '600px' }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%)' }}
        >
          <div>
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <span>✨</span> Ask AI
            </h2>
            <p className="text-white/70 text-xs">Powered by Google Gemini (free)</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowApiKeyInput((s) => !s)}
              className="text-white/70 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/20 transition-colors focus:outline-none"
              title="Configure API key"
            >
              ⚙️ API Key
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

        {/* API Key config panel */}
        {showApiKeyInput && (
          <div className="px-6 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 flex-shrink-0">
            <p className="text-xs text-yellow-700 dark:text-yellow-300 font-semibold mb-1">
              Google Gemini API Key
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-2">
              Get a free key at aistudio.google.com
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="AIza..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveKey() }}
              />
              <button
                onClick={handleSaveKey}
                className="px-3 py-1.5 rounded-lg bg-yellow-500 text-white text-sm font-semibold hover:bg-yellow-600 transition-colors focus:outline-none"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 chat-scroll">

          {/* No API key — friendly onboarding state */}
          {messages.length === 0 && !apiKey && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-4">
              <span className="text-5xl">🤖</span>
              <p className="text-gray-700 dark:text-gray-200 font-semibold">
                Ask AI is powered by Google Gemini (free!)
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Get your free API key at: aistudio.google.com
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Then paste it below to get started.
              </p>
              <button
                onClick={() => setShowApiKeyInput(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
                style={{ background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%)' }}
              >
                Enter API Key
              </button>
            </div>
          )}

          {/* Has API key but no messages yet — show starter suggestions */}
          {messages.length === 0 && apiKey && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-4">
              <span className="text-5xl">✨</span>
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                Hi! Ask me anything about your notes.
              </p>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q.text}
                    onClick={() => handleStarterClick(q.text)}
                    className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left focus:outline-none"
                  >
                    {q.emoji} {q.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%)' }}
                >
                  ✨
                </div>
              )}
              <div
                className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'text-white rounded-br-md'
                    : msg.isError
                    ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-bl-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
                }`}
                style={
                  msg.role === 'user'
                    ? { background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%)' }
                    : {}
                }
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mr-2"
                style={{ background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%)' }}
              >
                ✨
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1 items-center">
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="px-4 pb-4 pt-2 flex-shrink-0 border-t border-gray-100 dark:border-gray-700">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={apiKey ? 'Ask about your notes...' : 'Configure API key first...'}
              disabled={!apiKey || loading}
              rows={1}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none transition-colors disabled:opacity-50"
              style={{ minHeight: '42px', maxHeight: '120px' }}
              onInput={(e) => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || loading || !apiKey}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg transition-opacity focus:outline-none focus:ring-2 focus:ring-purple-400 flex-shrink-0 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%)' }}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1.5 text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
