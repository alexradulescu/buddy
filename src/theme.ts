import { createTheme } from '@mantine/core'

// Colors are CSS variables defined in styles/base.css, so plain CSS and Mantine share one source
const inputStyles = {
  label: { fontWeight: 500, fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '6px' }
}

export const theme = createTheme({
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', 'Segoe UI', system-ui, sans-serif",
  fontFamilyMonospace: "ui-monospace, 'SF Mono', Menlo, monospace",
  headings: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', system-ui, sans-serif",
    fontWeight: '600'
  },

  // systemBlue, shade 6 is the tint
  colors: {
    tint: ['#e5f1ff', '#cce4ff', '#99c9ff', '#66adff', '#3392ff', '#1a85ff', '#007aff', '#0062cc', '#004999', '#003166']
  },
  primaryColor: 'tint',
  primaryShade: { light: 6, dark: 5 },

  shadows: {
    xs: 'var(--shadow-card)',
    sm: 'var(--shadow-card)',
    md: 'var(--shadow-popover)',
    lg: 'var(--shadow-popover)',
    xl: 'var(--shadow-popover)'
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '20px',
    xl: '28px'
  },

  radius: {
    xs: '6px',
    sm: '8px',
    md: '10px',
    lg: '12px',
    xl: '16px'
  },
  defaultRadius: 'md',

  components: {
    // Inset-grouped cards: no border, soft elevation, 12px corners
    Card: {
      defaultProps: { padding: 'md', withBorder: false, radius: 'lg', shadow: 'sm' },
      styles: { root: { backgroundColor: 'var(--color-surface)' } }
    },
    Table: {
      defaultProps: {
        highlightOnHover: true,
        verticalSpacing: '7px',
        horizontalSpacing: 'sm',
        fz: 'sm',
        withRowBorders: true
      },
      styles: {
        th: {
          fontWeight: 500,
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
          paddingTop: '8px',
          paddingBottom: '8px',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '0.5px solid var(--color-border)'
        },
        td: {
          borderBottom: '0.5px solid var(--color-border-light)'
        }
      }
    },
    Button: {
      defaultProps: { radius: 'md' },
      styles: { root: { fontWeight: 500, letterSpacing: '-0.01em' } }
    },
    TextInput: { styles: inputStyles },
    Select: { styles: inputStyles },
    NumberInput: { styles: inputStyles },
    Textarea: { styles: inputStyles },
    Badge: {
      defaultProps: { radius: 'xl', size: 'sm', variant: 'light' },
      styles: { root: { textTransform: 'none' as const, fontWeight: 600, fontSize: '11px' } }
    },
    SegmentedControl: {
      defaultProps: { radius: 'md', size: 'sm' }
    },
    Accordion: {
      defaultProps: { chevronPosition: 'right' },
      styles: {
        control: { fontWeight: 600, backgroundColor: 'var(--color-surface)' },
        label: { fontSize: '15px', letterSpacing: '-0.01em' },
        item: { borderBottom: 'none' }
      }
    },
    Modal: {
      defaultProps: { radius: 'lg', centered: true },
      styles: {
        content: { backgroundColor: 'var(--color-surface)' },
        header: { backgroundColor: 'var(--color-surface)' },
        title: { fontWeight: 600, fontSize: '17px' }
      }
    },
    Stack: { defaultProps: { gap: 'sm' } },
    Title: { styles: { root: { fontWeight: 600, color: 'var(--color-text)' } } },
    Text: { styles: { root: { color: 'var(--color-text)' } } },
    ActionIcon: {
      defaultProps: { variant: 'subtle', radius: 'md' },
      styles: { root: { color: 'var(--color-tint)' } }
    },
    Menu: { defaultProps: { radius: 'lg', shadow: 'md' } },
    Tooltip: {
      defaultProps: { openDelay: 400 },
      styles: {
        tooltip: {
          backgroundColor: 'var(--material-bar)',
          backdropFilter: 'var(--material-blur)',
          color: 'var(--color-text)',
          boxShadow: 'var(--shadow-popover)',
          fontSize: '12px',
          fontWeight: 500
        }
      }
    }
  }
})
