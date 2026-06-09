export default function supabasePlugin(options = {}) {
  const { supabaseUrl, supabaseAnonKey } = options;

  return {
    afterSync({ context }) {
      // 1. Register global styles for Supabase Auth UI
      context.registerGlobalStyle(`
        .supabase-auth-container {
          padding: 0.5rem 0;
          font-family: var(--font-sans);
        }
        .supabase-loading {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-align: center;
          padding: 0.5rem 0;
        }
        .supabase-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        .supabase-buttons {
          display: flex;
          gap: 0.5rem;
        }
        .supabase-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid var(--line);
          background: var(--surface);
          color: var(--text);
          transition: all 0.2s ease;
        }
        .supabase-btn:hover {
          background: var(--bg);
          border-color: var(--text-soft);
        }
        .supabase-btn:active {
          transform: translateY(1px);
        }
        .supabase-icon {
          width: 1rem;
          height: 1rem;
        }
        .supabase-btn-github {
          background: #24292e;
          color: #ffffff;
          border: none;
        }
        .supabase-btn-github:hover {
          background: #2f363d;
        }
        .supabase-btn-gitlab {
          background: #e24329;
          color: #ffffff;
          border: none;
        }
        .supabase-btn-gitlab:hover {
          background: #e85942;
        }
        .supabase-btn-logout {
          width: 100%;
          margin-top: 0.75rem;
          background: transparent;
          color: var(--text-muted);
          border: 1px dashed var(--line);
        }
        .supabase-btn-logout:hover {
          background: rgba(234, 67, 53, 0.08);
          color: #ea4335;
          border-color: rgba(234, 67, 53, 0.2);
        }
        .supabase-user-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: var(--radius-md);
          background: var(--surface-strong);
          border: 1px solid var(--line);
        }
        .supabase-avatar {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--line);
        }
        .supabase-user-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .supabase-user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .supabase-user-email {
          font-size: 0.75rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .supabase-sync-badge {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--tag-4-text);
          margin-top: 0.15rem;
        }
      `);

      // 2. Register global script
      context.registerGlobalScript(`
        (function() {
          const SUPABASE_URL = ${JSON.stringify(supabaseUrl || "")};
          const SUPABASE_ANON_KEY = ${JSON.stringify(supabaseAnonKey || "")};

          function ensureSupabaseLoaded() {
            if (window.supabase) {
              return Promise.resolve(window.supabase);
            }
            return new Promise((resolve) => {
              const existing = document.querySelector('script[src*="supabase-js"]');
              if (existing) {
                if (window.supabase) resolve(window.supabase);
                else {
                  existing.addEventListener('load', () => resolve(window.supabase));
                }
                return;
              }
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
              script.async = true;
              script.onload = () => resolve(window.supabase);
              document.head.appendChild(script);
            });
          }

          async function applyOverridesForView(view, api, slug) {
            if (!window.supabaseClient) return;
            const { data: { session } } = await window.supabaseClient.auth.getSession();
            if (!session) return;

            const { data, error } = await window.supabaseClient
              .from('database_overrides')
              .select('row_id, column_key, value')
              .eq('user_id', session.user.id)
              .eq('database_slug', slug);

            if (error) {
              console.error("[Supabase Plugin] Error fetching database overrides:", error);
              return;
            }

            if (data && data.length > 0) {
              const rows = api.getRows();
              let updated = false;
              data.forEach(override => {
                const row = rows.find(r => String(r._id) === String(override.row_id));
                if (row) {
                  if (row[override.column_key] !== override.value) {
                    row[override.column_key] = override.value;
                    updated = true;
                  }
                }
              });
              if (updated) {
                api.update();
              }
            }
          }

          function updatePreferencesUI(session) {
            const container = document.getElementById("supabase-auth-section");
            if (!container) return;

            const loadingEl = container.querySelector(".supabase-loading");
            const loggedOutEl = container.querySelector(".supabase-logged-out");
            const loggedInEl = container.querySelector(".supabase-logged-in");

            if (loadingEl) loadingEl.style.display = "none";

            if (session) {
              if (loggedOutEl) loggedOutEl.style.display = "none";
              if (loggedInEl) loggedInEl.style.display = "block";

              const user = session.user;
              const profile = user.user_metadata || {};
              
              const avatarEl = container.querySelector(".supabase-avatar");
              const nameEl = container.querySelector(".supabase-user-name");
              const emailEl = container.querySelector(".supabase-user-email");

              if (avatarEl) {
                avatarEl.src = profile.avatar_url || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
              }
              if (nameEl) {
                nameEl.textContent = profile.full_name || profile.name || user.email.split("@")[0];
              }
              if (emailEl) {
                emailEl.textContent = user.email;
              }
            } else {
              if (loggedInEl) loggedInEl.style.display = "none";
              if (loggedOutEl) loggedOutEl.style.display = "block";
            }
          }

          window.supabaseLogin = async (provider) => {
            if (!window.supabaseClient) return;
            const currentUrl = new URL(window.location.href);
            const { error } = await window.supabaseClient.auth.signInWithOAuth({
              provider: provider,
              options: {
                redirectTo: currentUrl.origin + currentUrl.pathname + currentUrl.search
              }
            });
            if (error) {
              console.error("[Supabase Plugin] Sign in error:", error);
              alert("Authentication failed: " + error.message);
            }
          };

          window.supabaseLogout = async () => {
            if (!window.supabaseClient) return;
            const { error } = await window.supabaseClient.auth.signOut();
            if (error) {
              console.error("[Supabase Plugin] Sign out error:", error);
            }
          };

          async function initSupabaseAuth() {
            if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
              console.warn("[Supabase Plugin] SUPABASE_URL or SUPABASE_ANON_KEY is not defined. Suppabase plugin will be disabled.");
              const container = document.getElementById("supabase-auth-section");
              if (container) {
                container.innerHTML = '<div class="supabase-loading" style="color:var(--tag-2-text);">Configuration missing! Check environment variables.</div>';
              }
              return;
            }

            await ensureSupabaseLoaded();
            
            if (!window.supabaseClient) {
              window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            }

            const client = window.supabaseClient;

            client.auth.onAuthStateChange(async (event, session) => {
              console.log("[Supabase Plugin] Auth state changed:", event);
              updatePreferencesUI(session);

              if (session) {
                const views = document.querySelectorAll("[data-database-view]");
                for (const view of views) {
                  if (view.databaseApi && view.dataset.payloadId) {
                    const payload = JSON.parse(document.getElementById(view.dataset.payloadId).textContent);
                    await applyOverridesForView(view, view.databaseApi, payload.collectionSlug);
                  }
                }
              } else {
                if (event === 'SIGNED_OUT') {
                  window.location.reload();
                }
              }
            });

            // Initial UI check
            const { data: { session } } = await client.auth.getSession();
            updatePreferencesUI(session);

            // Apply overrides to existing initialized views
            const views = document.querySelectorAll("[data-database-view]");
            for (const view of views) {
              if (view.databaseApi && view.dataset.payloadId) {
                const payload = JSON.parse(document.getElementById(view.dataset.payloadId).textContent);
                await applyOverridesForView(view, view.databaseApi, payload.collectionSlug);
              }
            }
          }

          document.addEventListener("database-view-init", async (e) => {
            const { api, databaseSlug } = e.detail;
            const view = e.target;
            await applyOverridesForView(view, api, databaseSlug);
          });

          document.addEventListener("database-cell-update", async (e) => {
            const { databaseSlug, rowId, columnKey, value } = e.detail;
            if (!window.supabaseClient) return;

            const { data: { session } } = await window.supabaseClient.auth.getSession();
            if (!session) {
              console.warn("[Supabase Plugin] User is not signed in. Cell updates are only saved in-memory for the current session.");
              return;
            }

            const { error } = await window.supabaseClient
              .from('database_overrides')
              .upsert({
                user_id: session.user.id,
                database_slug: databaseSlug,
                row_id: String(rowId),
                column_key: columnKey,
                value: String(value),
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id,database_slug,row_id,column_key'
              });

            if (error) {
              console.error("[Supabase Plugin] Error upserting cell update:", error);
            } else {
              console.log("[Supabase Plugin] Override synced successfully.");
            }
          });

          if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", initSupabaseAuth);
          } else {
            initSupabaseAuth();
          }
        })();
      `);

      // 3. Register Preferences dropdown section
      context.registerPreferencesSection({
        title: "Supabase Cloud Sync",
        i18n: {
          ru: "Supabase Синхронизация",
          en: "Supabase Cloud Sync"
        },
        html: `
          <div id="supabase-auth-section" class="supabase-auth-container">
            <div class="supabase-loading">Loading account status...</div>
            <div class="supabase-logged-out" style="display: none;">
              <p class="supabase-desc">Sign in to sync your changes and track custom states.</p>
              <div class="supabase-buttons">
                <button type="button" class="supabase-btn supabase-btn-github" onclick="supabaseLogin('github')">
                  <svg class="supabase-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504c.5.092.682-.217.682-.483c0-.237-.008-.868-.013-1.703c-2.782.605-3.369-1.343-3.369-1.343c-.454-1.158-1.11-1.466-1.11-1.466c-.908-.62.069-.608.069-.608c1.003.07 1.53 1.032 1.53 1.032c.892 1.53 2.341 1.088 2.91.832c.092-.647.35-1.088.636-1.338c-2.22-.253-4.555-1.113-4.555-4.951c0-1.093.39-1.988 1.029-2.688c-.103-.253-.446-1.272.098-2.65c0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027c.546 1.379.202 2.398.1 2.651c.64.7 1.028 1.595 1.028 2.688c0 3.848-2.339 4.695-4.566 4.943c.359.309.678.92.678 1.855c0 1.338-.012 2.419-.012 2.747c0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017C22 6.484 17.522 2 12 2Z"/></svg>
                  GitHub
                </button>
                <button type="button" class="supabase-btn supabase-btn-gitlab" onclick="supabaseLogin('gitlab')">
                  <svg class="supabase-icon" viewBox="0 0 24 24"><path fill="currentColor" d="m22 12.91l-2.68-8.24a.65.65 0 0 0-.25-.33a.62.62 0 0 0-.41-.09a.66.66 0 0 0-.36.21a.69.69 0 0 0-.14.38L16.42 10H7.58L5.84 4.84a.69.69 0 0 0-.14-.38a.66.66 0 0 0-.36-.21a.62.62 0 0 0-.41.09a.65.65 0 0 0-.25.33L2 12.91a1 1 0 0 0 .36 1.15l9.13 6.64a.83.83 0 0 0 .51.17a.83.83 0 0 0 .51-.17l9.13-6.64a1 1 0 0 0 .36-1.15Z"/></svg>
                  GitLab
                </button>
              </div>
            </div>
            <div class="supabase-logged-in" style="display: none;">
              <div class="supabase-user-card">
                <img class="supabase-avatar" src="" alt="Avatar" />
                <div class="supabase-user-info">
                  <span class="supabase-user-name"></span>
                  <span class="supabase-user-email"></span>
                  <span class="supabase-sync-badge">✓ Cloud Sync Active</span>
                </div>
              </div>
              <button type="button" class="supabase-btn supabase-btn-logout" onclick="supabaseLogout()">
                Sign Out
              </button>
            </div>
          </div>
        `
      });
    }
  };
}
