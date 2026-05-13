import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://tdooyzvdlubuyezwefgm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkb295enZkbHVidXllendlZmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTE1NDQsImV4cCI6MjA5Mzk2NzU0NH0.WxXDKbExWXd8KyXc_QHHI5A0ZhMZ_aEW34gm90829Zg'
export const supabase = createClient(supabaseUrl, supabaseKey)
