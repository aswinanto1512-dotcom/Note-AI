import { supabase } from './supabase.js'

/**
 * Fetch the single finance_settings row (salary + currency).
 * Returns null when Supabase is not configured or no row exists yet.
 */
export async function fetchFinanceSettings() {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('finance_settings')
    .select('*')
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return { id: data.id, salary: data.salary, currency: data.currency }
}

/**
 * Create or update the single finance_settings row.
 * Uses the stored id from a previous fetch to do a targeted update,
 * or inserts a fresh row when none exists.
 */
export async function upsertFinanceSettings(salary, currency, existingId) {
  if (!supabase) return
  if (existingId) {
    const { error } = await supabase
      .from('finance_settings')
      .update({ salary, currency })
      .eq('id', existingId)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('finance_settings')
      .insert([{ salary, currency }])
    if (error) throw error
  }
}

/**
 * Fetch all transactions ordered by date descending.
 * Returns null when Supabase is not configured.
 */
export async function fetchTransactions() {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('finance_transactions')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data.map(row => ({
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    type: row.type,
    category: row.category,
    date: row.date,
    screenshotName: row.screenshot_name ?? null,
    createdAt: row.created_at,
  }))
}

/**
 * Insert a new transaction. The tx object must already have an `id` (uuid).
 * Returns the created row mapped to camelCase, or null when offline.
 */
export async function createTransaction(tx) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('finance_transactions')
    .insert([{
      id: tx.id,
      description: tx.description,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      date: tx.date,
      screenshot_name: tx.screenshotName || null,
    }])
    .select()
    .single()
  if (error) throw error
  return {
    id: data.id,
    description: data.description,
    amount: Number(data.amount),
    type: data.type,
    category: data.category,
    date: data.date,
    screenshotName: data.screenshot_name ?? null,
    createdAt: data.created_at,
  }
}

/**
 * Delete a transaction by id. No return value.
 */
export async function deleteTransaction(id) {
  if (!supabase) return
  const { error } = await supabase
    .from('finance_transactions')
    .delete()
    .eq('id', id)
  if (error) throw error
}
