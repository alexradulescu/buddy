import './globals.css'

import type { Metadata } from 'next'
import localFont from 'next/font/local'
import Link from 'next/link'

import { HydrationBoundary } from '@/components/hydration-boundary'
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

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/expenses', label: 'Expenses' },
  { href: '/overview', label: 'Overview' },
  { href: '/settings', label: 'Settings' }
]

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
            <nav className="bg-gray-800 text-white p-4">
              <ul className="flex space-x-4">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <main className="flex-grow mx-auto p-4 px-6 w-full max-w-screen-2xl">{children}</main>
          </div>
          <Toaster />
        </HydrationBoundary>
      </body>
    </html>
  )
}
