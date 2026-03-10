import NoteCard from './NoteCard.jsx'

export default function NotesGrid({ pinnedNotes, otherNotes, onEditNote, onTogglePin, darkMode }) {
  const hasPinned = pinnedNotes.length > 0
  const hasOthers = otherNotes.length > 0

  if (!hasPinned && !hasOthers) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-6xl mb-4">📓</span>
        <p className="text-gray-400 text-lg font-medium">No notes yet</p>
        <p className="text-gray-300 text-sm mt-1">Tap the + button to create your first note</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {hasPinned && (
        <section>
          <h2
            className="text-xs font-bold tracking-widest uppercase mb-3 flex items-center gap-2"
            style={{ color: '#9CA3AF' }}
          >
            <span>📌</span>
            <span>Pinned</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.06)' }} />
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {pinnedNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={onEditNote}
                onTogglePin={onTogglePin}
                darkMode={darkMode}
              />
            ))}
          </div>
        </section>
      )}

      {hasOthers && (
        <section>
          <h2
            className="text-xs font-bold tracking-widest uppercase mb-3 flex items-center gap-2"
            style={{ color: '#9CA3AF' }}
          >
            <span>Others</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.06)' }} />
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {otherNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={onEditNote}
                onTogglePin={onTogglePin}
                darkMode={darkMode}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
