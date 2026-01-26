'use client'

import { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react'

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
// The action is set on mount and cleared on unmount
export function useSetHeaderAction(action: ReactNode | null) {
  const { setAction } = useHeaderAction()
  const actionRef = useRef(action)
  actionRef.current = action

  useEffect(() => {
    // Set the action from the ref (always has latest value)
    setAction(actionRef.current)

    // Clear the action when component unmounts
    return () => setAction(null)
    // Only run on mount/unmount - setAction is stable from useState
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
