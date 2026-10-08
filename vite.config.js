import os from 'node:os'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev the app is usually opened on localhost, which a phone cannot reach.
// Expose the machine's LAN address so the QR code points somewhere scannable.
function lanAddress() {
  const candidates = Object.values(os.networkInterfaces())
    .flat()
    .filter((net) => net && net.family === 'IPv4' && !net.internal)
    .map((net) => net.address)
  return (
    candidates.find((ip) => ip.startsWith('192.168.')) ??
    candidates.find((ip) => ip.startsWith('10.')) ??
    candidates.find((ip) => /^172\.(1[6-9]|2\d|3[01])\./.test(ip)) ??
    null
  )
}

export default defineConfig(({ command }) => ({
  plugins: [react()],
  define: {
    __LAN_HOST__: JSON.stringify(command === 'serve' ? lanAddress() : null),
  },
  server: { port: 5176 },
  preview: { port: 5176 },
}))
