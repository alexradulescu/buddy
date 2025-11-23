import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import './globals.css'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core'
import { Notifications } from '@mantine/notifications'

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
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <MantineProvider defaultColorScheme="light">
          <Notifications />
          <Suspense fallback={'Loading'}>{children}</Suspense>
        </MantineProvider>
      </body>
    </html>
  )
}
