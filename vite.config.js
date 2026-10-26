import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// 데모 빌드(VITE_DEMO=true)는 GitHub Pages 주소(https://yeomhojun1.github.io/easit/)에 맞춰 base 를 바꾼다
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: loadEnv(mode, process.cwd(), '').VITE_DEMO === 'true' ? '/easit/' : '/',
}))
