# Supabase Plugin for Notegen

This plugin adds GitHub/GitLab authentication and SQL-backed state synchronization to your Notegen databases. Instead of CSV database tables being completely static, users can log in and save cell changes (like toggling a "read/прочитано" column) which sync dynamically to a Supabase database.

## Prerequisites

1. A **Supabase** project. If you don't have one, create a free project at [supabase.com](https://supabase.com).
2. **GitHub** or **GitLab** OAuth credentials configured in your Supabase project (under **Authentication > Providers**).

## Setup Instructions

### 1. Database Schema
Run the SQL queries from [schema.sql](file:///home/d4y2k/progs/notegen/plugins/supabase/schema.sql) in your Supabase SQL Editor. This will create the `database_overrides` table and enable Row Level Security (RLS) policies so users can only view and update their own overrides.

### 2. OAuth Redirects
In your Supabase Auth settings, add the redirect URI for your site. For local development, this is typically:
```
http://localhost:4321
```

### 3. Notegen Config
Enable the plugin in `vault/notegen.config.json` by adding the `"supabase"` key under `"plugins"`:

```json
{
  "siteText": {
    "brand": "My Wiki",
    "ru": { "heroTitle": "Привет" },
    "en": { "heroTitle": "Hello" }
  },
  "plugins": {
    "supabase": {
      "supabaseUrl": "${SUPABASE_URL}",
      "supabaseAnonKey": "${SUPABASE_ANON_KEY}"
    }
  }
}
```

Then define `SUPABASE_URL` and `SUPABASE_ANON_KEY` in your `.env` file at the root of the project:

```env
VAULT_PATH=./vault
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The system will automatically interpolate these environment variables at sync time.
