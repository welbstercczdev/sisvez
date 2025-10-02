import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Define o subdiretório para o deploy no GitHub Pages
  base: '/sisvez/',

  plugins: [react()],

  // Configuração opcional do servidor de desenvolvimento
  server: {
    port: 3000,
    host: '0.0.0.0',
  },

  // Mantém o alias de caminho para importações mais limpas
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});