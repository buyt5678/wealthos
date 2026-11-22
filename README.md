# WEALTHOS v2.0

A static web app prototype with Supabase email authentication and per-user cloud storage for savings goals and user-entered transaction records.

## Configure Supabase

1. Copy `config.example.js` and name the copy `config.js`.
2. Open `config.js`.
3. Set `supabaseUrl` to your Supabase Project URL.
4. Set `supabasePublishableKey` to your Supabase Publishable key (`sb_publishable_...`).
5. Never use a Supabase Secret key or `service_role` key in browser code.

`config.js` is intentionally excluded from Git in `.gitignore`. For static Netlify hosting, deploy the configured file as part of the site bundle; if using Git-based deploys, either add it locally before deploying with Netlify CLI or use a build-time environment-variable approach. Do not commit private keys. The publishable key is designed for client use and is safe to expose when RLS is correctly configured.

## Supabase database

Run the SQL from `supabase-setup.sql` in the Supabase SQL Editor. This script adds a profile creation trigger, enables RLS, and creates per-user policies for the tables used by this app. It is designed to be safe to run after the initial WEALTHOS v2 database script.

## Local test

Serve this folder from a local web server (not by double-clicking `index.html`) or deploy it to Netlify. Then create a test account and confirm the email if confirmation is enabled.

This is a tracker prototype. User-entered records are not verified bank transactions and the app does not transfer funds, connect to brokers, or execute investments.
