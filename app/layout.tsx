import type { Metadata, Viewport } from 'next'
import { Urbanist } from 'next/font/google'

import './globals.css'

const urbanist = Urbanist({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-geist-sans',
})

export const metadata: Metadata = {
  title: 'Allons - Descubre eventos cerca de ti',
  description: 'Encuentra y reserva los mejores eventos cerca de ti',
}

export const viewport: Viewport = {
  themeColor: '#131617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${urbanist.variable} font-sans antialiased`}>
        <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
