import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    tanstackStart({ spa: { enabled: true } }),
    nitro(),
    viteReact(),
  ],
  resolve: { tsconfigPaths: true },
  server: { port: 3000 },
})
