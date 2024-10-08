'use client'

import React from 'react'

import { BackupRestore } from '@/components/backup-restore'
import { CategoryConfigurator } from '@/components/category-configurator'

export default function SettingsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      <div className="space-y-8">
        <BackupRestore />
        <div>
          <h2 className="text-xl font-semibold mb-4">Category Configuration</h2>
          <CategoryConfigurator />
        </div>
      </div>
    </>
  )
}
