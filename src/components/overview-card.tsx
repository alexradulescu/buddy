'use client'

import React from 'react'
import { Card, Tooltip } from '@mantine/core'

interface OverviewCardProps {
  title: string
  value: string
  icon: React.ReactNode
}

export const OverviewCard: React.FC<OverviewCardProps> = ({ title, value, icon }) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <Tooltip label={title}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{title}</span>
        </Tooltip>
        {icon}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
    </Card>
  )
}
