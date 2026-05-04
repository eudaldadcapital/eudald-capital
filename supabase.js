import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lbhugaffvqobuixzaqrd.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_P7T5nbjeDcGe1jvJsa2HIg_wP2Dzy2Z'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
