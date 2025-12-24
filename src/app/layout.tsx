import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import './globals.css'
import { Suspense } from 'react'
import type { Metadata, Viewport } from 'next'
import { ColorSchemeScript, MantineProvider, mantineHtmlProps, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'

// Modern Font Stacks - https://modernfontstacks.com
// Dense, data-focused design with no shadows
const theme = createTheme({
  // Typography
  fontFamily: 'system-ui, sans-serif',
  fontFamilyMonospace: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace",
  headings: {
    fontFamily: "Seravek, 'Gill Sans Nova', Ubuntu, Calibri, 'DejaVu Sans', source-sans-pro, sans-serif",
    fontWeight: '600',
  },

  // Remove all shadows for flat design
  shadows: {
    xs: 'none',
    sm: 'none',
    md: 'none',
    lg: 'none',
    xl: 'none',
  },

  // Tight spacing for data density
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },

  // Consistent radius
  radius: {
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
  },
  defaultRadius: 'sm',

  // Component defaults for consistency
  components: {
    Card: {
      defaultProps: {
        padding: 'sm',
        radius: 'sm',
        withBorder: true,
      },
      styles: {
        root: {
          borderColor: 'var(--mantine-color-gray-3)',
        },
      },
    },
    Table: {
      defaultProps: {
        highlightOnHover: true,
        verticalSpacing: '4px',
        horizontalSpacing: 'xs',
        fz: 'sm',
      },
      styles: {
        th: {
          fontWeight: 600,
          fontSize: 'var(--mantine-font-size-xs)',
          color: 'var(--mantine-color-gray-7)',
          paddingTop: '6px',
          paddingBottom: '6px',
        },
        td: {
          paddingTop: '4px',
          paddingBottom: '4px',
        },
      },
    },
    Button: {
      defaultProps: {
        radius: 'sm',
        size: 'sm',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'sm',
        size: 'sm',
      },
    },
    Select: {
      defaultProps: {
        radius: 'sm',
        size: 'sm',
      },
    },
    NumberInput: {
      defaultProps: {
        radius: 'sm',
        size: 'sm',
      },
    },
    Textarea: {
      defaultProps: {
        radius: 'sm',
        size: 'sm',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
        size: 'sm',
        variant: 'light',
      },
    },
    Accordion: {
      styles: {
        control: {
          paddingTop: '8px',
          paddingBottom: '8px',
          fontWeight: 600,
        },
        content: {
          padding: '8px',
        },
        item: {
          borderBottom: 'none',
        },
      },
    },
    Modal: {
      defaultProps: {
        radius: 'sm',
        padding: 'md',
      },
    },
    Stack: {
      defaultProps: {
        gap: 'sm',
      },
    },
  },
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
