import './globals.css'

import type { Metadata } from 'next'
import localFont from 'next/font/local'

import { HydrationBoundary } from '@/components/hydration-boundary'
import { Navigation } from '@/components/navigation'
import { Toaster } from '@/components/ui/toaster'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
})

export const metadata: Metadata = {
  title: 'Buddy App',
  description: 'Personal finance management app'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <HydrationBoundary>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-grow mx-auto p-4 max-w-7xl w-full">{children}</main>
          </div>
          <Toaster />
        </HydrationBoundary>
      </body>
    </html>
  )
}
