// Supabase publishable keys are intentionally safe for browser code. Environment
// variables remain the preferred override; defaults keep preview deploys usable.
export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'https://fkcgponpyqznkcdaqxcz.supabase.co'

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  'sb_publishable_ri0y5V69c3DhbqQRroS19w_fl2W6Y4_'
