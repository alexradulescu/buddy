import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import './globals.css'
import { Suspense } from 'react'
import type { Metadata, Viewport } from 'next'
import { ColorSchemeScript, MantineProvider, mantineHtmlProps, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'

// Clean Finance Dashboard Theme
const theme = createTheme({
  // Typography - Clean, readable Inter
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', ui-monospace, monospace",
  headings: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: '600',
  },

  // Green Finance Color Palette
  colors: {
    forest: [
      '#E9F5EF', // 0
      '#D3EBE0', // 1
      '#A8D7C1', // 2
      '#74C69D', // 3
      '#52B788', // 4 - accent
      '#40916C', // 5
      '#2D6A4F', // 6 - primary light
      '#1B4332', // 7 - primary
      '#143728', // 8
      '#0D2818', // 9
    ],
  },
  primaryColor: 'forest',
  primaryShade: 7,

  // Subtle shadows
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.06)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.08)',
  },

  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },

  // Rounded corners
  radius: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  defaultRadius: 'md',

  // Component defaults
  components: {
    Card: {
      defaultProps: {
        padding: 'sm',
        radius: 'md',
        withBorder: true,
      },
      styles: {
        root: {
          borderColor: '#E5E9EB',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    Table: {
      defaultProps: {
        highlightOnHover: true,
        verticalSpacing: '6px',
        horizontalSpacing: 'xs',
        fz: 'sm',
      },
      styles: {
        th: {
          fontWeight: 600,
          fontSize: '11px',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.03em',
          color: '#6F767E',
          paddingTop: '8px',
          paddingBottom: '8px',
          backgroundColor: '#F8FAFB',
          borderBottom: '1px solid #E5E9EB',
        },
        td: {
          paddingTop: '6px',
          paddingBottom: '6px',
          borderBottom: '1px solid #F0F3F4',
        },
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
        size: 'sm',
      },
      styles: {
        root: {
          fontWeight: 500,
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
        size: 'sm',
      },
      styles: {
        input: {
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E9EB',
          '&:focus': {
            borderColor: '#52B788',
          },
        },
        label: {
          fontWeight: 500,
          fontSize: '12px',
          color: '#6F767E',
          marginBottom: '4px',
        },
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
        size: 'sm',
      },
      styles: {
        input: {
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E9EB',
        },
        label: {
          fontWeight: 500,
          fontSize: '12px',
          color: '#6F767E',
          marginBottom: '4px',
        },
      },
    },
    NumberInput: {
      defaultProps: {
        radius: 'md',
        size: 'sm',
      },
      styles: {
        input: {
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E9EB',
        },
        label: {
          fontWeight: 500,
          fontSize: '12px',
          color: '#6F767E',
          marginBottom: '4px',
        },
      },
    },
    Textarea: {
      defaultProps: {
        radius: 'md',
        size: 'sm',
      },
      styles: {
        input: {
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E9EB',
        },
        label: {
          fontWeight: 500,
          fontSize: '12px',
          color: '#6F767E',
          marginBottom: '4px',
        },
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
        size: 'sm',
        variant: 'light',
      },
      styles: {
        root: {
          textTransform: 'uppercase' as const,
          letterSpacing: '0.02em',
          fontWeight: 600,
          fontSize: '10px',
        },
      },
    },
    Accordion: {
      styles: {
        control: {
          paddingTop: '10px',
          paddingBottom: '10px',
          fontWeight: 500,
          backgroundColor: '#F8FAFB',
          '&:hover': {
            backgroundColor: 'rgba(82, 183, 136, 0.1)',
          },
        },
        content: {
          padding: '12px',
          backgroundColor: '#FFFFFF',
        },
        item: {
          borderBottom: '1px solid #E5E9EB',
        },
      },
    },
    Modal: {
      defaultProps: {
        radius: 'md',
        padding: 'md',
      },
      styles: {
        content: {
          backgroundColor: '#FFFFFF',
        },
        header: {
          backgroundColor: '#FFFFFF',
        },
        title: {
          fontWeight: 600,
          fontSize: '18px',
        },
      },
    },
    Stack: {
      defaultProps: {
        gap: 'sm',
      },
    },
    Title: {
      styles: {
        root: {
          fontWeight: 600,
          color: '#1A1D1F',
        },
      },
    },
    Text: {
      styles: {
        root: {
          color: '#1A1D1F',
        },
      },
    },
    ActionIcon: {
      defaultProps: {
        variant: 'subtle',
      },
      styles: {
        root: {
          color: '#6F767E',
          '&:hover': {
            backgroundColor: 'rgba(82, 183, 136, 0.1)',
          },
        },
      },
    },
    Tooltip: {
      styles: {
        tooltip: {
          backgroundColor: '#1B4332',
          fontSize: '12px',
          fontWeight: 500,
        },
      },
    },
  },
})

export const metadata: Metadata = {
  title: 'Buddy',
  description: 'Personal finance management'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
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
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <Notifications />
          <Suspense fallback={'Loading'}>{children}</Suspense>
        </MantineProvider>
      </body>
    </html>
  )
}
