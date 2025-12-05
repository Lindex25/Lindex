# LINDEX Ingestion Worker

## Overview

The ingestion worker is a background process that runs outside the HTTP request cycle. It polls the `processing_jobs` table and processes evidence files through a two-step pipeline:

1. **TEXT_EXTRACTION**: Downloads files, extracts text locally, chunks it
2. **EMBEDDINGS**: Generates vector embeddings for searchability

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Upload Evidence (API)                        │
│  User uploads PDF/image → Stored in Supabase Storage            │
│  → Creates TEXT_EXTRACTION job in processing_jobs                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              Step 1: TEXT_EXTRACTION (Worker)                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Download file from Supabase Storage                  │   │
│  │ 2. Extract text LOCALLY (pdf-parse / tesseract.js)     │   │
│  │ 3. Chunk text (1000 chars, 200 overlap)                │   │
│  │ 4. Store chunks in evidence_text_chunks table          │   │
│  │ 5. Create EMBEDDINGS job                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ✅ No external LLM calls - 100% local processing               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│               Step 2: EMBEDDINGS (Worker)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Fetch chunks without embeddings                      │   │
│  │ 2. Generate embeddings via OpenAI API                   │   │
│  │    (only small text chunks sent, not full docs)         │   │
│  │ 3. Store embeddings in evidence_embeddings table        │   │
│  │ 4. Mark evidence as READY                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ⚠️  Only text chunks sent to API (OpenAI embeddings only)      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Evidence Now Searchable                       │
│  Vector similarity search available via pgvector                 │
│  Ready for RAG (Retrieval-Augmented Generation) queries          │
└─────────────────────────────────────────────────────────────────┘
```

## Files Structure

```
apps/api-web/
├── lib/
│   ├── text-extraction.ts      # Local PDF/image text extraction
│   ├── embeddings.ts            # OpenAI embeddings generation
│   └── supabase-server.ts       # Supabase client (server-side)
├── scripts/
│   └── ingestion-worker.ts      # Main worker process
└── docs/
    ├── INGESTION.md             # General ingestion overview
    └── INGESTION_WORKER.md      # This file
```

## Running the Worker

### Development

```bash
cd apps/api-web
npm run ingest:dev
```

This uses `tsx` to run the TypeScript file directly without compilation.

### Production

For production, consider:

1. **Compile to JavaScript:**
   ```bash
   tsc scripts/ingestion-worker.ts --outDir dist
   node dist/ingestion-worker.js
   ```

2. **Use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start scripts/ingestion-worker.ts --name lindex-worker --interpreter tsx
   pm2 save
   pm2 startup
   ```

3. **Use Docker container:**
   ```dockerfile
   FROM node:18
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   CMD ["npm", "run", "ingest:dev"]
   ```

## Configuration

All configuration is via environment variables in `.env.local`:

### Required Variables

```bash
# Supabase (Database & Storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI (Embeddings only)
OPENAI_API_KEY=sk-proj-...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_EMBEDDING_DIMENSIONS=1536
```

### Optional Variables

```bash
# Ingestion settings
INGESTION_CHUNK_SIZE=1000              # Characters per chunk
INGESTION_CHUNK_OVERLAP=200            # Overlap between chunks
OPENAI_MAX_TOKENS_PER_CHUNK=512        # Max tokens per chunk
```

## Worker Behavior

### Polling

- Polls `processing_jobs` table every **3 seconds** (configurable)
- Fetches up to **5 jobs** per loop (configurable)
- Processes jobs **sequentially** (simple, reliable)
- Sleeps when no jobs are found

### Job Processing

#### TEXT_EXTRACTION Job

1. **Fetch evidence metadata** from `evidence` table
2. **Download file** from Supabase Storage `evidence` bucket
3. **Extract text locally** using:
   - `pdf-parse` for PDFs
   - `tesseract.js` for images
4. **Validate** extracted text (min 50 characters)
5. **Chunk text** into ~1000 character segments with 200 char overlap
6. **Store chunks** in `evidence_text_chunks` table
7. **Create EMBEDDINGS job** for next step
8. **Update status** to `COMPLETED`

#### EMBEDDINGS Job

1. **Fetch chunks** from `evidence_text_chunks` that don't have embeddings
2. **Generate embeddings** via OpenAI API in batches
3. **Store embeddings** in `evidence_embeddings` table
4. **Mark evidence** as `READY` (available for search)
5. **Update status** to `COMPLETED`

### Error Handling

- Each job wrapped in `try/catch`
- On error:
  - Job status → `FAILED`
  - Error message stored (truncated to 500 chars)
  - Full error logged to console
  - Worker continues processing other jobs
- Evidence status updated to `FAILED` on extraction errors

### Status Transitions

```
Evidence Status Flow:
PENDING → PROCESSING → READY
                    ↓
                 FAILED

Job Status Flow:
PENDING → PROCESSING → COMPLETED
                    ↓
                 FAILED
```

## Database Schema

### processing_jobs Table

```sql
CREATE TABLE processing_jobs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_id     uuid NOT NULL REFERENCES evidence(id),
    job_type        text NOT NULL,  -- 'TEXT_EXTRACTION' or 'EMBEDDINGS'
    status          text NOT NULL DEFAULT 'PENDING',
    last_error      text NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);
```

### evidence Table

```sql
CREATE TABLE evidence (
    id                  uuid PRIMARY KEY,
    case_id             uuid NOT NULL,
    user_id             uuid NOT NULL,
    storage_path        text NOT NULL,     -- Path in Supabase Storage
    media_type          text NOT NULL,     -- 'PDF' or 'IMAGE'
    original_filename   text NOT NULL,
    mime_type           text NULL,
    size_bytes          bigint NULL,
    processing_status   text NOT NULL DEFAULT 'PENDING',
    created_at          timestamptz NOT NULL DEFAULT now()
);
```

### evidence_text_chunks Table

```sql
CREATE TABLE evidence_text_chunks (
    id              uuid PRIMARY KEY,
    evidence_id     uuid NOT NULL REFERENCES evidence(id),
    chunk_index     int NOT NULL,          -- 0-based index
    content         text NOT NULL,         -- Extracted text chunk
    token_count     int NULL,              -- Approximate token count
    created_at      timestamptz NOT NULL DEFAULT now()
);
```

### evidence_embeddings Table

```sql
CREATE TABLE evidence_embeddings (
    id              uuid PRIMARY KEY,
    chunk_id        uuid NOT NULL REFERENCES evidence_text_chunks(id),
    embedding       vector NOT NULL,       -- pgvector type
    created_at      timestamptz NOT NULL DEFAULT now()
);
```

## Monitoring & Observability

### Console Logs

The worker outputs structured logs:

```
📝 [TEXT_EXTRACTION] Job abc-123
   Evidence: def-456
   File: contract.pdf
   Type: application/pdf
   ⬇️  Downloading from storage...
   ✓ Downloaded 245789 bytes
   📄 Extracting text locally...
   ✓ Extracted 12543 characters
   ✂️  Chunking text...
   ✓ Created 13 chunks
   💾 Storing chunks...
   ✓ Stored 13 chunks
   🔗 Creating EMBEDDINGS job...
   ✓ EMBEDDINGS job created
   ✅ TEXT_EXTRACTION completed

🤖 [EMBEDDINGS] Job xyz-789
   Evidence: def-456
   📊 Fetching chunks without embeddings...
   ✓ Found 13 chunks needing embeddings
   🧠 Generating embeddings via OpenAI...
   ✓ Generated 13 embeddings (3142 tokens)
   💾 Storing embeddings...
   ✓ Stored 13 embeddings
   ✅ EMBEDDINGS completed - Evidence is now READY
```

### Future Enhancements

For production, consider adding:

1. **Structured Logging**
   ```typescript
   import winston from 'winston';
   const logger = winston.createLogger({
     format: winston.format.json(),
     transports: [new winston.transports.Console()],
   });
   ```

2. **Error Monitoring**
   ```typescript
   import * as Sentry from '@sentry/node';
   Sentry.init({ dsn: process.env.SENTRY_DSN });
   ```

3. **Metrics Collection**
   ```typescript
   import { Counter, Histogram } from 'prom-client';
   const jobsProcessed = new Counter({
     name: 'jobs_processed_total',
     labelNames: ['type', 'status'],
   });
   ```

## Troubleshooting

### Worker Not Starting

**Error:** `Missing required environment variables`

**Solution:** Ensure `.env.local` contains all required variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
```

### Jobs Not Being Processed

**Check 1:** Is worker running?
```bash
# Look for the process
ps aux | grep ingestion-worker
```

**Check 2:** Are there pending jobs?
```sql
SELECT * FROM processing_jobs WHERE status = 'PENDING';
```

**Check 3:** Worker logs?
```bash
# Check console output for errors
```

### Text Extraction Fails

**Common Issues:**

1. **Unsupported file type**
   - Only PDF and images (PNG, JPG, JPEG, TIFF, BMP, WEBP) supported
   - Check `mime_type` and `original_filename` in evidence table

2. **File not found in storage**
   - Verify `storage_path` is correct
   - Check Supabase Storage `evidence` bucket

3. **Corrupted file**
   - File may be damaged or incomplete
   - Check original upload

### Embeddings Generation Fails

**Common Issues:**

1. **OpenAI API key invalid**
   - Verify `OPENAI_API_KEY` in `.env.local`
   - Check key at https://platform.openai.com/api-keys

2. **Rate limit exceeded**
   - Worker has built-in delays (100ms between batches)
   - Consider upgrading OpenAI plan

3. **Text chunk too long**
   - Max ~8000 tokens per chunk for text-embedding-3-small
   - Reduce `INGESTION_CHUNK_SIZE` if needed

## Security & Compliance

### ✅ What Happens Locally

- **All file downloads** from Supabase Storage (local network)
- **All PDF parsing** using pdf-parse (local library)
- **All OCR processing** using tesseract.js (WASM, runs locally)
- **All text chunking** (local string manipulation)

### ⚠️  What Goes to External APIs

- **Only text chunks** sent to OpenAI Embeddings API
- **No full documents** sent externally
- **No chat/completion APIs** called
- **No legal analysis** performed

### 🔒 Data Flow

```
Full Document (Local)
      ↓
Text Extraction (Local)
      ↓
Text Chunking (Local)
      ↓
Small Text Chunks → OpenAI Embeddings API
      ↓
Vector Embeddings (Stored Locally)
```

### 📋 Compliance Checklist

- [x] File processing is 100% local
- [x] Only small chunks sent to external API
- [x] OpenAI configured for no training data usage
- [x] Worker never calls chat/completion APIs
- [x] Worker never performs legal research
- [x] Clear audit trail in database (processing_jobs)
- [x] Error messages logged (truncated, no PII)

## Performance

### Current Capacity

- **Single worker:** ~5-20 jobs/minute (varies by file size)
- **PDF extraction:** ~1-5 seconds per page
- **OCR:** ~2-10 seconds per image
- **Embeddings:** ~1-3 seconds per 10 chunks

### Scaling Options

1. **Horizontal Scaling:** Run multiple worker instances
   - Each polls same database
   - PostgreSQL handles concurrency
   - Set different `WORKER_ID` for each instance

2. **Vertical Scaling:** Increase resources
   - More CPU for OCR processing
   - More memory for large PDFs

3. **Optimize Chunking:** Reduce chunk count
   - Larger chunks = fewer embeddings calls
   - Balance: searchability vs. cost

## Development Tips

### Test Locally

1. **Create test job manually:**
   ```sql
   -- First, upload a test file and create evidence
   INSERT INTO evidence (id, case_id, user_id, storage_path, media_type, original_filename, mime_type)
   VALUES (
     gen_random_uuid(),
     'your-case-id',
     'your-user-id',
     'path/to/test.pdf',
     'PDF',
     'test.pdf',
     'application/pdf'
   );

   -- Then create a TEXT_EXTRACTION job
   INSERT INTO processing_jobs (evidence_id, job_type, status)
   VALUES ('evidence-id-from-above', 'TEXT_EXTRACTION', 'PENDING');
   ```

2. **Start worker:**
   ```bash
   npm run ingest:dev
   ```

3. **Watch logs** for processing

### Debug Mode

Add debug logging:

```typescript
// In scripts/ingestion-worker.ts
const DEBUG = process.env.DEBUG === 'true';

if (DEBUG) {
  console.log('Debug info:', { job, evidence, chunks });
}
```

Run with:
```bash
DEBUG=true npm run ingest:dev
```

## FAQ

**Q: Can I process multiple jobs in parallel?**

A: Currently jobs are processed sequentially. For parallel processing, implement a worker pool with concurrency control.

**Q: What happens if worker crashes mid-job?**

A: Job status remains `PROCESSING`. On restart, it won't be picked up (only `PENDING` jobs). You'll need to manually reset status or implement a timeout mechanism.

**Q: How do I retry failed jobs?**

A: Update job status back to `PENDING`:
```sql
UPDATE processing_jobs
SET status = 'PENDING', last_error = NULL
WHERE status = 'FAILED';
```

**Q: Can I use a different embedding provider?**

A: Yes! Update `lib/embeddings.ts` to call a different API or use local models (e.g., sentence-transformers).

---

**Last Updated:** 2025-12-05
**Version:** 1.0
**Maintained By:** LINDEX Development Team

