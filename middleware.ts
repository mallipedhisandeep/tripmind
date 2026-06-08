import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Let everything through - auth is handled client-side
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
