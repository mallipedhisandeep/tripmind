import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (code) {
    return NextResponse.redirect(`${siteUrl}/auth/confirm?code=${code}`)
  }

  return NextResponse.redirect(`${siteUrl}/login?error=no_code`)
}
