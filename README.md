# Notegen Plugins

This directory contains plugins that extend the capabilities of Notegen. These plugins run during the vault synchronization phase and can also dynamically register scripts, styles, links, and preferences in the Astro client UI.

---

## How Plugins Work

A Notegen plugin is an ES module that exports a default function. This function receives configuration options from the user and returns an object defining lifecycle sync hooks and Astro configurations.

### Sync Lifecycle Hooks

1. **`beforeSync(context)`**
   Called before vault synchronization starts. Useful for setting up build resources or cleaning temp files.
   - `context`: An execution state map providing `.set(key, value)` and `.get(key)` helper methods.

2. **`processNote(note, context)`**
   Called for every individual note during sync.
   - `note`: An object containing the note data (`data` is the frontmatter, `body` is the raw Markdown content, `sourceRelativePath`).
   - Allows mutating note frontmatter and contents dynamically before rendering.

3. **`processDatabase(database, context)`**
   Called for every CSV database file during sync.
   - Allows mutating column configurations or rows before output generation.

4. **`afterSync({ context, topics, topLevelNotes, topLevelDatabases })`**
   Called after all vault notes, databases, and topics are synchronized. On this step, `context` exposes helpers to register UI resources:
   - `context.registerHeaderLink(link)`: Adds a localized navigation link to the sidebar header.
   - `context.registerPreferencesSection(section)`: Adds a preferences settings section to the sidebar popover.
   - `context.registerGlobalStyle(css)`: Injects global CSS stylesheets into all page headers.
   - `context.registerGlobalScript(js)`: Injects an inline client-side JavaScript script on all pages.

5. **`astro`**
   An object used to hook configurations directly into Astro/Vite compilers:
   - `remarkPlugins`: An array of Custom Remark Markdown parser plugins.
   - `rehypePlugins`: An array of Rehype HTML parser plugins.
   - `integrations`: Astro framework integrations.
   - `shikiConfig`: Additional Shiki code syntax highlighter settings.

---

## Available Plugins

- **[supabase](file:///home/d4y2k/progs/notegen/plugins/supabase)**: Connects database tables with Supabase Auth (GitHub/GitLab/Email) and Cloud Sync, enabling dynamic in-place cell editing.
- **[test-plugin](file:///home/d4y2k/progs/notegen/plugins/test-plugin)**: A demo plugin showing how to utilize lifecycle hooks, inject UI settings, scripts, styles, and modify notes metadata.

---

## Activating Plugins

Plugins are registered in `vault/notegen.config.json` (located at the root of your Obsidian vault) under the `"plugins"` property:

```json
{
  "siteText": {
    "brand": "My Wiki"
  },
  "plugins": {
    "test-plugin": {
      "testOption": "any string",
      "addTag": true
    },
    "supabase": {
      "supabaseUrl": "${SUPABASE_URL}",
      "supabaseAnonKey": "${SUPABASE_ANON_KEY}"
    }
  }
}
```

Config variables enclosed in `${...}` will be dynamically interpolated at runtime using environment variables from your shell or local `.env` file.
