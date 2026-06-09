export default function testPlugin(options = {}) {
  return {
    beforeSync(context) {
      console.log("[Test Plugin] beforeSync hook executed. testOption:", options.testOption);
      context.set("started-at", Date.now());
    },
    
    processNote(note, context) {
      if (options.addTag) {
        note.data.tags = [...(note.data.tags || []), "test-plugin-tag"];
      }
      return note;
    },
    
    processDatabase(database, context) {
      return database;
    },
    
    afterSync({ context, topics, topLevelNotes, topLevelDatabases }) {
      const elapsed = Date.now() - context.get("started-at");
      console.log(`[Test Plugin] afterSync hook executed. Sync took ${elapsed}ms`);
      
      // Inject Header Link
      context.registerHeaderLink({
        label: "GitHub",
        href: "https://github.com",
        i18n: {
          ru: "Гитхаб",
          en: "GitHub"
        }
      });

      // Inject custom Preferences dropdown group
      context.registerPreferencesSection({
        title: "Test Plugin Controls",
        i18n: {
          ru: "Настройки тест-плагина",
          en: "Test Plugin Controls"
        },
        html: `
          <div style="padding: 0.5rem 0;">
            <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; color:var(--text-muted);">
              <input type="checkbox" id="test-plugin-checkbox" style="accent-color:var(--accent);" />
              Enable plugin logs
            </label>
            <script>
              document.getElementById('test-plugin-checkbox')?.addEventListener('change', (e) => {
                console.log('[Test Plugin] Log state changed to:', e.target.checked);
              });
            </script>
          </div>
        `
      });

      // Inject Global Styles (e.g. accent line under the brand name)
      context.registerGlobalStyle(`
        .site-header .brand {
          border-bottom: 2px dashed color-mix(in srgb, var(--accent) 50%, transparent);
        }
      `);

      // Inject Global Script
      context.registerGlobalScript(`
        console.log("[Test Plugin] Global client script initialized successfully!");
      `);
    },
    
    astro: {
      remarkPlugins: [],
      rehypePlugins: [],
      integrations: [],
      shikiConfig: {}
    }
  };
}
