# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gmate Cloud API Test Client - a Cloudflare Pages application for testing OAuth 2.0 Authorization Code Flow with the Gmate Healthcare API.

## Commands

```bash
npm run dev      # Local development with wrangler pages dev
npm run deploy   # Deploy to Cloudflare Pages
npm run tail     # View deployment logs
```

## Architecture

**Static Frontend** (`index.html`)
- Single-page app using Tailwind CSS (CDN)
- Implements OAuth 2.0 authorization code flow client-side
- Stores tokens in localStorage, passes state via URL params

**Cloudflare Function** (`functions/oauth/callback.js`)
- Handles `/oauth/callback` route
- Exchanges authorization code for access token server-side
- Uses `onRequest` export pattern for Cloudflare Pages Functions
- Environment variables: `API_BASE_URL`, `CLIENT_ID`, `CLIENT_SECRET`

## OAuth Flow

1. Frontend redirects to `{API_BASE_URL}/api/oauth/authorize` with client_id, scope, state
2. After user authorization, redirected to `/oauth/callback` with code
3. Cloudflare Function exchanges code for token at `{API_BASE_URL}/api/oauth/token`
4. Token data base64-encoded and passed back to frontend via query param

## Configuration

Environment variables set via Cloudflare Dashboard or wrangler:
- `API_BASE_URL` - Production: `https://openapi.gmatehealthcare.com`
- `CLIENT_ID` / `CLIENT_SECRET` - OAuth credentials (secret should use `wrangler secret put`)

Local development uses bindings in the `dev` script or `wrangler.toml` vars.
