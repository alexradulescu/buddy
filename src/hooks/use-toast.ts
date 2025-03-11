'use client'

import { notifications } from '@mantine/notifications'
import { IconCheck, IconX } from '@tabler/icons-react'
import React from 'react'

type ToastProps = {
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'destructive'
}

function toast({ title, description, variant = 'default' }: ToastProps) {
  const id = Math.random().toString(36).substring(2, 9)
  
  const getColor = () => {
    switch (variant) {
      case 'success':
        return 'green'
      case 'error':
      case 'destructive':
        return 'red'
      case 'warning':
        return 'yellow'
      default:
        return 'blue'
    }
  }

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return React.createElement(IconCheck, { size: '1.1rem' })
      case 'error':
      case 'destructive':
        return React.createElement(IconX, { size: '1.1rem' })
      default:
        return null
    }
  }

  notifications.show({
    id,
    title,
    message: description,
    color: getColor(),
    icon: getIcon(),
    autoClose: 4000
  })

  return {
    id,
    dismiss: () => notifications.hide(id),
    update: (props: ToastProps) => {
      notifications.update({
        id,
        title: props.title,
        message: props.description,
        color: props.variant ? getColor() : getColor(),
        icon: getIcon(),
        autoClose: 4000
      })
    }
  }
}

function useToast() {
  return {
    toast,
    dismiss: (id?: string) => {
      if (id) {
        notifications.hide(id)
      } else {
        notifications.clean()
      }
    }
  }
}

export { useToast, toast }
