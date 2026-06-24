import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role client for trusted, server-only contexts (cron jobs, webhooks).
 * Bypasses Row Level Security — never expose this client or its key to the browser.
 * Requires SUPABASE_SERVICE_ROLE_KEY to be set; throws clearly if missing so
 * misconfiguration fails loudly instead of silently returning empty results.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'createAdminClient: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set'
    )
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
