import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WealthMate',
  description: 'Take control of your financial future',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1
  },
  icons: {
    icon: '/assets/icon/avaicon.png',
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen w-full m-0 p-0`}>
        {children}
      </body>
    </html>
  )
}
