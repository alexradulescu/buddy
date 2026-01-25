'use client'

import React from 'react'
import { Card, Tooltip, Group, Text, Box } from '@mantine/core'

interface OverviewCardProps {
  title: string
  value: string
  icon: React.ReactNode
}

export const OverviewCard: React.FC<OverviewCardProps> = ({ title, value, icon }) => {
  return (
    <Card
      padding="md"
      radius="sm"
      withBorder
      style={{
        backgroundColor: '#FAF8F5',
        borderColor: 'rgba(28, 28, 28, 0.06)',
      }}
    >
      <Group justify="space-between" align="center" mb="xs">
        <Tooltip label={title}>
          <Text
            size="xs"
            fw={600}
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#6B6B6B',
            }}
          >
            {title}
          </Text>
        </Tooltip>
        <Box style={{ color: '#C4A052' }}>
          {icon}
        </Box>
      </Group>
      <Text
        size="xl"
        fw={500}
        className="numeric-value"
        style={{
          color: '#1C1C1C',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </Text>
    </Card>
  )
}
