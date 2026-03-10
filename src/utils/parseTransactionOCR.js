/**
 * Parse OCR text from a transaction screenshot and extract transaction details.
 * Handles: UPI apps (GPay, PhonePe, Paytm), bank screenshots, receipts.
 */
export function parseTransactionFromOCR(ocrText, filename = '') {
  const text = ocrText

  // 1. Extract amount — look for currency patterns
  let amount = null
  const amountPatterns = [
    /(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:paid|sent|received|amount|total|debit|credit)[:\s]+(?:₹|Rs\.?|INR)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /\b([\d,]+(?:\.\d{2})?)\s*(?:₹|Rs|INR)\b/i,
    /\b(\d{2,6}(?:\.\d{2})?)\b/, // fallback: bare number
  ]
  for (const pattern of amountPatterns) {
    const match = text.match(pattern)
    if (match) {
      amount = parseFloat(match[1].replace(/,/g, ''))
      break
    }
  }

  // 2. Detect type: expense or income
  let type = 'expense'
  const incomeKeywords = /received|credited|credit|salary|refund|cashback|you received/i
  const expenseKeywords = /paid|sent|debited|debit|payment|purchase|order/i
  if (incomeKeywords.test(text)) type = 'income'
  else if (expenseKeywords.test(text)) type = 'expense'

  // 3. Extract description — merchant/payee name
  let description = ''
  const descPatterns = [
    /(?:paid to|sent to|to)\s+([A-Za-z0-9 &'.\-]{3,40})/i,
    /(?:from|by)\s+([A-Za-z0-9 &'.\-]{3,40})/i,
    /merchant[:\s]+([A-Za-z0-9 &'.\-]{3,40})/i,
  ]
  for (const p of descPatterns) {
    const m = text.match(p)
    if (m) {
      description = m[1].trim()
      break
    }
  }
  if (!description) {
    // Use filename as fallback
    description = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
  }

  // 4. Detect category from keywords
  let category = 'other'
  const categoryMap = {
    food: /swiggy|zomato|food|restaurant|cafe|pizza|burger|eat|lunch|dinner|breakfast/i,
    transport: /uber|ola|rapido|bus|metro|petrol|fuel|cab|auto|transport/i,
    shopping: /amazon|flipkart|myntra|shop|store|mart|mall|purchase/i,
    bills: /electricity|water|gas|internet|wifi|broadband|recharge|bill|dth/i,
    health: /pharmacy|medical|hospital|doctor|clinic|health|medicine|apollo/i,
    entertainment: /netflix|spotify|prime|hotstar|movie|game|cinema|youtube/i,
    salary: /salary|stipend|payroll|income/i,
  }
  for (const [cat, pattern] of Object.entries(categoryMap)) {
    if (pattern.test(text) || pattern.test(filename)) {
      category = cat
      break
    }
  }

  // 5. Extract date
  let date = new Date().toISOString().split('T')[0]
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})[,\s]+(\d{4})/i,
  ]
  for (const p of datePatterns) {
    const m = text.match(p)
    if (m) {
      try {
        const d = new Date(m[0])
        if (!isNaN(d)) {
          date = d.toISOString().split('T')[0]
          break
        }
      } catch {
        // ignore unparseable dates
      }
    }
  }

  return { amount, type, description, category, date }
}
