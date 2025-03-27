import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WealthMate',
  description: 'Take control of your financial future',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css' />
        <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/lufga" />
        <link
          rel="preload"
          href="/styles/critical.css"
          as="style"
        />
      </head>
      <body className="font-lufga">{children}</body>
    </html>
  )
}
