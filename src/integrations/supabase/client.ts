import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'
import env from '@/config/env'

export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
)
