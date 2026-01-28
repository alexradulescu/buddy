import React from 'react'
import { Card, Tooltip, Group, Text, Box } from '@mantine/core'

interface OverviewCardProps {
  title: string
  value: string
  icon: React.ReactNode
}

export const OverviewCard: React.FC<OverviewCardProps> = ({ title, value, icon }) => {
  return (
    <Card padding="md" radius="md" withBorder>
      <Group justify="space-between" align="center" mb="xs">
        <Tooltip label={title}>
          <Text
            size="xs"
            fw={600}
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              color: '#6F767E',
            }}
          >
            {title}
          </Text>
        </Tooltip>
        <Box style={{ color: '#52B788' }}>
          {icon}
        </Box>
      </Group>
      <Text size="xl" fw={600} className="numeric-value">
        {value}
      </Text>
    </Card>
  )
}
