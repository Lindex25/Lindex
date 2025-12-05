# LINDEX Database Migrations

This directory contains SQL migration files for the LINDEX database schema.

## Running Migrations

### Quick Start (Supabase Dashboard)

**This is the fastest method and requires no additional tools:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your LINDEX project
3. Click **SQL Editor** → **New query**
4. Copy the contents of the migration file (e.g., `001_init_lindex_schema.sql`)
5. Paste into the editor and click **Run**
6. Verify tables in **Table Editor**

### Using Supabase CLI

See [INSTALL_SUPABASE_CLI.md](./INSTALL_SUPABASE_CLI.md) for setup instructions.

Once installed:
```bash
supabase db execute -f infra/sql/001_init_lindex_schema.sql
```

### Using psql

If you have PostgreSQL installed:
```bash
psql "your-supabase-connection-string" -f infra/sql/001_init_lindex_schema.sql
```

Get your connection string from: Supabase Dashboard → Settings → Database → Connection String

## Migration Files

| File | Description | Status |
|------|-------------|--------|
| `001_init_lindex_schema.sql` | Initial schema with 8 core tables | ⏳ Pending |
| `002_rls_policies.sql` | Row Level Security policies (scaffolding for future) | ⏳ Pending |

## Schema Overview

The current schema includes:

- **users** - Clerk-integrated user accounts
- **cases** - Legal case management
- **evidence** - Document/media storage metadata
- **evidence_text_chunks** - Extracted text for AI processing
- **evidence_embeddings** - Vector embeddings for semantic search (pgvector)
- **processing_jobs** - Background job tracking
- **audit_log** - Compliance and audit trail
- **ai_queries** - AI interaction tracking

## Next Steps After Running Migration

1. ✅ Run `001_init_lindex_schema.sql`
2. 🔒 Set up Row Level Security (RLS) policies
3. 🔐 Configure appropriate database roles and permissions
4. 📊 Set up vector index with your embedding model dimensions
5. ⚡ Add triggers for `updated_at` auto-update on `processing_jobs`

## Notes

- All tables use UUID primary keys with `gen_random_uuid()`
- Foreign keys use `ON DELETE CASCADE` for data integrity
- pgvector extension is enabled for semantic search
- Indexes are pre-configured for common query patterns

