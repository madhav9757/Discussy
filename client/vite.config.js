import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000', // or your backend port
    },
  },
};
