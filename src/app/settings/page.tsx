import React from 'react'

import { CategoryConfigurator } from '@/components/category-configurator'

export default function SettingsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-4">Category Configuration</h2>
        <CategoryConfigurator />
      </div>
    </>
  )
}
