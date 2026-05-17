import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

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

// Hook for pages to set their header action.
// Updates whenever the action changes so callbacks captured in JSX stay fresh,
// and clears the action when the component unmounts.
export function useSetHeaderAction(action: ReactNode | null) {
  const { setAction } = useHeaderAction()

  useEffect(() => {
    setAction(action)
  }, [action, setAction])

  useEffect(() => {
    return () => setAction(null)
  }, [setAction])
}
