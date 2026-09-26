import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { MantineProvider } from '@mantine/core'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
import { Notifications } from '@mantine/notifications'
import { theme } from './theme'
import { router } from './router'
import { convex } from './db'
import { SignIn } from './components/sign-in'

import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import './styles/base.css'
import './styles/mantine-overrides.css'
import './styles/app-shell.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConvexAuthProvider client={convex}>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <Notifications />
        <AuthLoading>{null}</AuthLoading>
        <Unauthenticated>
          <SignIn />
        </Unauthenticated>
        <Authenticated>
          <RouterProvider router={router} />
        </Authenticated>
      </MantineProvider>
    </ConvexAuthProvider>
  </React.StrictMode>
)
