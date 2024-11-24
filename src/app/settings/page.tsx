'use client'

import React from 'react'
import { BackupRestore } from '@/components/backup-restore'
import { CategoryConfigurator } from '@/components/category-configurator'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Backup & Restore</CardTitle>
          </CardHeader>
          <CardContent>
            <BackupRestore />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Category Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryConfigurator />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
