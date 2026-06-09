#!/bin/bash
set -e

# Go to the script's directory
cd "$(dirname "$0")"

echo "=== Notegen Supabase Plugin Test Environment ==="

# 1. Generate Anon JWT Key dynamically using node.js crypto
echo "Generating cryptographic JWT key..."
export SUPABASE_ANON_KEY=$(node -e "
const crypto = require('crypto');
const header = { alg: 'HS256', typ: 'JWT' };
const payload = { role: 'anon', iss: 'supabase', iat: 1600000000, exp: 2600000000 };
const secret = 'super-secret-jwt-token-with-at-least-32-characters-long';
const base64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
const token = base64Url(header) + '.' + base64Url(payload);
const signature = crypto.createHmac('sha256', secret).update(token).digest('base64url');
console.log(token + '.' + signature);
")

# 2. Start Docker Compose
echo "Starting Docker Compose environment..."
echo "You can access Notegen at: http://localhost:4321"
echo "API gateway running at: http://localhost:8000"
echo "Database & Auth Admin Panel (pgweb) at: http://localhost:8082"
echo "Press Ctrl+C to stop the test environment."

docker compose up --build
