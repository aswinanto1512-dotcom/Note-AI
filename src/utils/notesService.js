import { supabase } from './supabase.js'

// Convert a DB row (snake_case columns) → app note object (camelCase)
function toNote(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    isPinned: row.is_pinned,
    dueDate: row.due_date ?? null,
    dueTime: row.due_time ?? null,
    attachedImage: row.attached_image_url ?? null,
    attachedFileName: row.attached_file_name ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Convert an app note object → DB row payload (only writable fields)
function toRow(note) {
  return {
    title: note.title ?? '',
    content: note.content ?? '',
    category: note.category ?? 'personal',
    is_pinned: note.isPinned ?? false,
    due_date: note.dueDate || null,
    due_time: note.dueTime || null,
    attached_image_url: note.attachedImage || null,
    attached_file_name: note.attachedFileName || null,
  }
}

/**
 * Fetch all notes ordered newest-first.
 * Returns null when Supabase is not configured (localStorage fallback).
 */
export async function fetchNotes() {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(toNote)
}

/**
 * Insert a new note. The note object must already have an `id` (uuid).
 * Returns the saved note as returned by the DB, or null when offline.
 */
export async function createNote(note) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('notes')
    .insert([{ id: note.id, ...toRow(note) }])
    .select()
    .single()
  if (error) throw error
  return toNote(data)
}

/**
 * Update an existing note by its id.
 * Returns the updated note, or null when offline.
 */
export async function updateNote(note) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('notes')
    .update(toRow(note))
    .eq('id', note.id)
    .select()
    .single()
  if (error) throw error
  return toNote(data)
}

/**
 * Delete a note by id. No return value.
 */
export async function deleteNote(id) {
  if (!supabase) return
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) throw error
}
