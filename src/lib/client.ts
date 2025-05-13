import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase.ts';

// Use environment variables for better security
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://dzdxbxqxjqaxpiuzbhdd.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZHhieHF4anFheHBpdXpiaGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NzQwODgsImV4cCI6MjA2MjA1MDA4OH0.ZVMTua9aXjIibJKcgTcTQq1VMzUzdjts5FFEqxHXFJQ";

// Create Supabase client with optimal configurations
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
});