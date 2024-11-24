'use client'

import React, { useState } from 'react'

export function HydrationBoundary({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(true)

  if (!isHydrated) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}
