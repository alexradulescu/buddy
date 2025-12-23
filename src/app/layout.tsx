import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import './globals.css'
import { Suspense } from 'react'
import type { Metadata, Viewport } from 'next'
import { ColorSchemeScript, MantineProvider, mantineHtmlProps, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'

// Modern Font Stacks - https://modernfontstacks.com
const theme = createTheme({
  fontFamily: 'system-ui, sans-serif',
  fontFamilyMonospace: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace",
  headings: {
    fontFamily: "Seravek, 'Gill Sans Nova', Ubuntu, Calibri, 'DejaVu Sans', source-sans-pro, sans-serif"
  }
})

export const metadata: Metadata = {
  title: 'Buddy App',
  description: 'Personal finance management app'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
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
      <body className="antialiased">
        <MantineProvider theme={theme} defaultColorScheme="light">
          <Notifications />
          <Suspense fallback={'Loading'}>{children}</Suspense>
        </MantineProvider>
      </body>
    </html>
  )
}
