'use client'

import React from 'react'
import { Card, Tooltip, Group, Text } from '@mantine/core'

interface OverviewCardProps {
  title: string
  value: string
  icon: React.ReactNode
}

export const OverviewCard: React.FC<OverviewCardProps> = ({ title, value, icon }) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" align="center" mb="xs">
        <Tooltip label={title}>
          <Text size="sm" fw={500}>{title}</Text>
        </Tooltip>
        {icon}
      </Group>
      <Text size="xl" fw={700} className="numeric-value">{value}</Text>
    </Card>
  )
}
