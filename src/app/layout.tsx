import './globals.css'

import { HydrationBoundary } from '@/components/hydration-boundary'
import type { Metadata } from 'next'
import { Navigation } from '@/components/navigation'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Suspense } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import localFont from 'next/font/local'

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Suspense fallback={"Loading"}>
        <NuqsAdapter>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <HydrationBoundary>
              <div className="flex min-h-screen bg-background">
                <Navigation />
                <main className="flex-1 overflow-y-auto p-4 sm:pl-20 bg-stone-50 dark:bg-stone-950 m-1 rounded-sm border-gray-100 border-solid">
                  {children}
                </main>
              </div>
              <Toaster />
            </HydrationBoundary>
          </ThemeProvider>
        </NuqsAdapter>
        </Suspense>
      </body>
    </html>
  )
}
