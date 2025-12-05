# LINDEX Ingestion Pipeline

## Overview

The LINDEX ingestion pipeline processes legal documents (PDFs, images) to extract text and generate vector embeddings for semantic search and AI-assisted analysis.

## ═══════════════════════════════════════════════════════════════════════════
## COMPLIANCE & PRIVACY ARCHITECTURE
## ═══════════════════════════════════════════════════════════════════════════

### 1. LOCAL-ONLY EXTRACTION

**All document parsing and content extraction happens locally in the LINDEX backend:**

- ✅ **PDF Text Extraction**: Uses `pdf-parse` library running on our servers (100% local processing)
- ✅ **Image OCR**: Uses `tesseract.js` (WASM-based) running entirely in Node.js process (100% local)
- ✅ **No Raw Document Bytes Sent Externally**: Complete documents NEVER leave our infrastructure
- ✅ **No LLM Calls During Extraction**: Zero external AI/LLM APIs called during text extraction phase

**Technical Implementation:**
- PDF parsing: `pdf-parse` npm package (JavaScript library, local execution)
- OCR: `tesseract.js` (WebAssembly, runs in Node.js, no external network calls)
- All file I/O and processing happens within our Supabase and compute infrastructure

### 2. EMBEDDINGS-ONLY EXTERNAL CALLS

**Only small, pre-chunked text segments are sent to external providers:**

- ✅ **Short Text Chunks Only**: Typically 500-1500 characters per chunk
- ✅ **Pre-Chunked Locally**: Text is split into chunks BEFORE any external API calls
- ✅ **Provider**: OpenAI Embeddings API (`text-embedding-3-small` model)
- ✅ **What is Sent**: Short text segments after local chunking
- ✅ **What is NOT Sent**: Full documents, raw PDF bytes, image bytes, document metadata
- ✅ **Never Uses Chat/Completion**: This module NEVER calls chat or completion endpoints during ingestion

**What Stays Local vs. What Goes External:**

| Data Type | Processing Location | External API Calls |
|-----------|--------------------|--------------------|
| Raw PDF bytes | 100% Local | ❌ Never sent |
| Raw image bytes | 100% Local | ❌ Never sent |
| Full extracted text | 100% Local | ❌ Never sent |
| Document metadata | 100% Local | ❌ Never sent |
| Small text chunks (500-1500 chars) | ✅ Sent to OpenAI Embeddings | ✓ Only for embeddings |
| Vector embeddings (returned) | Stored locally in PostgreSQL | N/A |

### 3. NO LEGAL RESEARCH OR ADVICE

**This ingestion pipeline does NOT perform legal research or generate legal advice:**

- ✅ **Purpose**: Make user's own evidence searchable and analyzable later
- ✅ **Scope**: Data preparation pipeline only (extract → chunk → embed → store)
- ✅ **No Analysis**: Does not interpret, summarize, or analyze legal content
- ✅ **No Advice**: Does not generate legal recommendations or strategies
- ✅ **User-Facing Analysis**: Legal research and advice generation happen separately in user-facing RAG query APIs

**Compliance Note:** The ingestion worker is a technical data processing system, not a legal reasoning system.

### 4. PROVIDER DATA-USAGE CONSTRAINTS

**CRITICAL REQUIREMENT: OpenAI Account Configuration**

The OpenAI API account used for embeddings **MUST** be configured as follows:

#### Required Settings (Enforced in Provider Dashboard)

1. **Data Usage for Training: OFF**
   - API inputs/outputs are NOT used to train OpenAI models
   - This is the default for API usage (not for free ChatGPT)
   - **Verify at**: https://platform.openai.com/account/data-usage

2. **Data Retention: 30 Days Maximum**
   - OpenAI retains API data for 30 days for abuse/safety monitoring only
   - After 30 days, data is automatically deleted
   - No long-term storage of submitted text chunks

3. **Minimal Logging in Application**
   - Log only metadata: timestamp, chunk count, token usage, correlation IDs
   - NEVER log the actual text content being embedded
   - NEVER log user PII in application logs

#### Verification Checklist

Before deploying to production:

- [ ] Navigate to https://platform.openai.com/account/data-usage
- [ ] Verify "Data usage for training" toggle is **OFF**
- [ ] Document this verification in compliance/security audit logs
- [ ] Review OpenAI's data usage policy: https://openai.com/policies/api-data-usage-policies
- [ ] Inform users (in Terms of Service) that text chunks are sent to OpenAI for embeddings
- [ ] Implement monitoring to detect if chunks contain excessive PII (optional but recommended)

#### Configuration Note

**This configuration is enforced in the provider's dashboard, not in code.**

The ingestion worker code cannot programmatically verify these settings. This is a **manual verification and documentation requirement** for compliance.

### 5. ADDITIONAL SECURITY MEASURES

Beyond the core compliance architecture:

- **Chunking Strategy**: Text segmented into small, semantically meaningful chunks before embedding
- **PII Filtering** (optional): Consider implementing PII detection/redaction before sending chunks
- **Audit Trail**: All ingestion operations logged with document IDs, timestamps, user IDs (but NOT content)
- **Rate Limiting**: Implement rate limits to prevent accidental bulk data exposure
- **Access Control**: Only service role keys can trigger ingestion jobs

## Pipeline Workflow

1. **Document Upload**: User uploads PDF or image file via API
2. **Local Extraction**:
   - PDFs → `pdf-parse` extracts text
   - Images → `tesseract.js` performs OCR
3. **Text Chunking**: Extracted text is split into overlapping chunks (e.g., 512 tokens with 128 token overlap)
4. **Embedding Generation**: Each chunk is sent to OpenAI API to generate vector embeddings
5. **Storage**: Embeddings and metadata stored in PostgreSQL (pgvector extension)
6. **Indexing**: Vectors indexed for efficient similarity search

## Running the Ingestion Worker

### Development
```bash
npm run ingest:dev
```

### Production
TBD: Will use a proper task queue (e.g., BullMQ, Celery) for distributed processing

## Dependencies

| Package | Purpose | Local/External |
|---------|---------|----------------|
| `pdf-parse` | Extract text from PDF files | Local |
| `tesseract.js` | OCR for images | Local |
| `openai` | Generate embeddings via API | External (OpenAI API) |

## Environment Variables

Required environment variables (to be added to `.env.local`):

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...                    # API key for embeddings
OPENAI_EMBEDDING_MODEL=text-embedding-3-small  # Model to use
OPENAI_MAX_TOKENS_PER_CHUNK=512          # Max tokens per chunk

# Ingestion Configuration
INGESTION_CHUNK_SIZE=1000                # Characters per chunk
INGESTION_CHUNK_OVERLAP=200              # Overlap between chunks
INGESTION_MAX_FILE_SIZE=52428800         # Max file size (50MB)
```

## Security Checklist

Before deploying to production:

- [ ] Verify OpenAI account data usage settings
- [ ] Implement file upload size limits
- [ ] Add file type validation (allowlist: PDF, PNG, JPG, TIFF)
- [ ] Implement rate limiting on ingestion endpoints
- [ ] Add virus scanning for uploaded files
- [ ] Set up monitoring/alerting for API usage spikes
- [ ] Document data retention policy for embeddings
- [ ] Implement audit logging for all ingestion operations
- [ ] Add user consent flows for document processing
- [ ] Review compliance with GDPR, CCPA, HIPAA as applicable

## Future Enhancements

- **Self-Hosted Embeddings**: Consider using open-source models (e.g., sentence-transformers) to eliminate external API dependency
- **Incremental Updates**: Support updating embeddings when documents are modified
- **Multi-Language Support**: Add language detection and model selection
- **Advanced Chunking**: Implement semantic chunking (chunk by paragraphs, sections)
- **Metadata Enrichment**: Extract document metadata (dates, parties, case numbers) during ingestion

## References

- [OpenAI API Data Usage Policy](https://openai.com/policies/api-data-usage-policies)
- [pdf-parse Documentation](https://www.npmjs.com/package/pdf-parse)
- [tesseract.js Documentation](https://tesseract.projectnaptha.com/)
- [pgvector Extension](https://github.com/pgvector/pgvector)

---

**Last Updated**: 2025-12-05
**Maintained By**: LINDEX Development Team

