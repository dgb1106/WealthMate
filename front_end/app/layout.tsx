import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WealthMate',
  description: 'Take control of your financial future',
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
<<<<<<< HEAD
        <link
          rel="preload"
          href="/styles/critical.css"
          as="style"
        />
=======
>>>>>>> 4265faa45cf72565b374b1d9019bc50bc0376657
      </head>
      <body className="font-lufga">{children}</body>
    </html>
  )
}
