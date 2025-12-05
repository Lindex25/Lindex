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

## AI Query Engine (RAG)

### Overview

After documents are ingested and embedded, users can query their evidence using LINDEX's AI Query Engine, which implements Retrieval-Augmented Generation (RAG).

### ═══════════════════════════════════════════════════════════════════════════
### COMPLIANCE & ETHICAL AI CONSTRAINTS
### ═══════════════════════════════════════════════════════════════════════════

#### 1. SERVER-SIDE LEGAL ADVICE GUARD (FIRST LINE OF DEFENSE)

**LINDEX includes a heuristic guard that detects and blocks obvious legal advice questions before they reach the AI model:**

- ✅ **Pattern Detection**: Server-side function (`isLegalAdviceLikeQuestion`) checks for 35+ patterns indicating legal advice requests
- ✅ **Examples Blocked**: "What should I argue?", "How do I win?", "What is the law on X?", "Should I sue?", "Is this legal?"
- ✅ **No Model Call**: When triggered, LINDEX does NOT call OpenAI and instead returns a fixed warning message
- ✅ **Fixed Response**: Users receive a clear explanation that LINDEX cannot provide legal advice, what to argue in court, or predict outcomes, and are directed to consult a qualified legal professional
- ✅ **Accountability**: These refusal responses are still logged to both `ai_queries` and `audit_log` tables for compliance tracking and abuse detection
- ✅ **Cost Optimization**: Saves API costs by short-circuiting inappropriate questions
- ✅ **Heuristic Only**: Simple substring matching (not ML-based), so not exhaustive—serves as first layer of defense

**Standard Refusal Message:**
```
"I'm not able to tell you what arguments to make, what the law is, or
what outcome you might get. LINDEX can only help you explore and understand
the evidence you've uploaded. For legal advice about what to do, you should
speak to a qualified legal professional."
```

**Why This Guard Exists:**
- Proactive protection against unauthorized practice of law
- Immediate feedback to users about system limitations
- Reduces risk of users mistaking AI output for legal counsel
- Demonstrates good-faith effort to prevent misuse
- Complements the AI system prompt constraints (second layer of defense)

**Technical Implementation:**
- File: `lib/legal-safety.ts`
- Function: `isLegalAdviceLikeQuestion(question: string): boolean`
- Audit Action: `AI_QUERY_LEGAL_ADVICE_REFUSED` (when triggered)

#### 2. EVIDENCE-ONLY ANSWERING

**LINDEX only answers questions about the user's uploaded evidence:**

- ✅ **Scope**: Questions are answered exclusively from the user's case evidence
- ✅ **No External Research**: System does NOT call external legal databases, case law repositories, or statute APIs
- ✅ **No Web Search**: System does NOT search the internet or access external knowledge bases
- ✅ **User's Data Only**: All retrieved context comes from evidence_text_chunks table for that specific case
- ✅ **Strict Isolation**: Per-user, per-case isolation enforced via database queries and RLS policies

**What This Means:**
- If a legal principle isn't in the user's evidence, the AI cannot cite it
- If case law isn't in the user's documents, the AI cannot reference it
- The AI operates within the "four corners" of the uploaded evidence

#### 3. NO LEGAL ADVICE

**The system prompt explicitly instructs the model not to provide legal advice:**

```
You are LINDEX, an AI assistant that only answers using the provided evidence snippets.

If the evidence does not contain enough information, you must reply:
'I cannot answer this question based on the evidence available in this case space.'

Do not invent facts, cases, laws, or outcomes.
Do not provide legal advice, only help the user understand their own evidence.

Do not cite case law or legislation titles unless they are present in the provided evidence.

If asked for legal advice or about what they should argue in court, respond with a
warning and suggest consulting a qualified legal professional.

Always base your answer only on the evidence snippets provided in this conversation.
If something is not in the snippets, treat it as unknown.
```

**Behavioral Constraints:**

| User Request | AI Response |
|--------------|-------------|
| "What does this document say about X?" | ✅ Answers based on evidence |
| "Summarize the evidence about Y" | ✅ Summarizes from available documents |
| "What should I argue in court?" | ❌ Refuses, suggests legal professional |
| "Am I likely to win this case?" | ❌ Refuses, cannot predict outcomes |
| "What does the law say about Z?" | ❌ Only if Z appears in user's evidence |
| "Cite case law supporting my position" | ❌ Only if case law is in uploaded documents |

#### 4. INSUFFICIENT EVIDENCE HANDLING

**When evidence is insufficient to answer a question:**

The AI is instructed to respond with:

```
"I cannot answer this question based on the evidence available in this case space."
```

The system will NOT:
- ❌ Invent facts not present in the evidence
- ❌ Speculate or make assumptions
- ❌ Fill gaps with general legal knowledge
- ❌ Cite external sources (case law, statutes, legal treatises)

#### 5. LIMITATION NOTICE (MANDATORY)

**All answers are accompanied by a limitation notice:**

```
"This answer is based only on the evidence you uploaded.
It may be incomplete or inaccurate and is not legal advice."
```

This notice:
- ✅ **Displayed with EVERY answer** (no exceptions)
- ✅ **Visible in both web and mobile UIs**
- ✅ **Part of the API response structure** (cannot be bypassed)
- ✅ **Mandatory compliance element** (removing it requires legal review)

#### 6. USER INTERFACE COMPLIANCE

**Mandatory UX Elements (DO NOT REMOVE WITHOUT LEGAL REVIEW):**

1. **Info Banner** (top of Ask AI panel):
   ```
   "LINDEX uses AI to help you explore your evidence.
   It cannot tell you what a judge, tribunal, or lawyer will decide,
   and it does not replace legal advice."
   ```

2. **"Not Legal Advice" Badge**: Displayed prominently with every answer

3. **Limitation Notice**: Shown below every answer in smaller text

4. **Sources Section**: Lists which evidence documents were used (transparency)

**Why These Are Mandatory:**
- Legal liability protection for LINDEX and users
- Prevents users from mistaking AI output for professional legal advice
- Complies with unauthorized practice of law regulations
- Ensures informed consent and transparency

#### 7. NO CASE LAW OR LEGISLATION NAMES

**Unless they appear in the user's evidence:**

- ❌ AI cannot cite "Smith v. Jones (2023)" unless it's in uploaded documents
- ❌ AI cannot reference "Section 123 of the XYZ Act" unless it's in evidence
- ❌ AI cannot invoke legal precedents not present in user's files

**Why This Constraint Exists:**
- Prevents hallucination of legal authorities
- Ensures all citations are verifiable by the user
- Avoids giving false confidence in legal positions
- Reduces risk of incorrect legal interpretation

#### 8. AUDIT TRAIL & COMPLIANCE LOGGING

**Every AI query is logged for compliance:**

1. **ai_queries table**: Stores question, answer summary, user_id, case_id, timestamp
2. **audit_log table**: Records full metadata including sources used, correlation IDs
3. **Purpose**: Legal traceability, quality assurance, abuse detection

**What is NOT Logged:**
- Sensitive PII (passwords, credit cards, SSNs)
- Full document contents (only metadata)
- User authentication tokens

### RAG Query Flow

```
User Question
     ↓
1. Embed question (OpenAI Embeddings API)
     ↓
2. Vector search over user's case evidence (pgvector)
     ↓
3. Retrieve top N relevant text chunks (typically 5)
     ↓
4. Build context from retrieved snippets
     ↓
5. Send to OpenAI Chat Completion with:
   - System prompt (compliance constraints)
   - User question
   - Evidence snippets only
     ↓
6. Generate answer (GPT-4o-mini, low temperature)
     ↓
7. Return answer + sources + limitation notice
     ↓
8. Log to ai_queries and audit_log tables
```

### Technical Implementation

**Files:**
- `lib/rag.ts`: RAG query engine with compliance-focused system prompt
- `app/api/cases/[caseId]/query/route.ts`: API endpoint with authentication and audit logging
- `components/AskAiPanel.tsx`: Web UI with mandatory compliance elements
- `app/AskAiScreen.tsx`: Mobile UI with mandatory compliance elements

**Database Function:**
- `search_case_evidence_embeddings()`: Vector similarity search with strict user+case filtering

### API Response Structure

```typescript
{
  "answer_text": "Based on the evidence...",
  "sources": [
    {
      "evidence_id": "uuid",
      "snippet": "Relevant text excerpt..."
    }
  ],
  "limitation_notice": "This answer is based only on the evidence you uploaded. It may be incomplete or inaccurate and is not legal advice."
}
```

### Security & Privacy

- ✅ **Per-User, Per-Case Isolation**: Database queries enforce user_id and case_id filters
- ✅ **RLS Policies**: Row-Level Security prevents cross-user data access
- ✅ **Authentication Required**: Clerk session validation on every request
- ✅ **Case Ownership Verification**: Explicit check before processing query
- ✅ **No PII in Prompts**: Only send evidence snippets, not user metadata

### Limitations & Known Constraints

1. **Context Window**: Limited to top 5 evidence snippets (configurable)
2. **Chunk Size**: Answers based on 500-1500 char chunks, not full documents
3. **No Cross-Evidence Synthesis**: AI sees individual chunks, not entire case file at once
4. **Model Knowledge Cutoff**: GPT-4o-mini has a knowledge cutoff date (not real-time legal research)
5. **Determinism**: Low temperature (0.1) reduces but doesn't eliminate variability

### User Education

**Users should understand:**
- AI answers are only as good as the evidence uploaded
- Missing documents = incomplete answers
- AI cannot predict legal outcomes or judge decisions
- AI cannot replace consultation with a qualified lawyer
- AI sees text only (no understanding of document authenticity, credibility, or legal weight)

### Compliance Checklist for Deployment

Before launching RAG query feature:

- [ ] Verify system prompt includes all compliance constraints
- [ ] Test that AI refuses legal advice requests
- [ ] Confirm limitation notice displays on all UIs (web, mobile)
- [ ] Verify "Not Legal Advice" badge is visible
- [ ] Test insufficient evidence handling ("I cannot answer...")
- [ ] Confirm audit logging captures all queries
- [ ] Review Terms of Service includes AI disclaimer
- [ ] Add user consent flow acknowledging limitations
- [ ] Test per-user, per-case isolation
- [ ] Verify no external legal database calls
- [ ] Document OpenAI data usage settings (30-day retention, no training)

## Future Enhancements

- **Self-Hosted Embeddings**: Consider using open-source models (e.g., sentence-transformers) to eliminate external API dependency
- **Incremental Updates**: Support updating embeddings when documents are modified
- **Multi-Language Support**: Add language detection and model selection
- **Advanced Chunking**: Implement semantic chunking (chunk by paragraphs, sections)
- **Metadata Enrichment**: Extract document metadata (dates, parties, case numbers) during ingestion
- **Self-Hosted LLMs**: Explore on-premise LLMs for complete data sovereignty (e.g., Llama 3, Mistral)

## References

- [OpenAI API Data Usage Policy](https://openai.com/policies/api-data-usage-policies)
- [pdf-parse Documentation](https://www.npmjs.com/package/pdf-parse)
- [tesseract.js Documentation](https://tesseract.projectnaptha.com/)
- [pgvector Extension](https://github.com/pgvector/pgvector)

---

**Last Updated**: 2025-12-05
**Maintained By**: LINDEX Development Team

