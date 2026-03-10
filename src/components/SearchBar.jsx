export default function SearchBar({ search, onSearch, darkMode }) {
  return (
    <div
      className="w-full px-4 py-3 relative z-10"
      style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(139,92,246,0.1)' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none select-none">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full px-4 py-3 pl-11 rounded-2xl text-gray-700 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
            style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(139,92,246,0.2)', backdropFilter: 'blur(8px)' }}
          />
          {search && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none focus:outline-none"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
