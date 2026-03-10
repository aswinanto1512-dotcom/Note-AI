import { useState, useEffect, useRef } from 'react'
import VoiceRecordModal from './VoiceRecordModal.jsx'
import { extractTextFromFile } from '../utils/documentReader.js'

const CATEGORIES = [
  { value: 'voice-notes', label: 'Voice Notes', emoji: '🎤' },
  { value: 'work', label: 'Work', emoji: '💼' },
  { value: 'reminder', label: 'Reminder', emoji: '⏰' },
  { value: 'shopping', label: 'Shopping', emoji: '🛒' },
  { value: 'personal', label: 'Personal', emoji: '🔒' },
]

const ACCEPTED_TYPES = '.txt,.md,.pdf,.png,.jpg,.jpeg,.webp,.bmp,.gif,.docx'

export default function NoteModal({ note, onSave, onDelete, onClose, darkMode }) {
  const isEditing = Boolean(note)

  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [category, setCategory] = useState(note?.category || 'work')
  const [dueDate, setDueDate] = useState(note?.dueDate || '')
  const [dueTime, setDueTime] = useState(note?.dueTime || '')
  const [isPinned, setIsPinned] = useState(note?.isPinned || false)
  const [voiceModalOpen, setVoiceModalOpen] = useState(false)

  // Document upload state
  const [attachedFileName, setAttachedFileName] = useState(note?.attachedFileName || null)
  const [attachedImage, setAttachedImage] = useState(note?.attachedImage || null)
  const [fileLoading, setFileLoading] = useState(false)
  const [fileError, setFileError] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(null) // null = not running, 0-100 = in progress

  const titleRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() && !content.trim()) return
    onSave({
      title: title.trim(),
      content: content.trim(),
      category,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      isPinned,
      attachedImage: attachedImage || null,
      attachedFileName: attachedFileName || null,
    })
  }

  const handleDelete = () => {
    if (window.confirm('Delete this note?')) {
      onDelete(note.id)
    }
  }

  const handleVoiceInsert = (transcribedText) => {
    setContent(prev => prev ? prev + '\n' + transcribedText : transcribedText)
    setCategory('voice-notes')
    setVoiceModalOpen(false)
  }

  const processFile = async (file) => {
    setFileError(null)
    setFileLoading(true)
    setOcrProgress(null)

    const ext = file.name.split('.').pop().toLowerCase()
    const isImageFile = ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif'].includes(ext)

    if (isImageFile) {
      setOcrProgress(0)
    }

    try {
      const result = await extractTextFromFile(file, (progress) => {
        setOcrProgress(progress)
      })

      if (result.isImage) {
        // Store base64 thumbnail
        setAttachedImage(result.base64)
        setAttachedFileName(file.name)

        if (result.text) {
          // Append OCR-extracted text to content
          const separator = `\n\n--- Extracted from: ${file.name} (OCR) ---\n`
          setContent(prev => prev ? prev + separator + result.text : result.text)
        } else {
          setFileError('No text found in image')
        }
      } else {
        // Text-based document — append to content
        const separator = `\n\n--- Extracted from: ${file.name} ---\n`
        setContent(prev => prev ? prev + separator + result.text : result.text)
        setAttachedFileName(file.name)
        setAttachedImage(null)
      }
    } catch (err) {
      setFileError(err.message)
    } finally {
      setFileLoading(false)
      setOcrProgress(null)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    // Reset so same file can be re-selected if removed
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const handleRemoveAttachment = () => {
    setAttachedFileName(null)
    setAttachedImage(null)
    setFileError(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%)' }}
        >
          <h2 className="text-white font-bold text-lg">
            {isEditing ? 'Edit Note' : 'New Note'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl leading-none focus:outline-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Title
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors"
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Content
              </label>
              <button
                type="button"
                onClick={() => setVoiceModalOpen(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
                aria-label="Record voice note"
                title="Record voice and transcribe to text"
              >
                <span>🎤</span>
                <span>Voice</span>
              </button>
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your note..."
              rows={5}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none transition-colors"
            />
          </div>

          {/* Document Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Attach Document <span className="font-normal normal-case text-gray-400">(optional)</span>
            </label>

            {/* Filename chip — shown after a file is attached */}
            {attachedFileName && !fileLoading && (
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-700">
                  <span>📄</span>
                  <span className="max-w-[200px] truncate">{attachedFileName}</span>
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="ml-0.5 text-purple-500 hover:text-red-500 transition-colors focus:outline-none leading-none"
                    aria-label="Remove attachment"
                  >
                    ✕
                  </button>
                </span>
              </div>
            )}

            {/* Image thumbnail preview */}
            {attachedImage && (
              <div className="mb-2 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 max-h-40">
                <img
                  src={attachedImage}
                  alt="Attached"
                  className="w-full h-40 object-contain bg-gray-50 dark:bg-gray-700"
                />
              </div>
            )}

            {/* Drop zone — hidden if file is already attached */}
            {!attachedFileName && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  w-full border-2 border-dashed rounded-xl px-4 py-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors select-none
                  ${dragOver
                    ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  }
                `}
              >
                {fileLoading ? (
                  ocrProgress !== null ? (
                    // OCR progress UI
                    <div className="w-full flex flex-col items-center gap-2 px-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        🔍 Reading text from image...
                      </span>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${ocrProgress}%` }}
                        />
                      </div>
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                        {ocrProgress}%
                      </span>
                    </div>
                  ) : (
                    // Generic file-reading spinner
                    <>
                      <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Reading file...</span>
                    </>
                  )
                ) : (
                  <>
                    <span className="text-xl">📎</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Drop a file here or click to browse
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Supports: PDF, TXT, DOCX, Images (PNG, JPG, WEBP, BMP, GIF)
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload document"
            />

            {/* Error message */}
            {fileError && (
              <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{fileError}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors appearance-none cursor-pointer"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reminder Date + Time */}
          <div>
            <div className="flex items-end gap-3">
              {/* Date */}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Reminder Date 📅 <span className="font-normal normal-case text-gray-400">(optional)</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors cursor-pointer"
                />
              </div>

              {/* Time */}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Time ⏰ <span className="font-normal normal-case text-gray-400">(optional)</span>
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={e => setDueTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors cursor-pointer"
                />
              </div>
            </div>

            {(dueDate || dueTime) && (
              <button
                type="button"
                onClick={() => { setDueDate(''); setDueTime('') }}
                className="mt-1 text-xs text-red-400 hover:text-red-600 focus:outline-none"
              >
                Remove reminder
              </button>
            )}
          </div>

          {/* Pin toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={e => setIsPinned(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-10 h-5 rounded-full transition-colors duration-200 ${
                  isPinned ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                  isPinned ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              📌 Pin this note
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                className="py-2.5 px-4 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-500 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                🗑 Delete
              </button>
            )}

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
              style={{ background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%)' }}
            >
              {isEditing ? 'Save Changes' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>

      {voiceModalOpen && (
        <VoiceRecordModal
          onSave={handleVoiceInsert}
          onClose={() => setVoiceModalOpen(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  )
}
