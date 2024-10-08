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
          <div className="flex min-h-screen bg-background">
            <Navigation />
            <main className="flex-1 overflow-y-auto sm:pl-14">
              <div className="container mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
            </main>
          </div>
          <Toaster />
        </HydrationBoundary>
      </body>
    </html>
  )
}
