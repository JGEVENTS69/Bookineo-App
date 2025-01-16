import { createClient } from '@supabase/supabase-js';

// URL et clé API de Supabase
const SUPABASE_URL = 'https://vjwctbtqyipqsnexjukq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqd2N0YnRxeWlwcXNuZXhqdWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NjU0ODcsImV4cCI6MjA1MjU0MTQ4N30.Xjv2f5ew4VvGTpJiV_or7N2DhKMtvN5iW8wrjs08FZo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);