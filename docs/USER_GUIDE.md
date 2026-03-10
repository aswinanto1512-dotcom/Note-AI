# Note AI — User Guide

Welcome to **Note AI**, your intelligent note-taking companion. Whether you're capturing voice memos on the go, organizing work projects, tracking your finances, or seeking AI-powered insights, Note AI brings everything together in one beautifully designed app. This guide will walk you through every feature, from creating your first note to leveraging advanced capabilities like voice transcription, document OCR, and AI assistance.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Creating Notes](#2-creating-notes)
3. [Note Categories](#3-note-categories)
4. [Voice Notes (Speech-to-Text)](#4-voice-notes-speech-to-text)
5. [Document Upload & OCR](#5-document-upload--ocr)
6. [Smart Reminders & Notifications](#6-smart-reminders--notifications)
7. [Search & Filter](#7-search--filter)
8. [Finance Tracker](#8-finance-tracker)
9. [Ask AI (Powered by Google Gemini)](#9-ask-ai-powered-by-google-gemini)
10. [Cloud Sync (Supabase)](#10-cloud-sync-supabase)
11. [Tips & Tricks](#11-tips--tricks)
12. [Browser Compatibility](#12-browser-compatibility)
13. [Privacy & Security](#13-privacy--security)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Getting Started

### Opening the App

Navigate to **[https://note-ai-ten.vercel.app](https://note-ai-ten.vercel.app)** in your web browser. The app loads instantly and works best on Chrome or Edge for full feature support.

### Interface Overview

When you first open Note AI, you'll see:

- **Header** — Contains the search bar, category tabs (All, Voice Notes, Work, Reminder, Shopping, Personal), a bell icon for notifications, a settings gear icon, and a ✨ Ask AI button
- **Search Bar** — Type keywords to filter notes by title or content in real time
- **Category Tabs** — Quickly switch between note types
- **Notes Grid** — Your notes displayed as organized cards with title, snippet, category badge, and reminder date
- **PINNED Section** — Important notes always appear first
- **OTHERS Section** — Remaining notes sorted by date
- **FAB Button** — Large "+" button in the bottom right to create new notes

### First Time Setup

When you open Note AI for the first time:

1. **Enable Browser Notifications** — Click the 🔔 bell icon in the header, then click "Enable" to allow reminders to notify you
2. **Add Your Gemini API Key** (optional but recommended) — Click the ✨ Ask AI button, then the ⚙️ gear icon to paste your free API key from Google AI Studio
3. **Start Taking Notes** — Click the "+" button and create your first note

---

## 2. Creating Notes

### Creating a New Note

1. Click the **"+" button** (floating action button in the bottom right)
2. A modal opens with the following fields:

   - **Title** — Give your note a descriptive name
   - **Content** — Write or paste your note content (or record voice, see Section 4)
   - **Category** — Choose from: Voice Notes, Work, Reminder, Shopping, or Personal
   - **Reminder Date** — Optional: click the 📅 calendar icon to set a date
   - **Reminder Time** — Optional: click the ⏰ clock icon to set a time for the reminder
   - **Pin Toggle** — Click the 📌 pin icon to keep this note at the top of your list

3. Click **Save** to create your note

### Editing an Existing Note

- Click any note card in the grid
- Make your changes to title, content, category, reminder, or pin status
- Click **Save** to update

### Deleting a Note

- Open a note (click the card)
- Look for the delete button (trash icon) and click it
- Confirm deletion

---

## 3. Note Categories

Note AI organizes your thoughts into five categories. Each has a distinct color, icon, and purpose:

### 🎤 Voice Notes (Blue)

For audio recordings with live transcription. Perfect for:
- Voice memos and quick thoughts
- Meetings and lectures
- Ideas you want to capture while driving or commuting

### 💼 Work (Green)

For professional content and work-related tasks. Perfect for:
- Project notes and meeting summaries
- Task lists and deadlines
- Collaboration notes with team members

### ⏰ Reminder (Amber)

For time-sensitive reminders and important dates. Perfect for:
- Birthday reminders and anniversaries
- Appointment and meeting schedules
- Annual events and deadlines

### 🛒 Shopping (Pink)

For shopping lists and purchase planning. Perfect for:
- Grocery lists with quantities
- Wishlist items
- Budget planning for purchases

### 🔒 Personal (Purple)

For private information and sensitive documents. Perfect for:
- Personal ID numbers and passport scans
- Health records and medical notes
- Financial information and important documents

---

## 4. Voice Notes (Speech-to-Text)

Note AI's voice recording feature lets you speak naturally while the app transcribes your words in real time. No typing required.

### Starting a Voice Recording

**Option 1: From Header**
- Click the 🎤 microphone button in the header
- Allow microphone permission when prompted
- The voice recording interface opens

**Option 2: Inside Note Editor**
- Create a new note (click "+")
- Click the 🎤 microphone button inside the note editor
- Allow microphone permission when prompted

### Recording Your Voice

1. Click the **large microphone button** to start recording (button turns red)
2. **Speak naturally** — text appears on screen in real time as you talk
3. **Pause or continue** — the app auto-stops after 10 seconds of silence
4. Click **Stop** to finish recording
5. Review the transcribed text — edit any errors
6. Click **Save Note** to save your recording

### Tips for Best Results

- Speak clearly and at a normal pace
- Minimize background noise (quiet rooms work best)
- Works best in **Chrome or Edge** browsers
- Firefox and Safari have limited speech recognition support
- Average accuracy: 90-95% for clear audio

---

## 5. Document Upload & OCR

Extract text from physical documents, PDFs, images, and screenshots automatically using Optical Character Recognition (OCR).

### Uploading a Document

1. Open a note (create new or edit existing)
2. Look for the **📎 upload zone** in the editor (drag and drop area)
3. Either:
   - **Drag and drop** a file onto the upload area, or
   - **Click the upload area** and select a file from your computer

### Supported File Formats

| Format | Result |
|---|---|
| PDF | Text extracted and added to note content |
| DOCX | Text extracted and added to note content |
| TXT | Text imported directly |
| PNG, JPG, WEBP | OCR scans and extracts text from image |

### Processing

- **Text-based files** (PDF, DOCX, TXT): Text is extracted instantly
- **Images** (PNG, JPG, WEBP): OCR processes the image and extracts text (progress bar shown)
- Extracted text is added to your note's content field
- A **filename badge** appears on the note card showing which file was uploaded

### Great Use Cases

- Scanning receipts and invoices
- Extracting text from ID cards and passports
- Digitizing handwritten notes (take a photo first)
- Converting screenshots to searchable text
- Archiving printed documents

---

## 6. Smart Reminders & Notifications

Never forget important dates or deadlines again. Note AI sends browser notifications at the exact time you specify.

### Setting a Reminder

When creating or editing a note:

1. Click the **📅 Reminder Date** field and select a date
2. Click the **⏰ Reminder Time** field and select a time
3. Save your note

### How Reminders Work

- When your reminder date and time arrive, a **browser notification** appears with your note's title
- Click the notification to open that note in the app
- Notifications work even if the app isn't currently open (requires browser notification permission)

### Birthday & Anniversary Reminders

If you set a reminder for a specific date (e.g., March 15, 2024):
- The app remembers to remind you every year on March 15
- You get the notification annually without resetting the reminder
- Perfect for birthdays, anniversaries, and recurring events

### Notification Status

The 🔔 **bell icon** in the header shows your notification status:

- **Green** = Notifications enabled and working
- **Orange** = Notification permission pending (click to enable)
- **Red** = Notifications blocked in browser settings

### Enabling Notifications

1. Click the 🔔 bell icon in the header
2. Click **"Enable"** in the notification banner
3. Your browser will ask for permission — choose **"Allow"**
4. Icon turns green; reminders are now active

### Reminder Timing

- **With time specified**: Notification fires at the exact time (e.g., 3:00 PM)
- **Date only**: Notification fires when you open the app on that date

---

## 7. Search & Filter

Find the notes you need in seconds using powerful search and filtering tools.

### Using the Search Bar

- Click the **search bar** at the top of the page
- Type any **keyword** from your notes (title, content, category name)
- Results filter in real time as you type
- Clear the search to see all notes again

### Category Tabs

Click any category tab at the top to filter by type:
- **All** — View all notes
- **Voice Notes** — Voice recordings and transcriptions
- **Work** — Professional notes
- **Reminder** — Time-sensitive reminders
- **Shopping** — Shopping lists and purchases
- **Personal** — Private documents and information

### Category Stat Cards

Below the tabs, you'll see category cards showing:
- Category name and color
- Number of notes in that category
- Click a card to filter by that category

### Organization Sections

Your filtered results are organized in two sections:

- **PINNED** — Starred notes always appear at the top, regardless of date
- **OTHERS** — Remaining notes sorted by most recent first

### Combining Search & Filters

You can use search and category filters together:
- Search for "budget" AND filter by "Finance" category
- Search for "meeting" AND filter by "Work" category

---

## 8. Finance Tracker

Track your income and expenses, visualize spending patterns, and stay on top of your budget—all powered by intelligent receipt OCR.

### Accessing the Finance Tracker

Click the **💰 Finance** button in the header. On your first visit, you'll see an empty dashboard.

### Initial Setup: Adding Your Salary

1. Click the **⚙️ Salary** button
2. Enter your **monthly salary** (numerical value only)
3. Choose your **currency** — ₹ (Indian Rupee) or $ (US Dollar)
4. Click **Save**

The salary is now set and won't change unless you update it manually.

### Understanding Your Dashboard

The **Balance Card** displays three values:

- **Salary** — Your monthly income (top value)
- **Total Expenses** — Sum of all your expenses this month (middle value)
- **Remaining Balance** — Salary minus expenses (bottom value in green or red)

The **progress bar** shows how much of your salary you've spent:
- **Green** = 0-80% spent (healthy budget)
- **Red** = Over 80% spent (approaching limit)

### Adding Transactions

#### From Receipt Screenshot

Perfect for expense tracking from digital payments (UPI, PayPal, bank transfers):

1. Click **📷 Add from Screenshot**
2. Upload an image of a receipt (UPI payment screenshot, bank statement, credit card receipt, etc.)
3. Supported payment apps: Google Pay, PhonePe, Paytm, Amazon Pay, bank apps
4. The app's OCR automatically detects:
   - **Amount** — Payment value
   - **Merchant** — Shop/service name
   - **Category** — Food, Transport, Shopping, etc.
   - **Date** — Transaction date
5. Review the auto-filled form
6. Edit any incorrect fields if needed
7. Click **Save**

#### Manual Entry

For cash expenses or transactions without a receipt:

1. Click **✏️ Add Manual**
2. Fill in these fields:
   - **Description** — What you paid for (e.g., "Coffee at Starbucks")
   - **Amount** — How much you spent
   - **Type** — Choose "Expense" or "Income"
   - **Category** — Select from the list (see below)
   - **Date** — When the transaction occurred
3. Click **Save**

### Transaction Categories

Organize your spending with these categories:

- **🍔 Food** — Groceries, restaurants, delivery
- **🚌 Transport** — Bus, taxi, fuel, parking
- **🛍️ Shopping** — Clothes, electronics, household items
- **📱 Bills** — Utilities, internet, subscriptions
- **🏥 Health** — Medicine, doctor visits, gym
- **🎬 Entertainment** — Movies, games, hobbies
- **💼 Salary** — Income, bonuses, refunds
- **📦 Other** — Miscellaneous expenses

### Viewing Spending Insights

A **visual bar chart** displays your spending by category:

- Each bar represents one expense category
- Bar height shows spending amount
- Percentage shows what portion of total spending each category represents
- Helps identify where your money goes most

### Deleting a Transaction

- Find the transaction in your list
- **Swipe left** on it (mobile), or **hover and click the delete button** (desktop)
- Confirm deletion
- Your balance and chart update automatically

---

## 9. Ask AI (Powered by Google Gemini)

Get intelligent insights about your notes using Google's powerful Gemini AI—completely free to use.

### Getting Started with Ask AI

1. Click the **✨ Ask AI** button in the header
2. On your first use, you'll see a prompt to add your API key
3. Click the **⚙️ API Key** button

### Getting a Free Gemini API Key

Google provides free API keys for personal use with generous rate limits (perfect for individual note-taking):

1. Go to **[aistudio.google.com](https://aistudio.google.com)** in a new tab
2. **Sign in with your Google account**
3. Click **"Get API Key"** button
4. Select **"Create API key in new project"**
5. Your key appears (looks like: `AIza...`)
6. Click **"Copy"** to copy the key
7. Return to Note AI and paste it into the API Key field
8. Click **Save**
9. The 🔐 icon turns green; you're ready to ask questions!

### What You Can Ask

You can ask about anything in your notes. Examples:

- **"Summarize my work notes"** — Get a condensed version of your professional content
- **"What reminders do I have this week?"** — Quick view of upcoming events
- **"What's on my shopping list?"** — See all shopping items organized
- **"What are my pinned notes about?"** — Understand your most important notes
- **"How much have I spent on food?"** — Query your finance tracker
- **"What's in my ID photo?"** — AI reads text from uploaded document images
- **"Help me plan a trip to..."** — AI uses your notes to suggest ideas
- **"What deadlines do I have in March?"** — View time-sensitive reminders

### Image Analysis

If any of your notes contain uploaded images or screenshots:
- AI can see and analyze them visually
- Great for: analyzing receipts, reading documents, extracting information from photos
- Ask: "What does the receipt in my groceries note say?"

### Tips for Better Responses

- Be specific: "Summarize my Work notes from this week" vs. "Summary"
- Ask follow-up questions: "How much did I spend on transport?"
- Provide context: "I have a shopping trip next Friday, help me budget"
- Use keywords from your notes: AI understands your terminology

---

## 10. Cloud Sync (Supabase)

Your notes and financial data automatically sync to the cloud, keeping you in sync across all your devices.

### How Cloud Sync Works

- Every note you create is automatically saved to Supabase (a secure PostgreSQL database)
- All finance transactions are synced instantly
- Changes on one device appear on all your other devices within seconds
- Your data is always backed up—no manual saving required

### Accessing Your Notes Across Devices

1. Open Note AI on a **different computer or phone**
2. Notes and finance data automatically load
3. Create a new note on one device—it appears on all others
4. Edit a note on your phone—updates sync to your computer

### Offline Mode

Note AI works even without an internet connection:

- When offline, changes are saved **locally** in your browser
- When you reconnect to the internet, your changes automatically sync to the cloud
- You won't lose any data if you're temporarily offline

### Your API Key (Important)

Your **Gemini API key is stored locally only** in your browser's local storage:
- Never synced to the cloud
- Never sent to our servers
- Only sent directly to Google when you ask questions
- Completely secure and private

---

## 11. Tips & Tricks

Master Note AI with these pro tips:

### Pin Your Most Important Notes

- Use the 📌 pin toggle to star important information
- Pinned notes always appear at the top
- Perfect for: passports, emergency contacts, birthday reminders, important work projects

### Recurring Annual Reminders

- Set a reminder for a birthday or anniversary with a specific date
- The app automatically reminds you every year on that date
- No need to recreate the note annually

### Document Archiving

- Upload your ID, passport, or important documents as images to Personal notes
- Use Ask AI to read details: "What's on my passport?"
- Creates a searchable, digital archive

### Receipt Tracking

- Take a screenshot of your receipt after every purchase
- Upload to Finance tracker—OCR extracts the amount automatically
- Get instant spending insights without manual entry

### Voice Memo Organization

- Record voice notes while commuting, walking, or multitasking
- Edit and organize them later
- Search by content—transcribed text is fully searchable

### Ask AI for Summaries

- Overwhelmed with many notes? Ask: "Give me a 1-minute summary of everything I've captured this month"
- AI synthesizes information from all your notes

### Combine Search with Filters

- Search "budget" AND filter by "Finance" category for focused results
- Search "John" AND filter by "Work" to find all notes mentioning a colleague

### Back Up Important Data

- Periodically screenshot or export your most important notes
- Cloud sync provides automatic backup, but manual backups add extra security

---

## 12. Browser Compatibility

Note AI is designed for modern web browsers. Here's what works where:

| Feature | Chrome | Edge | Firefox | Safari |
|---|---|---|---|---|
| **Voice Notes** | ✅ Full support | ✅ Full support | ⚠️ Limited | ⚠️ Limited |
| **Live Transcription** | ✅ | ✅ | ⚠️ Basic | ⚠️ Basic |
| **Notifications** | ✅ Full support | ✅ Full support | ✅ Full support | ⚠️ Limited |
| **Document Upload** | ✅ | ✅ | ✅ | ✅ |
| **OCR Processing** | ✅ | ✅ | ✅ | ✅ |
| **Finance Tracker** | ✅ | ✅ | ✅ | ✅ |
| **Ask AI** | ✅ | ✅ | ✅ | ✅ |
| **Cloud Sync** | ✅ | ✅ | ✅ | ✅ |

### Recommendation

For the best experience with all features enabled, use **Google Chrome** or **Microsoft Edge**. Firefox and Safari work great for most features but have limited voice recognition capabilities.

---

## 13. Privacy & Security

We take your privacy seriously. Here's how your data is protected:

### Data Storage

- **Notes and transactions** are stored in Supabase (industry-standard PostgreSQL database)
- Supabase uses encryption at rest and in transit
- Your data is backed up automatically and securely

### API Key Security

- Your **Gemini API key** is stored only in your browser's localStorage
- It's **never sent to our servers** or synced to the cloud
- Only sent directly to Google when you ask questions
- You can regenerate or delete your key anytime from Google AI Studio

### Document Privacy

- Document images you upload are stored as secure URLs in the database
- OCR processing happens in your browser; text is extracted locally first
- You control what happens to your documents

### Best Practices

1. **Never share your Gemini API key** with anyone
2. Keep your browser's local storage secure
3. Clear browser cookies if using a shared computer
4. Regularly update your browser for security patches
5. Use HTTPS-only connections to the app

### Compliance

- Note AI respects GDPR and standard privacy regulations
- You can request your data be deleted by contacting support
- No ads, no tracking, no selling of your information

---

## 14. Troubleshooting

### Ask AI Not Working

**Problem:** The AI responds with "Invalid API key" or stops responding

**Solution:**
- Get a new API key from [aistudio.google.com](https://aistudio.google.com)
- Make sure to create a new project (click "Create API key in new project")
- Copy the new key and paste it into Note AI's API Key field
- Test with a simple question: "Hello"

### Voice Recording Won't Start

**Problem:** Microphone button doesn't respond or shows an error

**Solution:**
- Check your browser's microphone permission: Settings → Privacy → Microphone → Allow
- Refresh the page and try again
- Test the microphone in another app first to ensure it works
- Use Chrome or Edge (Firefox has limited voice support)
- Make sure no other app is using the microphone

### Notifications Not Showing

**Problem:** You're not receiving notification reminders

**Solution:**
- Click the 🔔 bell icon in the header
- Make sure the notification status shows as "green" (enabled)
- Click "Enable" if it shows "orange"
- Check your browser's notification settings: Settings → Privacy → Notifications → Allow
- Ensure your operating system allows notifications from your browser

### OCR Didn't Extract Text

**Problem:** Uploaded image shows no text, or very little was extracted

**Solution:**
- Upload a **clearer image** — OCR works best on printed, high-contrast text
- Try a different angle or lighting
- Ensure text is visible and not blurry
- Handwritten text is harder to recognize; typed text works better
- For very poor OCR results, use manual entry instead

### Notes Not Saving to Cloud

**Problem:** Changes aren't syncing across devices

**Solution:**
- Check your **internet connection** — the app requires internet to sync
- Wait a few seconds; sync happens automatically after changes
- Refresh the page to see the latest data
- Check browser console (F12) for error messages
- Your data is still saved locally and will sync when connection restores

### Can't Upload Documents

**Problem:** Upload button is disabled or upload fails

**Solution:**
- Check file format — supported: PDF, DOCX, TXT, PNG, JPG, WEBP
- Ensure file size is reasonable (under 10MB recommended)
- Check your internet connection
- Try a different file format
- Clear your browser cache and try again

### Missing Notes or Transactions

**Problem:** A note or transaction you created isn't visible

**Solution:**
- Try **refreshing the page** (Ctrl+R or Cmd+R)
- Check your **category filters** — note might be in a different category
- Use the **search bar** to find it by keywords
- Check if you accidentally deleted it
- Wait a few seconds for cloud sync to complete

### App Runs Slowly

**Problem:** Note AI feels sluggish or takes time to load

**Solution:**
- **Clear browser cache**: Settings → Privacy → Clear browsing data
- Close other browser tabs to free up memory
- Use an up-to-date browser version
- Check your internet connection speed
- Restart your browser
- Try a different browser (Chrome or Edge recommended)

### Still Need Help?

If none of these solutions work:
- Check your browser console (Press F12) for error messages
- Try accessing the app in an incognito/private window
- Verify your browser is fully updated
- Clear all site data for the app and start fresh

---

**Congratulations!** You're now ready to master Note AI. Start by creating your first note, enable notifications, and explore the features that matter most to you. Happy note-taking!

**Last updated:** March 2026
