'use client'

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'

interface HeaderActionContextType {
  action: ReactNode | null
  setAction: (action: ReactNode | null) => void
}

const HeaderActionContext = createContext<HeaderActionContextType | undefined>(undefined)

export function HeaderActionProvider({ children }: { children: ReactNode }) {
  const [action, setAction] = useState<ReactNode | null>(null)

  return (
    <HeaderActionContext.Provider value={{ action, setAction }}>
      {children}
    </HeaderActionContext.Provider>
  )
}

export function useHeaderAction() {
  const context = useContext(HeaderActionContext)
  if (!context) {
    throw new Error('useHeaderAction must be used within a HeaderActionProvider')
  }
  return context
}

// Hook for pages to set their header action
export function useSetHeaderAction(action: ReactNode | null) {
  const { setAction } = useHeaderAction()

  React.useEffect(() => {
    setAction(action)
    return () => setAction(null)
  }, [action, setAction])
}
