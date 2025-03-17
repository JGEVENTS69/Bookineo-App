import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vjwctbtqyipqsnexjukq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqd2N0YnRxeWlwcXNuZXhqdWtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjk2NTQ4NywiZXhwIjoyMDUyNTQxNDg3fQ.R1LNsw4wlsBiD0Y96VZChOMB6zdtNxikwjY79bEjq_s'; // Remplacez par votre clé de service
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export default supabaseAdmin;