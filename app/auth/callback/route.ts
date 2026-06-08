import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const siteUrl = 'https://tripmind-six.vercel.app'

  if (code) {
    // Pass code to client-side handler
    return NextResponse.redirect(`${siteUrl}/auth/confirm?code=${code}`)
  }

  return NextResponse.redirect(`${siteUrl}/login?error=no_code`)
}
