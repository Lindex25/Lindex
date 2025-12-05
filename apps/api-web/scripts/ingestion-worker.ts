#!/usr/bin/env tsx
/**
 * LINDEX Ingestion Worker
 *
 * Runs outside the HTTP request cycle and polls the processing_jobs table
 * to extract text from evidence files and generate embeddings.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPLIANCE & PRIVACY NOTICE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * LOCAL-ONLY EXTRACTION:
 * • All OCR and PDF parsing is performed locally in the LINDEX backend
 * • All PDF and image bytes are processed 100% locally for text extraction
 * • No raw document bytes are sent to any LLM or AI provider during ingestion
 * • Uses pdf-parse (local) and Tesseract.js (WASM-based, runs in Node.js)
 *
 * EMBEDDINGS-ONLY EXTERNAL CALLS:
 * • Only short, pre-chunked text segments are sent to embeddings endpoints
 * • This worker NEVER sends full document contents to external services
 * • This worker NEVER uses chat/completion endpoints in the ingestion phase
 * • Chunks are typically 500-1500 characters each, sent to OpenAI Embeddings API only
 *
 * NO LEGAL RESEARCH OR ADVICE:
 * • This ingestion worker does not perform legal research or generate legal advice
 * • Its sole purpose is to make the user's own evidence searchable and analyzable later
 * • Legal analysis and advice generation happen separately in user-facing RAG query APIs
 * • This is a data preparation pipeline, not a legal reasoning system
 *
 * PROVIDER DATA-USAGE CONSTRAINTS (REQUIRED):
 * • The OpenAI (or other provider) account MUST be configured so inputs/outputs
 *   are NOT used to train models, and logging is minimal
 * • This configuration is enforced in the provider's dashboard (not in code)
 * • Verify at: https://platform.openai.com/account/data-usage
 * • Ensure "Data usage for training" is OFF before running this worker
 * • Document verification in compliance audit logs
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Job Processing Flow:
 * 1. TEXT_EXTRACTION: Download file → Extract text locally → Chunk → Store
 * 2. EMBEDDINGS: Generate vectors for chunks → Store in pgvector
 *
 * Future Enhancements:
 * - Add structured logging (e.g., Winston, Pino)
 * - Add error monitoring (e.g., Sentry)
 * - Add metrics collection (e.g., Prometheus)
 * - Add job retry with exponential backoff
 * - Add concurrent job processing with worker pools
 */

// Load environment variables from .env.local
import { config as loadEnv } from 'dotenv';
import * as path from 'path';

// Load .env.local file
loadEnv({ path: path.resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { extractTextFromFile } from '../lib/text-extraction';
import { embedManyChunks } from '../lib/embeddings';

// ============================================================================
// Configuration
// ============================================================================

const config = {
  pollIntervalMs: 3000, // Poll every 3 seconds
  batchSize: 5, // Process up to 5 jobs per loop
  chunkSize: 1000, // Characters per chunk
  chunkOverlap: 200, // Overlap between chunks
  minChunkLength: 50, // Minimum characters for a valid chunk
  maxErrorLength: 500, // Max error message length to store
};

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================================================
// Types
// ============================================================================

interface ProcessingJob {
  id: string;
  evidence_id: string;
  job_type: 'TEXT_EXTRACTION' | 'EMBEDDINGS';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

interface Evidence {
  id: string;
  case_id: string;
  user_id: string;
  storage_path: string;
  media_type: string;
  original_filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  processing_status: string;
}

interface TextChunk {
  evidence_id: string;
  chunk_index: number;
  content: string;
  token_count: number | null;
}

interface EvidenceTextChunk {
  id: string;
  evidence_id: string;
  chunk_index: number;
  content: string;
  token_count: number | null;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Truncate error message to max length
 */
function truncateError(error: unknown, maxLength: number = config.maxErrorLength): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.length > maxLength
    ? message.substring(0, maxLength) + '...'
    : message;
}

/**
 * Simple text chunking with overlap
 * Splits text into chunks of approximately chunkSize characters with overlap
 */
function chunkText(text: string): TextChunk[] {
  const chunks: Omit<TextChunk, 'evidence_id'>[] = [];
  const { chunkSize, chunkOverlap, minChunkLength } = config;

  // Normalize whitespace
  const cleanText = text.replace(/\s+/g, ' ').trim();

  if (cleanText.length < minChunkLength) {
    return [];
  }

  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < cleanText.length) {
    const endIndex = Math.min(startIndex + chunkSize, cleanText.length);
    const chunkContent = cleanText.substring(startIndex, endIndex).trim();

    if (chunkContent.length >= minChunkLength) {
      chunks.push({
        chunk_index: chunkIndex,
        content: chunkContent,
        token_count: Math.ceil(chunkContent.length / 4), // Rough estimate
      });
      chunkIndex++;
    }

    startIndex += chunkSize - chunkOverlap;
  }

  return chunks as TextChunk[];
}

// ============================================================================
// Database Operations
// ============================================================================

/**
 * Fetch pending jobs from the database
 */
async function fetchPendingJobs(limit: number): Promise<ProcessingJob[]> {
  const { data, error } = await supabase
    .from('processing_jobs')
    .select('*')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch pending jobs: ${error.message}`);
  }

  return (data || []) as ProcessingJob[];
}

/**
 * Update job status
 */
async function updateJobStatus(
  jobId: string,
  status: ProcessingJob['status'],
  errorMessage?: string
): Promise<void> {
  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (errorMessage) {
    updates.last_error = truncateError(errorMessage);
  }

  const { error } = await supabase
    .from('processing_jobs')
    .update(updates)
    .eq('id', jobId);

  if (error) {
    console.error(`Failed to update job ${jobId}:`, error.message);
  }
}

/**
 * Update evidence processing status
 */
async function updateEvidenceStatus(
  evidenceId: string,
  status: string
): Promise<void> {
  const { error } = await supabase
    .from('evidence')
    .update({ processing_status: status })
    .eq('id', evidenceId);

  if (error) {
    console.error(`Failed to update evidence ${evidenceId}:`, error.message);
  }
}

/**
 * Download file from Supabase Storage
 */
async function downloadFileFromStorage(storagePath: string): Promise<Buffer> {
  const { data, error } = await supabase.storage
    .from('evidence')
    .download(storagePath);

  if (error) {
    throw new Error(`Failed to download file: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned from storage');
  }

  // Convert Blob to Buffer
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Store text chunks in database
 */
async function storeTextChunks(
  evidenceId: string,
  chunks: Omit<TextChunk, 'evidence_id'>[]
): Promise<string[]> {
  const rows = chunks.map((chunk) => ({
    evidence_id: evidenceId,
    chunk_index: chunk.chunk_index,
    content: chunk.content,
    token_count: chunk.token_count,
  }));

  const { data, error } = await supabase
    .from('evidence_text_chunks')
    .insert(rows)
    .select('id');

  if (error) {
    throw new Error(`Failed to store text chunks: ${error.message}`);
  }

  return data.map((row) => row.id);
}

/**
 * Create a new processing job
 */
async function createJob(
  evidenceId: string,
  jobType: ProcessingJob['job_type']
): Promise<void> {
  const { error } = await supabase
    .from('processing_jobs')
    .insert({
      evidence_id: evidenceId,
      job_type: jobType,
      status: 'PENDING',
    });

  if (error) {
    throw new Error(`Failed to create ${jobType} job: ${error.message}`);
  }
}

/**
 * Fetch text chunks for evidence that don't have embeddings yet
 */
async function fetchChunksWithoutEmbeddings(
  evidenceId: string
): Promise<EvidenceTextChunk[]> {
  // Get all chunks for this evidence
  const { data: chunks, error: chunksError } = await supabase
    .from('evidence_text_chunks')
    .select('*')
    .eq('evidence_id', evidenceId)
    .order('chunk_index', { ascending: true });

  if (chunksError) {
    throw new Error(`Failed to fetch chunks: ${chunksError.message}`);
  }

  if (!chunks || chunks.length === 0) {
    return [];
  }

  // Get chunk IDs that already have embeddings
  const { data: existingEmbeddings, error: embeddingsError } = await supabase
    .from('evidence_embeddings')
    .select('chunk_id')
    .in('chunk_id', chunks.map((c) => c.id));

  if (embeddingsError) {
    throw new Error(`Failed to fetch existing embeddings: ${embeddingsError.message}`);
  }

  const existingChunkIds = new Set(
    (existingEmbeddings || []).map((e) => e.chunk_id)
  );

  // Filter out chunks that already have embeddings
  return chunks.filter((chunk) => !existingChunkIds.has(chunk.id)) as EvidenceTextChunk[];
}

/**
 * Store embeddings in database
 */
async function storeEmbeddings(
  chunkIds: string[],
  embeddings: number[][]
): Promise<void> {
  if (chunkIds.length !== embeddings.length) {
    throw new Error(
      `Chunk IDs count (${chunkIds.length}) doesn't match embeddings count (${embeddings.length})`
    );
  }

  const rows = chunkIds.map((chunkId, index) => ({
    chunk_id: chunkId,
    embedding: JSON.stringify(embeddings[index]),
  }));

  const { error } = await supabase
    .from('evidence_embeddings')
    .insert(rows);

  if (error) {
    throw new Error(`Failed to store embeddings: ${error.message}`);
  }
}

// ============================================================================
// Job Handlers
// ============================================================================

/**
 * Process TEXT_EXTRACTION job
 * Downloads file, extracts text locally, chunks it, and creates EMBEDDINGS job
 */
async function handleTextExtractionJob(job: ProcessingJob): Promise<void> {
  const { id: jobId, evidence_id } = job;

  console.log(`\n📝 [TEXT_EXTRACTION] Job ${jobId}`);
  console.log(`   Evidence: ${evidence_id}`);

  // Mark job as processing
  await updateJobStatus(jobId, 'PROCESSING');
  await updateEvidenceStatus(evidence_id, 'PROCESSING');

  // Fetch evidence metadata
  const { data: evidence, error: evidenceError } = await supabase
    .from('evidence')
    .select('*')
    .eq('id', evidence_id)
    .single();

  if (evidenceError || !evidence) {
    throw new Error(`Evidence not found: ${evidence_id}`);
  }

  const evidenceData = evidence as Evidence;
  console.log(`   File: ${evidenceData.original_filename}`);
  console.log(`   Type: ${evidenceData.mime_type || 'unknown'}`);

  // Download file from storage
  console.log(`   ⬇️  Downloading from storage...`);
  const buffer = await downloadFileFromStorage(evidenceData.storage_path);
  console.log(`   ✓ Downloaded ${buffer.length} bytes`);

  // Extract text locally (NO external LLM calls)
  console.log(`   📄 Extracting text locally...`);
  const extractedText = await extractTextFromFile({
    buffer,
    mimeType: evidenceData.mime_type,
    originalFilename: evidenceData.original_filename,
  });

  console.log(`   ✓ Extracted ${extractedText.length} characters`);

  // Check if text is too short
  if (extractedText.length < config.minChunkLength) {
    console.warn(`   ⚠️  Extracted text is very short (${extractedText.length} chars)`);
    console.warn(`   Marking job as completed but may not be useful for search`);
    await updateJobStatus(jobId, 'COMPLETED', 'Text too short');
    await updateEvidenceStatus(evidence_id, 'COMPLETED');
    return;
  }

  // Chunk the text
  console.log(`   ✂️  Chunking text...`);
  const chunks = chunkText(extractedText);
  console.log(`   ✓ Created ${chunks.length} chunks`);

  if (chunks.length === 0) {
    throw new Error('No valid chunks created from text');
  }

  // Store chunks in database
  console.log(`   💾 Storing chunks...`);
  const chunkIds = await storeTextChunks(evidence_id, chunks);
  console.log(`   ✓ Stored ${chunkIds.length} chunks`);

  // Create EMBEDDINGS job for next step
  console.log(`   🔗 Creating EMBEDDINGS job...`);
  await createJob(evidence_id, 'EMBEDDINGS');
  console.log(`   ✓ EMBEDDINGS job created`);

  // Mark this job as completed
  await updateJobStatus(jobId, 'COMPLETED');
  console.log(`   ✅ TEXT_EXTRACTION completed`);
}

/**
 * Process EMBEDDINGS job
 * Generates vector embeddings for all chunks and stores them
 */
async function handleEmbeddingsJob(job: ProcessingJob): Promise<void> {
  const { id: jobId, evidence_id } = job;

  console.log(`\n🤖 [EMBEDDINGS] Job ${jobId}`);
  console.log(`   Evidence: ${evidence_id}`);

  // Mark job as processing
  await updateJobStatus(jobId, 'PROCESSING');

  // Fetch chunks that don't have embeddings yet
  console.log(`   📊 Fetching chunks without embeddings...`);
  const chunks = await fetchChunksWithoutEmbeddings(evidence_id);

  if (chunks.length === 0) {
    console.log(`   ℹ️  All chunks already have embeddings`);
    await updateJobStatus(jobId, 'COMPLETED');
    await updateEvidenceStatus(evidence_id, 'READY');
    return;
  }

  console.log(`   ✓ Found ${chunks.length} chunks needing embeddings`);

  // Extract text content from chunks
  const texts = chunks.map((chunk) => chunk.content);

  // Generate embeddings (only small text chunks sent to API)
  console.log(`   🧠 Generating embeddings via OpenAI...`);
  const { embeddings, totalTokens } = await embedManyChunks(texts);
  console.log(`   ✓ Generated ${embeddings.length} embeddings (${totalTokens} tokens)`);

  // Store embeddings in database
  console.log(`   💾 Storing embeddings...`);
  const chunkIds = chunks.map((chunk) => chunk.id);
  await storeEmbeddings(chunkIds, embeddings);
  console.log(`   ✓ Stored ${embeddings.length} embeddings`);

  // Mark evidence as READY (all chunks have embeddings)
  await updateEvidenceStatus(evidence_id, 'READY');
  await updateJobStatus(jobId, 'COMPLETED');
  console.log(`   ✅ EMBEDDINGS completed - Evidence is now READY`);
}

/**
 * Process a single job based on its type
 */
async function processJob(job: ProcessingJob): Promise<void> {
  try {
    switch (job.job_type) {
      case 'TEXT_EXTRACTION':
        await handleTextExtractionJob(job);
        break;

      case 'EMBEDDINGS':
        await handleEmbeddingsJob(job);
        break;

      default:
        console.warn(`   ⚠️  Unknown job type: ${job.job_type}`);
        await updateJobStatus(job.id, 'FAILED', `Unknown job type: ${job.job_type}`);
    }
  } catch (error) {
    console.error(`   ❌ Job ${job.id} failed:`, error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    await updateJobStatus(job.id, 'FAILED', errorMessage);
    await updateEvidenceStatus(job.evidence_id, 'FAILED');
  }
}

// ============================================================================
// Main Worker Loop
// ============================================================================

/**
 * Main worker loop - polls for jobs and processes them
 */
async function workerLoop(): Promise<void> {
  console.log('🔄 Polling for jobs...\n');

  try {
    // Fetch pending jobs
    const jobs = await fetchPendingJobs(config.batchSize);

    if (jobs.length === 0) {
      // No jobs found, sleep and retry
      await sleep(config.pollIntervalMs);
      return;
    }

    console.log(`📋 Found ${jobs.length} pending job(s)`);

    // Process each job sequentially
    for (const job of jobs) {
      await processJob(job);
    }

    console.log(`\n✅ Processed ${jobs.length} job(s)\n`);
  } catch (error) {
    console.error('❌ Error in worker loop:', error);
    // Continue running even if there's an error
    await sleep(config.pollIntervalMs);
  }
}

/**
 * Start the ingestion worker
 */
async function startWorker(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         LINDEX Ingestion Worker Starting...                   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('⚙️  Configuration:');
  console.log(`   - Supabase URL: ${supabaseUrl}`);
  console.log(`   - Poll Interval: ${config.pollIntervalMs}ms`);
  console.log(`   - Batch Size: ${config.batchSize} jobs`);
  console.log(`   - Chunk Size: ${config.chunkSize} chars`);
  console.log(`   - Chunk Overlap: ${config.chunkOverlap} chars\n`);

  console.log('🔒 Privacy & Compliance:');
  console.log('   ✓ PDF/Image extraction is LOCAL only');
  console.log('   ✓ Only text chunks sent to embeddings API');
  console.log('   ✓ No chat/completion APIs called');
  console.log('   ✓ No legal analysis performed\n');

  console.log('✅ Worker started successfully!\n');
  console.log('Press Ctrl+C to stop.\n');
  console.log('═'.repeat(64) + '\n');

  // Handle graceful shutdown
  let isShuttingDown = false;

  const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log('\n\n🛑 Shutting down worker gracefully...');
    console.log('   Waiting for current jobs to complete...\n');

    // Give current jobs a moment to finish
    await sleep(2000);

    console.log('👋 Worker stopped. Goodbye!\n');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Infinite loop
  while (!isShuttingDown) {
    await workerLoop();
  }
}

// ============================================================================
// Entry Point
// ============================================================================

startWorker().catch((error) => {
  console.error('\n💥 Fatal error starting worker:', error);
  process.exit(1);
});
