import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import './globals.css'
import { Suspense } from 'react'
import type { Metadata, Viewport } from 'next'
import { ColorSchemeScript, MantineProvider, mantineHtmlProps, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'

// Art Deco Minimalist Theme
// Elegant typography with refined geometric precision
const theme = createTheme({
  // Typography - Elegant serif for display, refined sans for body
  fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', ui-monospace, 'Cascadia Code', monospace",
  headings: {
    fontFamily: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
    fontWeight: '500',
  },

  // Art Deco Color Palette
  colors: {
    gold: [
      '#FDF9F0', // 0 - lightest
      '#F9F1DC', // 1
      '#F0E4C3', // 2
      '#E5D4A8', // 3
      '#D4B976', // 4
      '#C4A052', // 5 - primary gold
      '#B08C3E', // 6
      '#9A7A35', // 7
      '#84682D', // 8
      '#6E5625', // 9 - darkest
    ],
    charcoal: [
      '#F5F5F5', // 0
      '#E8E8E8', // 1
      '#D4D4D4', // 2
      '#A3A3A3', // 3
      '#737373', // 4
      '#525252', // 5
      '#3D3D3D', // 6 - graphite
      '#2D2D2D', // 7
      '#1C1C1C', // 8 - charcoal
      '#0A0A0A', // 9
    ],
    // Muted sage green for positive
    sage: [
      '#F4F7F5',
      '#E8EFE9',
      '#D1DFD4',
      '#B4C9B8',
      '#8FAF96',
      '#6A9574',
      '#4A7C59', // primary
      '#3D6649',
      '#31513A',
      '#253D2C',
    ],
    // Muted terracotta for negative
    terra: [
      '#FBF7F6',
      '#F5EDEB',
      '#EBDAD6',
      '#DEC3BD',
      '#CDA59D',
      '#B8877E',
      '#A65D57', // primary
      '#8A4D48',
      '#6E3E3A',
      '#532F2C',
    ],
  },
  primaryColor: 'charcoal',
  primaryShade: 8,

  // Remove shadows for clean, flat aesthetic
  shadows: {
    xs: 'none',
    sm: 'none',
    md: '0 2px 8px rgba(28, 28, 28, 0.04)',
    lg: '0 4px 16px rgba(28, 28, 28, 0.06)',
    xl: '0 8px 24px rgba(28, 28, 28, 0.08)',
  },

  // Refined spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },

  // Subtle radius for elegance
  radius: {
    xs: '2px',
    sm: '3px',
    md: '4px',
    lg: '6px',
    xl: '8px',
  },
  defaultRadius: 'sm',

  // Component defaults with art deco refinement
  components: {
    Card: {
      defaultProps: {
        padding: 'sm',
        radius: 'sm',
        withBorder: true,
      },
      styles: {
        root: {
          borderColor: 'rgba(28, 28, 28, 0.08)',
          backgroundColor: '#FAF8F5',
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
          letterSpacing: '0.05em',
          color: '#3D3D3D',
          paddingTop: '8px',
          paddingBottom: '8px',
          backgroundColor: '#F5F2ED',
          borderBottom: '1px solid rgba(28, 28, 28, 0.1)',
        },
        td: {
          paddingTop: '6px',
          paddingBottom: '6px',
          borderBottom: '1px solid rgba(28, 28, 28, 0.05)',
        },
      },
    },
    Button: {
      defaultProps: {
        radius: 'sm',
        size: 'sm',
      },
      styles: {
        root: {
          fontWeight: 500,
          letterSpacing: '0.02em',
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'sm',
        size: 'sm',
      },
      styles: {
        input: {
          backgroundColor: '#FAF8F5',
          borderColor: 'rgba(28, 28, 28, 0.12)',
          '&:focus': {
            borderColor: '#C4A052',
          },
        },
        label: {
          fontWeight: 500,
          fontSize: '12px',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.04em',
          color: '#3D3D3D',
          marginBottom: '4px',
        },
      },
    },
    Select: {
      defaultProps: {
        radius: 'sm',
        size: 'sm',
      },
      styles: {
        input: {
          backgroundColor: '#FAF8F5',
          borderColor: 'rgba(28, 28, 28, 0.12)',
        },
        label: {
          fontWeight: 500,
          fontSize: '12px',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.04em',
          color: '#3D3D3D',
          marginBottom: '4px',
        },
      },
    },
    NumberInput: {
      defaultProps: {
        radius: 'sm',
        size: 'sm',
      },
      styles: {
        input: {
          backgroundColor: '#FAF8F5',
          borderColor: 'rgba(28, 28, 28, 0.12)',
        },
        label: {
          fontWeight: 500,
          fontSize: '12px',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.04em',
          color: '#3D3D3D',
          marginBottom: '4px',
        },
      },
    },
    Textarea: {
      defaultProps: {
        radius: 'sm',
        size: 'sm',
      },
      styles: {
        input: {
          backgroundColor: '#FAF8F5',
          borderColor: 'rgba(28, 28, 28, 0.12)',
        },
        label: {
          fontWeight: 500,
          fontSize: '12px',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.04em',
          color: '#3D3D3D',
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
          letterSpacing: '0.04em',
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
          backgroundColor: '#F5F2ED',
          '&:hover': {
            backgroundColor: '#EDE9E3',
          },
        },
        content: {
          padding: '12px',
          backgroundColor: '#FAF8F5',
        },
        item: {
          borderBottom: '1px solid rgba(28, 28, 28, 0.08)',
        },
      },
    },
    Modal: {
      defaultProps: {
        radius: 'sm',
        padding: 'md',
      },
      styles: {
        content: {
          backgroundColor: '#FAF8F5',
        },
        header: {
          backgroundColor: '#FAF8F5',
        },
        title: {
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 500,
          fontSize: '20px',
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
          fontFamily: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
          fontWeight: 500,
          letterSpacing: '0.02em',
          color: '#1C1C1C',
        },
      },
    },
    Text: {
      styles: {
        root: {
          color: '#1C1C1C',
        },
      },
    },
    ActionIcon: {
      defaultProps: {
        variant: 'subtle',
      },
      styles: {
        root: {
          color: '#6B6B6B',
          '&:hover': {
            backgroundColor: 'rgba(196, 160, 82, 0.12)',
          },
        },
      },
    },
    Tooltip: {
      styles: {
        tooltip: {
          backgroundColor: '#1C1C1C',
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
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <Notifications />
          <Suspense fallback={'Loading'}>{children}</Suspense>
        </MantineProvider>
      </body>
    </html>
  )
}
