import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'  // <-- Это ключ: импорт плагина

export default defineConfig({
  plugins: [react(), tailwindcss()],  // <-- Добавь сюда, если нет
})