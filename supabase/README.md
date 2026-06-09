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

---

## Local Showcase & Integration Testing

To test and debug the plugin locally without setting up a remote Supabase project, a self-contained local testing suite is provided inside the [showcase](file:///home/d4y2k/progs/notegen/plugins/supabase/showcase) directory.

### Directory Structure of Showcase

- [showcase/run-test.sh](file:///home/d4y2k/progs/notegen/plugins/supabase/showcase/run-test.sh): Dynamically generates a cryptographic JWT key, configures the local auth gateway, and spins up the Docker Compose environment.
- [showcase/docker-compose.yml](file:///home/d4y2k/progs/notegen/plugins/supabase/showcase/docker-compose.yml): Boots services for PostgreSQL (`db`), GoTrue auth (`auth`), PostgREST (`rest`), reverse proxy (`gateway`), database explorer (`pgweb`), and the Astro app itself (`notegen`).
- [showcase/gateway.conf](file:///home/d4y2k/progs/notegen/plugins/supabase/showcase/gateway.conf): Nginx configuration acting as the API gateway.
- [showcase/init.sql](file:///home/d4y2k/progs/notegen/plugins/supabase/showcase/init.sql): SQL script loaded by PostgreSQL upon boot to set up test schemas, roles, and Row Level Security (RLS) policies.
- [showcase/test-vault](file:///home/d4y2k/progs/notegen/plugins/supabase/showcase/test-vault): Mock Obsidian vault containing test databases (`articles.csv`) and configurations.

### Run Instructions:

1. Ensure Docker and Docker Compose are installed on your system.
2. If you want to test actual OAuth logins with GitHub or GitLab, set your OAuth keys in your environment first:
   ```bash
   export GITHUB_CLIENT_ID=your_id
   export GITHUB_CLIENT_SECRET=your_secret
   ```
   _(If not set, GoTrue will start with mock credentials)._
3. Start the test environment:
   ```bash
   ./plugins/supabase/showcase/run-test.sh
   ```

### What this does:

- Boots your Notegen Astro application in interactive development mode on `http://localhost:4321`.
- Boots local auth gateway reverse proxy on `http://localhost:8000`.

### Viewing Users & Database Tables (pgweb):

You can access the database explorer (pgweb) at `http://localhost:8082`.

- **To view database overrides**: Under the default `public` schema in the sidebar, open the `database_overrides` table.
- **To view registered users**: In the top-left dropdown, change the **Schema** from `public` to `auth`. Then open the `users` table to see registered accounts.
