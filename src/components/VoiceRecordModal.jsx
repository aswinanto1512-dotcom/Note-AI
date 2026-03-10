import { useState, useEffect, useRef, useCallback } from 'react'

export default function VoiceRecordModal({ onSave, onClose, darkMode }) {
  const [isSupported, setIsSupported] = useState(true)
  const [status, setStatus] = useState('idle') // idle | recording | stopped | error
  const [errorType, setErrorType] = useState(null) // null | 'unsupported' | 'denied' | 'network' | 'silence'
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [silenceTimer, setSilenceTimer] = useState(null)

  const recognitionRef = useRef(null)
  const timerRef = useRef(null)
  const silenceRef = useRef(null)
  const finalTranscriptRef = useRef('')

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
      setStatus('error')
      setErrorType('unsupported')
    }
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        stopRecording()
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      clearTimeout(silenceRef.current)
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch {}
      }
    }
  }, [])

  const resetSilenceTimer = useCallback(() => {
    clearTimeout(silenceRef.current)
    silenceRef.current = setTimeout(() => {
      // 10 seconds of silence — stop and notify
      stopRecording()
      setStatus('stopped')
      setErrorType('silence')
    }, 10000)
  }, [])

  const startRecording = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    finalTranscriptRef.current = ''
    setTranscript('')
    setInterimTranscript('')
    setElapsed(0)
    setErrorType(null)

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setStatus('recording')
      // Start elapsed timer
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1)
      }, 1000)
      resetSilenceTimer()
    }

    recognition.onresult = (event) => {
      resetSilenceTimer()
      let interim = ''
      let finalPart = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalPart += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }

      if (finalPart) {
        finalTranscriptRef.current += finalPart
        setTranscript(finalTranscriptRef.current)
      }
      setInterimTranscript(interim)
    }

    recognition.onerror = (event) => {
      clearInterval(timerRef.current)
      clearTimeout(silenceRef.current)
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setStatus('error')
        setErrorType('denied')
      } else if (event.error === 'network') {
        setStatus('error')
        setErrorType('network')
      } else if (event.error === 'no-speech') {
        // Handled by silence timer, ignore here
      } else {
        setStatus('error')
        setErrorType('network')
      }
    }

    recognition.onend = () => {
      clearInterval(timerRef.current)
      clearTimeout(silenceRef.current)
      setInterimTranscript('')
      if (status !== 'error') {
        setStatus(prev => (prev === 'recording' ? 'stopped' : prev))
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch {
      setStatus('error')
      setErrorType('network')
    }
  }, [resetSilenceTimer, status])

  const stopRecording = useCallback(() => {
    clearInterval(timerRef.current)
    clearTimeout(silenceRef.current)
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
    }
    setInterimTranscript('')
    setStatus('stopped')
  }, [])

  const handleReRecord = () => {
    setStatus('idle')
    setTranscript('')
    setInterimTranscript('')
    setElapsed(0)
    setErrorType(null)
    finalTranscriptRef.current = ''
  }

  const handleSave = () => {
    const finalText = transcript.trim()
    if (!finalText) return
    onSave(finalText)
  }

  // Format elapsed seconds to MM:SS
  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0')
    const s = String(seconds % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  const displayTranscript = transcript + (interimTranscript ? ' ' + interimTranscript : '')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) { stopRecording(); onClose() } }}
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl leading-none">🎤</span>
            <h2 className="text-white font-bold text-lg">Voice Recorder</h2>
          </div>
          <button
            onClick={() => { stopRecording(); onClose() }}
            className="text-white/80 hover:text-white text-2xl leading-none focus:outline-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">

          {/* Unsupported browser */}
          {errorType === 'unsupported' && (
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 p-4 text-center">
              <p className="text-2xl mb-2">🌐</p>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-1">
                Voice recording not supported
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Please use Google Chrome or Microsoft Edge to use this feature.
              </p>
            </div>
          )}

          {/* Microphone permission denied */}
          {errorType === 'denied' && (
            <div className="rounded-2xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 p-4 text-center">
              <p className="text-2xl mb-2">🚫</p>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">
                Microphone access denied
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                To enable it, click the lock icon in your browser's address bar and allow microphone access, then refresh the page.
              </p>
            </div>
          )}

          {/* Network error */}
          {errorType === 'network' && (
            <div className="rounded-2xl bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 p-4 text-center">
              <p className="text-2xl mb-2">📡</p>
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-1">
                Connection error
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mb-3">
                Speech recognition requires an internet connection. Please check your connection and try again.
              </p>
              <button
                onClick={handleReRecord}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors focus:outline-none"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Silence timeout notice */}
          {errorType === 'silence' && (
            <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 p-3 text-center">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Recording paused after 10 seconds of silence — tap to resume or save your note.
              </p>
            </div>
          )}

          {/* Recording status + timer (shown for idle / recording / stopped) */}
          {errorType !== 'unsupported' && errorType !== 'denied' && (
            <>
              {/* Timer + REC indicator */}
              <div className="flex items-center justify-between">
                <span className="text-2xl font-mono font-bold text-gray-700 dark:text-gray-200 tabular-nums">
                  {formatTime(elapsed)}
                </span>
                {status === 'recording' && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-bold text-red-500 tracking-widest">REC</span>
                  </div>
                )}
              </div>

              {/* Central microphone button */}
              <div className="flex flex-col items-center gap-3">
                {status === 'idle' && (
                  <>
                    <button
                      onClick={startRecording}
                      className="w-24 h-24 rounded-full flex items-center justify-center text-4xl bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/40 border-4 border-gray-200 dark:border-gray-600 hover:border-purple-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-700 shadow-md"
                      aria-label="Start recording"
                    >
                      🎤
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tap to start recording</p>
                  </>
                )}

                {status === 'recording' && (
                  <>
                    <button
                      onClick={stopRecording}
                      className="w-24 h-24 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 border-4 border-red-300 recording-pulse transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-300 shadow-lg"
                      aria-label="Stop recording"
                    >
                      {/* Stop (square) icon */}
                      <span className="w-9 h-9 rounded-md bg-white block" />
                    </button>
                    <p className="text-sm font-medium text-red-500">Recording... tap to stop</p>
                  </>
                )}

                {(status === 'stopped' || errorType === 'silence') && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Recording stopped</p>
                )}
              </div>

              {/* Live transcript area */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Transcript
                </label>
                <textarea
                  value={status === 'recording' ? displayTranscript : transcript}
                  onChange={e => {
                    if (status !== 'recording') {
                      setTranscript(e.target.value)
                      finalTranscriptRef.current = e.target.value
                    }
                  }}
                  readOnly={status === 'recording'}
                  placeholder={
                    status === 'idle'
                      ? 'Your transcription will appear here...'
                      : status === 'recording'
                      ? 'Listening...'
                      : 'Edit your transcription before saving...'
                  }
                  rows={5}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 resize-none transition-colors
                    ${status === 'recording'
                      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-gray-700 dark:text-gray-300 focus:ring-red-300 cursor-default'
                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-purple-400'
                    }
                    placeholder-gray-400 dark:placeholder-gray-500`}
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                {(status === 'idle' || status === 'recording') && (
                  <button
                    type="button"
                    onClick={() => { stopRecording(); onClose() }}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                )}

                {status === 'stopped' && (
                  <>
                    <button
                      type="button"
                      onClick={() => { stopRecording(); onClose() }}
                      className="py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleReRecord}
                      className="py-2.5 px-4 rounded-xl border-2 border-purple-400 text-purple-600 dark:text-purple-400 font-semibold text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
                    >
                      Re-record
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={!transcript.trim()}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%)' }}
                    >
                      Save Note
                    </button>
                  </>
                )}

                {/* Network error retry state — allow saving what was transcribed before error */}
                {errorType === 'network' && transcript.trim() && (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
                    style={{ background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%)' }}
                  >
                    Save Note
                  </button>
                )}
              </div>
            </>
          )}

          {/* Unsupported / denied: just a close button */}
          {(errorType === 'unsupported' || errorType === 'denied') && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
