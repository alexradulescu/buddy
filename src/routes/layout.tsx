import { FC, PropsWithChildren } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7'
import { HydrationBoundary } from '@/components/hydration-boundary'
import { Navigation } from '@/components/navigation'
import { Flex, Box } from '@mantine/core'
import classes from './layout.module.css'

export const RootLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <NuqsAdapter>
      <HydrationBoundary>
        <Flex mih="100vh" bg="white">
          <Navigation />
          <Box
            component="main"
            className={classes.mainContent}
            flex={1}
            p="md"
            pb={{ base: '5rem', sm: 'md' }}
            pl={{ base: 'md', sm: '4rem' }}
            bg="gray.0"
            style={(theme) => ({
              overflowY: 'auto'
            })}
          >
            {children}
          </Box>
        </Flex>
      </HydrationBoundary>
    </NuqsAdapter>
  )
}

export default RootLayout
