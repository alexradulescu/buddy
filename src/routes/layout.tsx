import { FC, PropsWithChildren } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7'
import { HydrationBoundary } from '@/components/hydration-boundary'
import { Navigation } from '@/components/navigation'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

export const RootLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
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
  )
}

export default RootLayout
