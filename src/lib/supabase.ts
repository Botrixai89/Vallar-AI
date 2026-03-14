import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. " +
      "Get the anon key from Supabase Dashboard → Project Settings → API."
  );
}

/** Browser Supabase client. Use anon key only; never expose the service role key in the frontend. */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
