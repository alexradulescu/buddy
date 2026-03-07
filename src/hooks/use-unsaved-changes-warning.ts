import { useEffect } from 'react'
import { useBlocker } from '@tanstack/react-router'

export function useUnsavedChangesWarning(isDirty: boolean) {
  useBlocker(
    () => !window.confirm('You have unsaved changes. Are you sure you want to leave?'),
    isDirty
  )

  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])
}
