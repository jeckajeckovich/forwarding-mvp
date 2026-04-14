import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hrxaxnfvroniqrjmqrn.supabase.co";
const supabaseAnonKey = "ТВОЙ_ANON_JWT_КЛЮЧ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);