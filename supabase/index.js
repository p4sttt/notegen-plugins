import fs from 'node:fs';
import path from 'node:path';

export default function supabasePlugin(options = {}) {
  const { supabaseUrl, supabaseAnonKey } = options;

  return {
    beforeSync(context) {
      // Clean up previous auth.astro page if it exists to keep the codebase clean
      const pagePath = path.resolve('src/pages/auth.astro');
      if (fs.existsSync(pagePath)) {
        try {
          fs.unlinkSync(pagePath);
          console.log('[Supabase Plugin] Removed obsolete auth.astro page.');
        } catch (e) {
          console.error('[Supabase Plugin] Failed to remove auth.astro:', e);
        }
      }
    },

    afterSync({ context }) {
      // 1. Inject sidebar styling and modal layout styles
      context.registerGlobalStyle(`
        @media (min-width: 760px) {
          .page-shell {
            display: flex !important;
            flex-direction: row !important;
            align-items: flex-start !important;
            gap: var(--space-6) !important;
            padding: 1.5rem 0 5rem !important;
            max-width: var(--page-max) !important;
            margin: 0 auto !important;
            width: min(100% - 3rem, var(--page-max)) !important;
          }
          
          .site-header {
            position: sticky !important;
            top: 1.5rem !important;
            width: 16rem !important;
            flex-shrink: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            justify-content: flex-start !important;
            gap: var(--space-5) !important;
            height: calc(100vh - 3rem) !important;
            overflow-y: auto !important;
            margin-bottom: 0 !important;
            padding: var(--space-5) !important;
          }
          
          .site-header .top-nav {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: var(--space-2) !important;
          }
          
          .site-header .top-nav a {
            display: block !important;
            padding: 0.5rem 0.75rem !important;
            border-radius: var(--radius-md) !important;
            background: transparent !important;
            transition: background 0.2s ease, color 0.2s ease !important;
          }
          
          .site-header .top-nav a:hover {
            background: var(--accent-soft) !important;
          }
          
          /* Hide parameters dropdown trigger and inline the settings content */
          details.prefs-popover {
            display: block !important;
            border-top: 1px solid var(--line) !important;
            padding-top: var(--space-4) !important;
            margin-top: auto !important; /* Pin settings to bottom of sidebar */
          }

          details.prefs-popover > summary {
            display: none !important;
          }
          
          details.prefs-popover .prefs-panel {
            display: block !important;
            position: static !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
            min-width: 0 !important;
            opacity: 1 !important;
            transform: none !important;
            pointer-events: auto !important;
          }

          .content-frame {
            flex-grow: 1 !important;
            min-width: 0 !important;
          }
        }

        /* Styles for Modal Popup Auth UI */
        .auth-modal {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 9999 !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          pointer-events: none !important;
          opacity: 0 !important;
          transition: opacity 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
        }
        .auth-modal.is-visible {
          pointer-events: auto !important;
          opacity: 1 !important;
        }
        .auth-modal-overlay {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: rgba(0, 0, 0, 0.45) !important;
          backdrop-filter: blur(12px) !important;
        }
        .auth-modal-card {
          position: relative !important;
          width: 100% !important;
          max-width: 25.5rem !important;
          margin: 1rem !important;
          padding: var(--space-6) !important;
          border: 1px solid rgba(var(--accent-rgb), 0.15) !important;
          border-radius: var(--radius-xl) !important;
          background: color-mix(in srgb, var(--surface-strong) 88%, transparent) !important;
          backdrop-filter: blur(24px) !important;
          box-shadow: 
            0 30px 60px -15px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.05) !important;
          z-index: 2 !important;
          transform: scale(0.93) translateY(10px) !important;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }
        .auth-modal.is-visible .auth-modal-card {
          transform: scale(1) translateY(0) !important;
        }
        .auth-modal-close {
          position: absolute !important;
          top: 0.85rem !important;
          right: 1.1rem !important;
          font-size: 1.6rem !important;
          background: transparent !important;
          border: none !important;
          color: var(--text-soft) !important;
          cursor: pointer !important;
          transition: color 0.2s ease, transform 0.2s ease !important;
          line-height: 1 !important;
        }
        .auth-modal-close:hover {
          color: var(--text) !important;
          transform: scale(1.1) !important;
        }
        .auth-modal-title {
          font-size: 1.45rem !important;
          font-weight: 850 !important;
          text-align: center !important;
          margin-bottom: 0.35rem !important;
          color: var(--text) !important;
          margin-top: 0 !important;
          letter-spacing: -0.025em !important;
        }
        .auth-modal-subtitle {
          font-size: 0.85rem !important;
          color: var(--text-muted) !important;
          text-align: center !important;
          margin-bottom: 1.5rem !important;
          margin-top: 0 !important;
          line-height: 1.4 !important;
        }
        .supabase-loading {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-align: center;
          padding: 0.5rem 0;
        }
        .auth-oauth-buttons {
          display: flex !important;
          gap: 0.6rem !important;
        }
        .supabase-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.55rem 0.9rem;
          border-radius: var(--radius-md);
          font-size: 0.86rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid var(--line);
          background: var(--surface);
          color: var(--text);
          transition: all 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .supabase-btn:hover {
          background: var(--bg);
          border-color: rgba(var(--accent-rgb), 0.3);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .supabase-btn:active {
          transform: translateY(0);
          box-shadow: none;
        }
        .auth-oauth-buttons .supabase-btn {
          flex: 1 !important;
          padding: 0.65rem !important;
        }
        .supabase-icon {
          width: 1rem;
          height: 1rem;
        }
        .supabase-btn-github {
          background: #24292e !important;
          color: #ffffff !important;
          border: none !important;
        }
        .supabase-btn-github:hover {
          background: #1c2024 !important;
        }
        .supabase-btn-gitlab {
          background: #e24329 !important;
          color: #ffffff !important;
          border: none !important;
        }
        .supabase-btn-gitlab:hover {
          background: #d13c24 !important;
        }
        .auth-divider-container {
          display: flex !important;
          align-items: center !important;
          text-align: center !important;
          margin: 1.25rem 0 !important;
          color: var(--text-soft) !important;
        }
        .auth-divider-container::before,
        .auth-divider-container::after {
          content: '' !important;
          flex: 1 !important;
          border-bottom: 1px solid var(--line) !important;
        }
        .auth-divider-container:not(:empty)::before {
          margin-right: .6em !important;
        }
        .auth-divider-container:not(:empty)::after {
          margin-left: .6em !important;
        }
        .auth-divider-text {
          font-size: 0.72rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.06em !important;
          font-weight: 700 !important;
          opacity: 0.7 !important;
        }
        .auth-input-label span {
          display: block !important;
          font-size: 0.78rem !important;
          font-weight: 700 !important;
          color: var(--text-muted) !important;
          margin-bottom: 0.35rem !important;
        }
        .supabase-input {
          padding: 0.6rem 0.8rem;
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          background: color-mix(in srgb, var(--bg) 92%, var(--surface-strong));
          color: var(--text);
          font-size: 0.86rem;
          width: 100%;
          transition: all 0.2s ease;
        }
        .supabase-input:focus {
          outline: none !important;
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px var(--accent-soft) !important;
        }
        .auth-form-buttons .supabase-btn {
          flex: 1 !important;
          padding: 0.65rem !important;
        }
        .supabase-btn-primary {
          background: linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 80%, var(--text)) 100%) !important;
          color: var(--bg) !important;
          border: none !important;
          box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.2) !important;
        }
        .supabase-btn-primary:hover {
          background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 90%, #ffffff) 0%, var(--accent) 100%) !important;
          box-shadow: 0 6px 16px rgba(var(--accent-rgb), 0.3) !important;
        }
        .auth-profile-card {
          display: flex !important;
          align-items: center !important;
          gap: 1.1rem !important;
          padding: 0.9rem !important;
          border-radius: var(--radius-lg) !important;
          background: color-mix(in srgb, var(--bg) 60%, var(--surface)) !important;
          border: 1px solid rgba(var(--accent-rgb), 0.08) !important;
          margin-bottom: 1.25rem !important;
          margin-top: 0.5rem !important;
        }
        .supabase-avatar {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--line);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .supabase-user-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .supabase-sync-badge {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--tag-4-text);
          margin-top: 0.2rem;
        }
        .supabase-btn-logout {
          width: 100%;
          margin-top: 0.85rem;
          background: transparent;
          color: var(--text-soft);
          border: 1px dashed var(--line);
        }
        .supabase-btn-logout:hover {
          background: rgba(234, 67, 53, 0.08) !important;
          color: #ea4335 !important;
          border-color: rgba(234, 67, 53, 0.2) !important;
          border-style: solid !important;
        }
      `);

      // 2. Register global scripts for Supabase SDK loading, auth management, and LocalStorage state syncing
      context.registerGlobalScript(`
        (function() {
          const SUPABASE_URL = ${JSON.stringify(supabaseUrl || '')};
          const SUPABASE_ANON_KEY = ${JSON.stringify(supabaseAnonKey || '')};

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

          function keepPrefsOpen() {
            const popover = document.querySelector("details.prefs-popover");
            if (popover) {
              if (window.innerWidth >= 760) {
                if (!popover.hasAttribute("open")) {
                  popover.setAttribute("open", "");
                }
              }
            }
          }
          window.addEventListener("resize", keepPrefsOpen);
          
          // Intercept the toggle event and force it open on desktop
          document.addEventListener("toggle", (e) => {
            if (e.target && e.target.classList && e.target.classList.contains("prefs-popover")) {
              keepPrefsOpen();
            }
          }, true);

          function saveToLocalStorage(slug, rowId, columnKey, value) {
            const key = "notegen_db_overrides:" + slug;
            let overrides = {};
            try {
              overrides = JSON.parse(localStorage.getItem(key) || "{}");
            } catch(e) {}
            if (!overrides[rowId]) {
              overrides[rowId] = {};
            }
            overrides[rowId][columnKey] = value;
            localStorage.setItem(key, JSON.stringify(overrides));
          }

          function applyLocalStorageOverrides(api, slug) {
            const key = "notegen_db_overrides:" + slug;
            let overrides = {};
            try {
              overrides = JSON.parse(localStorage.getItem(key) || "{}");
            } catch(e) {
              return;
            }
            const rows = api.getRows();
            let updated = false;
            for (const [rowId, cols] of Object.entries(overrides)) {
              const row = rows.find(r => String(r._id) === String(rowId));
              if (row) {
                for (const [colKey, val] of Object.entries(cols)) {
                  if (row[colKey] !== val) {
                    row[colKey] = val;
                    updated = true;
                  }
                }
              }
            }
            if (updated) {
              api.update();
            }
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
            const container = document.getElementById("supabase-auth-page-section");
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

          window.supabaseEmailLogin = async (e) => {
            e.preventDefault();
            if (!window.supabaseClient) return;
            const form = e.target;
            const email = form.querySelector(".supabase-email-input").value;
            const password = form.querySelector(".supabase-password-input").value;

            const { error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
            if (error) {
              alert("Sign in failed: " + error.message);
            } else {
              window.closeAuthModal();
            }
          };

          window.supabaseEmailRegister = async (btn) => {
            if (!window.supabaseClient) return;
            const form = btn.closest(".supabase-form");
            const email = form.querySelector(".supabase-email-input").value;
            const password = form.querySelector(".supabase-password-input").value;

            if (!email || !password) {
              alert("Please enter both email and password!");
              return;
            }

            const { error } = await window.supabaseClient.auth.signUp({ email, password });
            if (error) {
              alert("Sign up failed: " + error.message);
            } else {
              alert("Successfully registered and logged in!");
              window.closeAuthModal();
            }
          };

          function createAuthModal() {
            if (document.getElementById("supabase-auth-modal")) return;
            
            const modal = document.createElement("div");
            modal.id = "supabase-auth-modal";
            modal.className = "auth-modal";
            modal.innerHTML = \`
              <div class="auth-modal-overlay"></div>
              <div class="auth-modal-card">
                <button type="button" class="auth-modal-close">&times;</button>
                
                <div id="supabase-auth-page-section">
                  <div class="supabase-loading">Loading account status...</div>
                  
                  <div class="supabase-logged-out" style="display: none;">
                    <h2 class="auth-modal-title">Supabase Cloud Sync</h2>
                    <p class="auth-modal-subtitle">Sign in to sync your changes and track custom states.</p>
                    
                    <!-- OAuth Buttons -->
                    <div class="auth-oauth-buttons">
                      <button type="button" class="supabase-btn supabase-btn-github" onclick="supabaseLogin('github')">
                        <svg class="supabase-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504c.5.092.682-.217.682-.483c0-.237-.008-.868-.013-1.703c-2.782.605-3.369-1.343-3.369-1.343c-.454-1.158-1.11-1.466-1.11-1.466c-.908-.62.069-.608.069-.608c1.003.07 1.53 1.032 1.53 1.032c.892 1.53 2.341 1.088 2.91.832c.092-.647.35-1.088.636-1.338c-2.22-.253-4.555-1.113-4.555-4.951c0-1.093.39-1.988 1.029-2.688c-.103-.253-.446-1.272.098-2.65c0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027c.546 1.379.202 2.398.1 2.651c.64.7 1.028 1.595 1.028 2.688c0 3.848-2.339 4.695-4.566 4.943c.359.309.678.92.678 1.855c0 1.338-.012 2.419-.012 2.747c0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017C22 6.484 17.522 2 12 2Z"/></svg>
                        GitHub
                      </button>
                      <button type="button" class="supabase-btn supabase-btn-gitlab" onclick="supabaseLogin('gitlab')">
                        <svg class="supabase-icon" viewBox="0 0 24 24"><path fill="currentColor" d="m22 12.91l-2.68-8.24a.65.65 0 0 0-.25-.33a.62.62 0 0 0-.41-.09a.66.66 0 0 0-.36.21a.69.69 0 0 0-.14.38L16.42 10H7.58L5.84 4.84a.69.69 0 0 0-.14-.38a.66.66 0 0 0-.36-.21a.62.62 0 0 0-.41.09a.65.65 0 0 0-.25.33L2 12.91a1 1 0 0 0 .36 1.15l9.13 6.64a.83.83 0 0 0 .51.17a.83.83 0 0 0 .51-.17l9.13-6.64a1 1 0 0 0 .36-1.15Z"/></svg>
                        GitLab
                      </button>
                    </div>
                    
                    <div class="auth-divider-container">
                      <span class="auth-divider-text">or</span>
                    </div>
 
                    <!-- Email Password -->
                    <form class="supabase-form auth-email-form" onsubmit="supabaseEmailLogin(event)">
                      <label class="auth-input-label">
                        <span>Email Address</span>
                        <input type="email" class="supabase-input supabase-email-input" placeholder="you@example.com" required style="margin-top: 0.25rem;" />
                      </label>
                      <label class="auth-input-label" style="margin-top: 0.75rem; display:block;">
                        <span>Password</span>
                        <input type="password" class="supabase-input supabase-password-input" placeholder="••••••••" required minlength="6" style="margin-top: 0.25rem;" />
                      </label>
                      <div class="auth-form-buttons" style="margin-top:1.25rem; display:flex; gap:0.5rem;">
                        <button type="submit" class="supabase-btn supabase-btn-primary">Sign In</button>
                        <button type="button" class="supabase-btn" onclick="supabaseEmailRegister(this)" style="background:transparent; border-color:var(--line);">Sign Up</button>
                      </div>
                    </form>
                  </div>
 
                  <div class="supabase-logged-in" style="display: none;">
                    <h2 class="auth-modal-title">Active Session</h2>
                    <div class="auth-profile-card">
                      <img class="supabase-avatar" src="" alt="Avatar" />
                      <div class="supabase-user-info">
                        <span class="supabase-user-name" style="font-weight:600; font-size:1rem; color:var(--text);"></span>
                        <span class="supabase-user-email" style="font-size:0.8rem; color:var(--text-muted);"></span>
                        <span class="supabase-sync-badge">✓ Cloud Sync Active</span>
                      </div>
                    </div>
                    <button type="button" class="supabase-btn supabase-btn-logout" onclick="supabaseLogout()">
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            \`;
            document.body.appendChild(modal);

            // Add close event handlers
            modal.querySelector(".auth-modal-close").addEventListener("click", window.closeAuthModal);
            modal.querySelector(".auth-modal-overlay").addEventListener("click", window.closeAuthModal);
          }

          window.openAuthModal = () => {
            createAuthModal();
            const modal = document.getElementById("supabase-auth-modal");
            if (modal) {
              modal.classList.add("is-visible");
              document.body.style.overflow = "hidden";
              
              if (window.supabaseClient) {
                window.supabaseClient.auth.getSession().then(({ data: { session } }) => {
                  updatePreferencesUI(session);
                });
              }
            }
          };

          window.closeAuthModal = () => {
            const modal = document.getElementById("supabase-auth-modal");
            if (modal) {
              modal.classList.remove("is-visible");
              document.body.style.overflow = "";
            }
          };

          // Intercept click on any Auth links to open the popup modal
          document.addEventListener("click", (e) => {
            const link = e.target.closest("a");
            if (link) {
              const text = link.textContent.trim().toLowerCase();
              const href = link.getAttribute("href") || "";
              if (text === "войти" || text === "sign in" || href === "#auth" || href.includes("/auth")) {
                e.preventDefault();
                window.openAuthModal();
              }
            }
          });

          async function initSupabaseAuth() {
            // Keep details tag open on desktop
            keepPrefsOpen();

            if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
              console.warn("[Supabase Plugin] SUPABASE_URL or SUPABASE_ANON_KEY is not defined.");
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
                // 1. Apply LocalStorage cache first (instant load)
                applyLocalStorageOverrides(view.databaseApi, payload.collectionSlug);
                // 2. Fetch and apply Cloud overrides (final state)
                await applyOverridesForView(view, view.databaseApi, payload.collectionSlug);
              }
            }
          }

          document.addEventListener("database-view-init", async (e) => {
            const { api, databaseSlug } = e.detail;
            const view = e.target;
            // 1. LocalStorage overrides
            applyLocalStorageOverrides(api, databaseSlug);
            // 2. Supabase Cloud overrides
            await applyOverridesForView(view, api, databaseSlug);
          });

          document.addEventListener("database-cell-update", async (e) => {
            const { databaseSlug, rowId, columnKey, value } = e.detail;
            
            // A. Always save to LocalStorage (works for guest users and acts as local cache)
            saveToLocalStorage(databaseSlug, rowId, columnKey, value);
            console.log("[Supabase Plugin] Saved update to localStorage.");

            if (!window.supabaseClient) return;

            const { data: { session } } = await window.supabaseClient.auth.getSession();
            if (!session) {
              return; // Guest user: keep changes local only
            }

            // B. If logged in, sync to Supabase Cloud
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
              console.error("[Supabase Plugin] Error syncing to Supabase:", error);
            } else {
              console.log("[Supabase Plugin] Override synced to Supabase Cloud.");
            }
          });

          // Run immediately and on DOMContentLoaded
          if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", initSupabaseAuth);
          } else {
            initSupabaseAuth();
          }
        })();
      `);

      // 3. Register a header/sidebar link for the dedicated Auth page (which will open the modal popup instead)
      context.registerHeaderLink({
        label: 'Sign In',
        href: '#auth',
        i18n: {
          ru: 'Войти',
          en: 'Sign In',
        },
      });
    },
  };
}
