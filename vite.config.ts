import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // se quiser, pode adicionar mais alias, tipo:
      // 'services': path.resolve(__dirname, 'src/services'),
    },
  },
});
