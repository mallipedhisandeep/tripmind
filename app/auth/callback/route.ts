import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tripmind-six.vercel.app'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('id', user.id)
          .single()

        if (!profile?.onboarding_complete) {
          return NextResponse.redirect(`${siteUrl}/onboarding`)
        }
      }
      return NextResponse.redirect(`${siteUrl}${next}`)
    }
  }

  return NextResponse.redirect(`${siteUrl}/login?error=auth_failed`)
}
