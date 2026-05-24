/** Browser-safe Supabase client (anon key). Server writes use `createServerSupabase`. */
export {
  createBrowserSupabase,
  createBrowserSupabase as createClient,
} from "@/lib/supabase/client";
