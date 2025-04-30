"use client";

import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

// These environment variables are required for Supabase client
// They will be set in the .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Creates a Supabase client for client-side usage
 */
export const createClientComponentClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

/**
 * For compatibility with code that still uses the older API pattern
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
