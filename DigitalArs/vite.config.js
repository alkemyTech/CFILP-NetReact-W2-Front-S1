import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@local': '/src/api/local',  // Alias para la carpeta 'src/api/local'
    },
  },
})
