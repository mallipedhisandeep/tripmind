import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { I18nProvider } from '@/lib/i18n'
import './globals.css'

export const metadata: Metadata = {
  title: 'TripMind — AI Travel Planner for India',
  description: 'Plan complete India trips in seconds. Real train timings, temple tips, local food and live booking alerts.',
  manifest: '/manifest.json',
  themeColor: '#e8a020',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'TripMind' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>
        <I18nProvider>
          {children}
          <Toaster position="top-center" toastOptions={{
            style: {
              background: '#111116', color: '#f0f0f8',
              border: '1px solid #252530',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '13px', borderRadius: '12px',
            },
          }} />
        </I18nProvider>
      </body>
    </html>
  )
}
