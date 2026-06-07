import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'TripMind — AI Travel Planner for India',
  description: 'Plan smarter trips across India. AI-powered itineraries with real train timings, temple darshan tips, local food, and live availability alerts.',
  keywords: 'India travel planner, Tirupati trip plan, IRCTC train booking, temple travel India, AI travel',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-brand-dark text-brand-text font-body antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#e2e8f0',
              border: '1px solid #1e293b',
              fontFamily: 'Outfit, sans-serif',
            },
          }}
        />
      </body>
    </html>
  )
}
