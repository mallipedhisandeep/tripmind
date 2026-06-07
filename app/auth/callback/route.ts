import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  const siteUrl = 'https://tripmind-six.vercel.app'

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/login?error=no_code`)
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Exchange error:', error.message)
      return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent(error.message)}`)
    }

    if (!data.user) {
      return NextResponse.redirect(`${siteUrl}/login?error=no_user`)
    }

    // Check onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('id', data.user.id)
      .single()

    if (!profile?.onboarding_complete) {
      return NextResponse.redirect(`${siteUrl}/onboarding`)
    }

    return NextResponse.redirect(`${siteUrl}/dashboard`)

  } catch (err: any) {
    console.error('Callback error:', err)
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent(err.message || 'unknown')}`)
  }
}
