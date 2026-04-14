import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hrxaxnfvroniqrjmqrn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyeGF4bmZydm9ybmlxcmptcXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNzQ2NjMsImV4cCI6MjA5MTY1MDY2M30.tOcG7XWZTSI29lNlL8eehG7A231AvA_0C4inh39tmt8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log("anon key length", supabaseAnonKey.length);
console.log("anon key preview", supabaseAnonKey.slice(0, 20), supabaseAnonKey.slice(-10));