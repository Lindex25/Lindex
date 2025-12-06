# Installing Supabase CLI on Windows

## Using Scoop (Recommended)

### 1. Install Scoop (if not already installed)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

### 2. Add Supabase bucket and install CLI
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 3. Verify installation
```powershell
supabase --version
```

### 4. Link to your project
```powershell
supabase login
supabase link --project-ref your-project-ref
```

### 5. Run migrations
```powershell
supabase db execute -f infra/sql/001_init_lindex_schema.sql
```

## Alternative: Using npm (Local to project)

If you prefer not to use Scoop, you can use npx:

```bash
npx supabase db execute -f infra/sql/001_init_lindex_schema.sql --db-url "your-database-url"
```

Get your database URL from: Supabase Dashboard → Settings → Database → Connection String (URI)


