import { FC, PropsWithChildren } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7'
import { HydrationBoundary } from '@/components/hydration-boundary'
import { Navigation } from '@/components/navigation'
import { Flex, Box } from '@mantine/core'

export const RootLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <NuqsAdapter>
      <HydrationBoundary>
        <Flex mih="100vh" bg="white">
          <Navigation />
          <Box
            component="main"
            flex={1}
            p="md"
            pl="5rem"
            bg="#fafaf9"
            m="1"
            style={{
              overflowY: 'auto',
              borderRadius: '0.125rem',
              border: '1px solid #f5f5f4'
            }}
          >
            {children}
          </Box>
        </Flex>
      </HydrationBoundary>
    </NuqsAdapter>
  )
}

export default RootLayout
