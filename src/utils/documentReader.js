import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import { createWorker } from 'tesseract.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString()

/**
 * Extract text from a File object.
 * Always returns { text, isImage, base64? } — never null.
 * For images, runs OCR via Tesseract.js and also returns the base64 data URL.
 * @param {File} file
 * @param {(progress: number) => void} [onProgress] - called with 0-100 during OCR
 */
export async function extractTextFromFile(file, onProgress) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (ext === 'txt' || ext === 'md') {
    return { text: await file.text(), isImage: false }
  }

  if (ext === 'pdf') {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const contentData = await page.getTextContent()
      text += contentData.items.map(item => item.str).join(' ') + '\n'
    }
    return { text: text.trim(), isImage: false }
  }

  if (ext === 'docx') {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return { text: result.value.trim(), isImage: false }
  }

  if (['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif'].includes(ext)) {
    // Run OCR using Tesseract.js
    const worker = await createWorker('eng', 1, {
      logger: m => {
        if (onProgress && m.status === 'recognizing text') {
          onProgress(Math.round(m.progress * 100))
        }
      }
    })
    const { data } = await worker.recognize(file)
    await worker.terminate()
    return { text: data.text.trim(), isImage: true, base64: await fileToBase64(file) }
  }

  throw new Error(`Unsupported file type: .${ext}`)
}

/**
 * Convert a File to a base64 data URL.
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
