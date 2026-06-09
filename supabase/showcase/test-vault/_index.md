---
title: Supabase Test Vault / Тестовая База
description: Dedicated workspace for testing Supabase authentication and table cell state syncing.
---

# Supabase Integration Test / Тест Supabase

Welcome to the test vault! This workspace is dedicated to checking the Supabase auth and state sync integration.

### How to test:

1. Click the **Menu / Меню** button in the top right corner of the header to open the Preferences panel.
2. Under **Supabase Cloud Sync / Supabase Синхронизация**, you will see options to sign in.
3. Once logged in, go to the **[Articles Database](file:///database/index.html)** page.
4. Try checking/unchecking the **Read / Прочитано** checkboxes.
5. Your custom checked/unchecked state will be saved under your account in PostgreSQL.
6. Try logging out or logging in as a different user to verify that the checked states are personal and sync dynamically.
