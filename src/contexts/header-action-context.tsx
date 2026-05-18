import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

type SetHeaderAction = (action: ReactNode | null) => void

// Two contexts so that components calling useSetHeaderAction only subscribe to
// the (stable) setter — otherwise setting the action would re-render the
// caller, produce a new ReactNode, and loop.
const HeaderActionContext = createContext<ReactNode | null>(null)
const HeaderActionSetterContext = createContext<SetHeaderAction | undefined>(undefined)

export function HeaderActionProvider({ children }: { children: ReactNode }) {
  const [action, setAction] = useState<ReactNode | null>(null)

  return (
    <HeaderActionSetterContext.Provider value={setAction}>
      <HeaderActionContext.Provider value={action}>
        {children}
      </HeaderActionContext.Provider>
    </HeaderActionSetterContext.Provider>
  )
}

export function useHeaderAction() {
  const action = useContext(HeaderActionContext)
  return { action }
}

function useHeaderActionSetter() {
  const setAction = useContext(HeaderActionSetterContext)
  if (!setAction) {
    throw new Error('useSetHeaderAction must be used within a HeaderActionProvider')
  }
  return setAction
}

// Hook for pages to set their header action.
// Updates whenever the action changes so callbacks captured in JSX stay fresh,
// and clears the action when the component unmounts.
export function useSetHeaderAction(action: ReactNode | null) {
  const setAction = useHeaderActionSetter()

  useEffect(() => {
    setAction(action)
  }, [action, setAction])

  useEffect(() => {
    return () => setAction(null)
  }, [setAction])
}
