# Test Plugin

This plugin is a demonstration template created to illustrate how the Notegen Plugin API works. It shows how to hook into the vault sync process and dynamically inject styles, scripts, links, and preferences controls into the client-side UI.

---

## Features

The plugin demonstrates the following capabilities of the Notegen Plugin API:

1. **Logging and State Passing**:
   Logs `beforeSync` and `afterSync` lifecycle hooks, calculating the total duration of the sync process.
2. **Metadata Mutation**:
   If `addTag` is enabled in config options, the plugin automatically appends `test-plugin-tag` to all imported notes.
3. **UI Link Injection**:
   Adds a localized navigation link targeting GitHub into the header site menu.
4. **Custom Preferences Group**:
   Appends a new preferences group titled "Test Plugin Controls" to the sidebar settings popover, including an interactive checkbox.
5. **CSS Style Injection**:
   Applies a dashed accent border under the site brand header logo.
6. **Script Injection**:
   Loads and executes a global client-side script on all pages of the website.

---

## Configuration

You can enable and customize the plugin inside `vault/notegen.config.json`:

```json
{
  "plugins": {
    "test-plugin": {
      "testOption": "any string content",
      "addTag": true
    }
  }
}
```

### Available Options:

- `testOption` (string): Any text value. Outputs in the synchronization console logs.
- `addTag` (boolean): If set to `true`, appends the `test-plugin-tag` tag to all processed notes.
