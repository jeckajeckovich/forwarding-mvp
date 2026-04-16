import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate early so a misconfigured .env.local throws a readable error
// at module load time — not a silent "Failed to fetch" at call time.
// A non-empty placeholder string like "ТВОЙ_SUPABASE_URL" passes a simple
// falsy check but is caught here by the https:// shape requirement.
if (!supabaseUrl || !supabaseUrl.startsWith("https://")) {
  throw new Error(
    `NEXT_PUBLIC_SUPABASE_URL is missing or invalid.\n` +
    `Got: "${supabaseUrl}"\n` +
    `Expected: https://<ref>.supabase.co\n` +
    `Fix: set NEXT_PUBLIC_SUPABASE_URL in .env.local to your real project URL (Supabase dashboard → Settings → API).`
  );
}

if (!supabaseAnonKey || !supabaseAnonKey.startsWith("eyJ")) {
  throw new Error(
    `NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or invalid.\n` +
    `Got: "${supabaseAnonKey?.slice(0, 20)}..."\n` +
    `Expected: a JWT that starts with eyJ\n` +
    `Fix: set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to the anon/public key (Supabase dashboard → Settings → API).`
  );
}

console.log("[supabase] client initializing →", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});