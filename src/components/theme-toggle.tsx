'use client'

import { ActionIcon, Menu, Tooltip } from '@mantine/core'
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react'

import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  const getIcon = () => {
    switch (theme) {
      case 'dark':
        return <IconMoon size="1.2rem" stroke={1.5} />
      case 'light':
        return <IconSun size="1.2rem" stroke={1.5} />
      default:
        return <IconDeviceDesktop size="1.2rem" stroke={1.5} />
    }
  }

  return (
    <Tooltip label="Change theme" position="right">
      <Menu shadow="md" width={200} position="top-end">
        <Menu.Target>
          <ActionIcon 
            variant="light" 
            color="gray" 
            size="lg" 
            radius="md"
            aria-label="Toggle theme"
          >
            {getIcon()}
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Theme</Menu.Label>
          <Menu.Item 
            leftSection={<IconSun size="1rem" stroke={1.5} />}
            onClick={() => setTheme('light')}
            color="yellow"
          >
            Light
          </Menu.Item>
          <Menu.Item 
            leftSection={<IconMoon size="1rem" stroke={1.5} />}
            onClick={() => setTheme('dark')}
            color="blue"
          >
            Dark
          </Menu.Item>
          <Menu.Item 
            leftSection={<IconDeviceDesktop size="1rem" stroke={1.5} />}
            onClick={() => setTheme('system')}
            color="gray"
          >
            System
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Tooltip>
  )
}
