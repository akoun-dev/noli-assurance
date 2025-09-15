import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client using the service role key.
// Must never be imported by client components.
const supabaseAdminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

if (!supabaseAdminUrl || !supabaseServiceRoleKey) {
  // Fail fast in server environments when configuration is missing
  // This will surface clearly during API calls or server startup
  // rather than leading to undefined behavior.
  console.warn('[supabase-admin] Missing Supabase env variables')
}

export const supabaseAdmin = createClient(supabaseAdminUrl!, supabaseServiceRoleKey!, {
  auth: { persistSession: false },
})

export default supabaseAdmin

