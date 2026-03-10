<div align="center">

# Note AI

**A smart, AI-powered note-taking app with voice recording, document OCR, finance tracking, and reminders.**

[![CI/CD Pipeline](https://github.com/aswinanto1512-dotcom/Note-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/aswinanto1512-dotcom/Note-AI/actions/workflows/ci.yml)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://note-ai.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Demo](https://note-ai.vercel.app) · [Report Bug](https://github.com/aswinanto1512-dotcom/Note-AI/issues) · [Request Feature](https://github.com/aswinanto1512-dotcom/Note-AI/issues)

</div>

---

## Features

| Feature | Description |
|---|---|
| **Smart Notes** | Create, edit, pin and organize notes across 5 categories |
| **Voice Notes** | Record your voice — transcribed to text in real-time |
| **Document OCR** | Upload PDFs, images, DOCX — text extracted automatically |
| **Smart Reminders** | Date + time notifications delivered by the browser |
| **Finance Tracker** | Track salary, expenses, upload receipts with auto-detection |
| **Ask AI** | Chat with Google Gemini about your notes |
| **Cloud Sync** | All data synced to Supabase in real-time |
| **Instant Search** | Search all notes by title and content |
| **Beautiful UI** | Glassmorphism design with category color accents |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- A [Supabase](https://supabase.com) account (free)
- A [Google AI Studio](https://aistudio.google.com) API key (free)

### Installation

```bash
# Clone the repository
git clone https://github.com/aswinanto1512-dotcom/Note-AI.git
cd Note-AI

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Configure Environment Variables

Edit `.env` with your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Database Setup

Run this SQL in your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql):

```sql
create table notes (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  content text not null default '',
  category text not null default 'personal',
  is_pinned boolean not null default false,
  due_date date, due_time time,
  attached_image_url text, attached_file_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table finance_settings (
  id uuid primary key default gen_random_uuid(),
  salary numeric not null default 0,
  currency text not null default '₹',
  updated_at timestamptz not null default now()
);
create table finance_transactions (
  id uuid primary key default gen_random_uuid(),
  description text not null default '',
  amount numeric not null default 0,
  type text not null default 'expense',
  category text not null default 'other',
  date date not null default current_date,
  screenshot_name text,
  created_at timestamptz not null default now()
);
alter table notes enable row level security;
alter table finance_settings enable row level security;
alter table finance_transactions enable row level security;
create policy "Allow all" on notes for all using (true) with check (true);
create policy "Allow all" on finance_settings for all using (true) with check (true);
create policy "Allow all" on finance_transactions for all using (true) with check (true);
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3 |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Google Gemini API (free tier) |
| **OCR** | Tesseract.js (runs in browser) |
| **PDF Parsing** | PDF.js |
| **Voice** | Web Speech API |
| **Notifications** | Web Notifications API + Service Worker |
| **Hosting** | Vercel |

---

## Project Structure

```
note-ai/
├── public/
│   └── sw.js                 # Service worker for notifications
├── src/
│   ├── components/
│   │   ├── finance/          # Finance tracker components
│   │   ├── Header.jsx
│   │   ├── NoteCard.jsx
│   │   ├── NoteModal.jsx
│   │   ├── AskAIModal.jsx
│   │   ├── VoiceRecordModal.jsx
│   │   └── FinanceDashboard.jsx
│   ├── utils/
│   │   ├── supabase.js       # Supabase client
│   │   ├── notesService.js   # Notes CRUD
│   │   ├── financeService.js # Finance CRUD
│   │   ├── notifications.js  # Browser notifications
│   │   ├── documentReader.js # PDF/OCR extraction
│   │   └── parseTransactionOCR.js
│   ├── App.jsx
│   └── main.jsx
├── .github/
│   └── workflows/
│       ├── ci.yml            # CI/CD pipeline
│       └── codeql.yml        # Security analysis
├── vercel.json
└── .env.example
```

---

## CI/CD Pipeline

Every push to `main` triggers:
1. **Build check** — ensures code compiles without errors
2. **CodeQL analysis** — automated security scanning
3. **Auto deploy** — deploys to Vercel production

Pull requests get a **preview deployment URL** automatically.

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with love by <a href="https://github.com/aswinanto1512-dotcom">Aswin Anto</a>
</div>
