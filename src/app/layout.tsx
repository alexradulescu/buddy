import './globals.css'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'

import { ColorSchemeScript, MantineProvider, MantineTheme, createTheme } from '@mantine/core'

import { AppLayout } from '@/components/app-shell'
import type { Metadata } from 'next'
import { Suspense } from 'react'
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
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <ColorSchemeScript />
      </head>
      <body style={{ 
        fontFamily: `var(--font-geist-sans), sans-serif`,
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}>
        <Suspense fallback={"Loading"}>
          <AppLayout>{children}</AppLayout>
        </Suspense>
      </body>
    </html>
  )
}
