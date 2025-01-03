import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { PATH } from './scripts/path';

export default defineConfig({
  base: '/', // 절대 경로로 설정
  build: {
      outDir: '../../../front',
      chunkSizeWarningLimit: 1600,
  },
  plugins: [react()],
  server: {
    proxy: {
      // 프론트엔드의 /api 요청을 백엔드 서버로 프록시
      '/api': {
        target: PATH.SERVER, // Spring Boot 서버 주소
        changeOrigin: true, // 필요 시 origin을 백엔드 서버로 변경
        secure: false, // HTTPS가 아니면 false로 설정
      },
    },
  },
});