'use client'

import React from 'react'
import { Card, Group, Text, Tooltip } from '@mantine/core'

interface OverviewCardProps {
  title: string
  value: string
  icon: React.ReactNode
}

export const OverviewCard: React.FC<OverviewCardProps> = ({ title, value, icon }) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" wrap="nowrap" mb="xs">
        <Tooltip label={title}>
          <Text fw={500} size="sm">{title}</Text>
        </Tooltip>
        {icon}
      </Group>
      <Text fw={700} size="xl">{value}</Text>
    </Card>
  )
}
