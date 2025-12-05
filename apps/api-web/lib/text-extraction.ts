/**
 * Local Text Extraction Module
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPLIANCE & PRIVACY NOTICE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * LOCAL-ONLY EXTRACTION:
 * • All OCR and PDF parsing is performed locally in the LINDEX backend
 * • No raw document bytes are sent to any LLM or AI provider during ingestion
 * • PDF extraction: pdf-parse library (100% local processing)
 * • Image OCR: Tesseract.js (WASM-based, runs entirely in Node.js process)
 *
 * EMBEDDINGS-ONLY EXTERNAL CALLS:
 * • Only short, pre-chunked text segments are sent to embeddings endpoints
 * • This module never sends full document contents to external services
 * • This module never uses chat/completion endpoints in the ingestion phase
 * • Embeddings are generated separately by the ingestion worker
 *
 * NO LEGAL RESEARCH OR ADVICE:
 * • This ingestion worker does not perform legal research or generate legal advice
 * • Its sole purpose is to make the user's own evidence searchable and analyzable later
 * • RAG (Retrieval-Augmented Generation) queries happen separately in user-facing APIs
 *
 * PROVIDER DATA-USAGE CONSTRAINTS:
 * • The OpenAI (or other provider) account MUST be configured so inputs/outputs
 *   are NOT used to train models, and logging is minimal
 * • This configuration is enforced in the provider's dashboard (not in code)
 * • Verify settings at: https://platform.openai.com/account/data-usage
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import pdfParse from 'pdf-parse';
import { createWorker, Worker } from 'tesseract.js';

// ============================================================================
// Tesseract Worker Singleton
// ============================================================================
// Reuse a single worker instance to avoid spawning new workers per request

let tesseractWorkerInstance: Worker | null = null;
let workerInitPromise: Promise<Worker> | null = null;

/**
 * Get or create a shared Tesseract worker instance
 * Uses singleton pattern to avoid spawning multiple workers
 */
async function getTesseractWorker(): Promise<Worker> {
  // If worker already exists, return it
  if (tesseractWorkerInstance) {
    return tesseractWorkerInstance;
  }

  // If worker is being initialized, wait for that promise
  if (workerInitPromise) {
    return workerInitPromise;
  }

  // Initialize new worker
  workerInitPromise = (async () => {
    const worker = await createWorker('eng', 1, {
      // Suppress excessive logging in production
      logger: process.env.NODE_ENV === 'development'
        ? (m) => console.log('[Tesseract]', m)
        : undefined,
    });

    tesseractWorkerInstance = worker;
    workerInitPromise = null;

    return worker;
  })();

  return workerInitPromise;
}

/**
 * Terminate the shared Tesseract worker (for cleanup)
 * Call this when shutting down the application
 */
export async function terminateTesseractWorker(): Promise<void> {
  if (tesseractWorkerInstance) {
    await tesseractWorkerInstance.terminate();
    tesseractWorkerInstance = null;
    workerInitPromise = null;
  }
}

// ============================================================================
// Text Extraction Functions
// ============================================================================

/**
 * Extract text from a PDF buffer using pdf-parse
 * LOCAL PROCESSING ONLY - no external API calls
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer, {
      // Limit to reasonable number of pages to prevent DoS
      max: 500,
    });

    return data.text || '';
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`PDF extraction failed: ${message}`);
  }
}

/**
 * Extract text from an image buffer using Tesseract OCR
 * LOCAL PROCESSING ONLY - no external API calls
 */
async function extractTextFromImage(buffer: Buffer): Promise<string> {
  try {
    const worker = await getTesseractWorker();

    const { data } = await worker.recognize(buffer);

    return data.text || '';
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`OCR extraction failed: ${message}`);
  }
}

/**
 * Normalize whitespace in extracted text
 * - Collapses multiple spaces/tabs into single space
 * - Reduces excessive newlines to maximum of 2
 * - Trims leading/trailing whitespace
 */
function normalizeWhitespace(text: string): string {
  return text
    // Collapse multiple spaces/tabs into single space
    .replace(/[ \t]+/g, ' ')
    // Reduce excessive newlines to max 2
    .replace(/\n{3,}/g, '\n\n')
    // Trim leading/trailing whitespace
    .trim();
}

/**
 * Determine file type from MIME type or filename extension
 */
function determineFileType(
  mimeType?: string | null,
  filename?: string | null
): 'pdf' | 'image' | 'unknown' {
  // Check MIME type first (more reliable)
  if (mimeType) {
    if (mimeType === 'application/pdf') {
      return 'pdf';
    }
    if (mimeType.startsWith('image/')) {
      return 'image';
    }
  }

  // Fallback to filename extension
  if (filename) {
    const lowerFilename = filename.toLowerCase();

    if (lowerFilename.endsWith('.pdf')) {
      return 'pdf';
    }

    if (
      lowerFilename.endsWith('.png') ||
      lowerFilename.endsWith('.jpg') ||
      lowerFilename.endsWith('.jpeg') ||
      lowerFilename.endsWith('.tiff') ||
      lowerFilename.endsWith('.tif') ||
      lowerFilename.endsWith('.bmp') ||
      lowerFilename.endsWith('.webp')
    ) {
      return 'image';
    }
  }

  return 'unknown';
}

// ============================================================================
// Public API
// ============================================================================

export interface ExtractTextOptions {
  /** File buffer containing the document bytes */
  buffer: Buffer;

  /** MIME type of the file (e.g., 'application/pdf', 'image/png') */
  mimeType?: string | null;

  /** Original filename (used as fallback for type detection) */
  originalFilename?: string | null;
}

/**
 * Extract text from a file buffer (PDF or image)
 *
 * LOCAL PROCESSING ONLY:
 * - PDF extraction uses pdf-parse (local library)
 * - Image OCR uses Tesseract.js (WASM-based, runs locally)
 * - No document bytes are sent to external services
 *
 * @param options - Extraction options
 * @returns Extracted and normalized text
 * @throws Error if file type is unsupported or extraction fails
 *
 * @example
 * ```typescript
 * const buffer = await fs.readFile('document.pdf');
 * const text = await extractTextFromFile({
 *   buffer,
 *   mimeType: 'application/pdf',
 *   originalFilename: 'document.pdf'
 * });
 * ```
 */
export async function extractTextFromFile(
  options: ExtractTextOptions
): Promise<string> {
  const { buffer, mimeType, originalFilename } = options;

  // Validate input
  if (!buffer || buffer.length === 0) {
    throw new Error('File buffer is empty or invalid');
  }

  // Determine file type
  const fileType = determineFileType(mimeType, originalFilename);

  // Extract text based on file type
  let extractedText: string;

  switch (fileType) {
    case 'pdf':
      extractedText = await extractTextFromPDF(buffer);
      break;

    case 'image':
      extractedText = await extractTextFromImage(buffer);
      break;

    case 'unknown':
    default:
      throw new Error(
        `Unsupported file type. MIME type: ${mimeType || 'unknown'}, ` +
        `filename: ${originalFilename || 'unknown'}. ` +
        `Supported types: PDF (application/pdf, .pdf) and images ` +
        `(image/*, .png, .jpg, .jpeg, .tiff, .bmp, .webp)`
      );
  }

  // Normalize whitespace before returning
  const normalizedText = normalizeWhitespace(extractedText);

  // Validate that we extracted something
  if (!normalizedText || normalizedText.length === 0) {
    throw new Error(
      `No text could be extracted from ${fileType.toUpperCase()} file. ` +
      `The document may be empty, corrupted, or contain only images without text.`
    );
  }

  return normalizedText;
}

// ============================================================================
// Graceful Shutdown Handler
// ============================================================================
// Clean up Tesseract worker on process termination

if (typeof process !== 'undefined') {
  const shutdownHandler = async () => {
    await terminateTesseractWorker();
  };

  process.on('SIGTERM', shutdownHandler);
  process.on('SIGINT', shutdownHandler);
  process.on('beforeExit', shutdownHandler);
}

