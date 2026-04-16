# Forwarding MVP — handoff

## Stack
- Next.js 16
- React 19
- Tailwind
- Supabase Auth + profiles table
- Deploy: Vercel

## Project goal
MVP of a parcel forwarding dashboard:
- register/login
- personal warehouse ID and address
- dashboard
- add packages manually
- manage selected packages
- checkout UI

## Current known files
- app/page.tsx — main UI and auth flow
- lib/supabase.ts — Supabase client config

## What was already done
- Next.js app created
- GitHub repo connected
- Vercel project connected
- Supabase project connected
- profiles table created
- RLS policies were adjusted so profiles can be inserted
- registration form exists
- login form exists
- logout exists
- dashboard UI exists
- package UI exists but is still local state only

## Current main problem
Auth flow is unstable.
Main recurring issue was `Failed to fetch`.
Possible causes already encountered:
- wrong Supabase key used before
- wrong env usage before
- old deployments / stale code before
- broken auth flow in app/page.tsx before

## Important Supabase details
- Project URL:
  https://hrxaxnfvroniqrjmqrn.supabase.co
- The app must use anon public JWT key, not publishable key, not secret key
- Email confirmation may be enabled, so registration should not assume instant login
- profiles table exists and is used to store:
  - id
  - customer_id
  - full_name
  - email
  - warehouse_country
  - warehouse_address

## Desired correct behavior
1. Register:
   - create auth user
   - create or upsert profile
   - show message: check your email and then sign in
   - do NOT force dashboard immediately

2. Login:
   - sign in with email/password
   - load profile
   - open dashboard

3. Session restore:
   - if user already has session, open dashboard
   - if profile not found, do not crash

## Next steps after auth is fixed
- password reset
- email confirmation flow cleanup
- persist packages in Supabase
- persist shipments in Supabase
- admin workflow later

## Request
Please inspect and stabilize:
- app/page.tsx
- lib/supabase.ts

Then propose the cleanest minimal production-safe auth flow.