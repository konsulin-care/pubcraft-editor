import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { mergeConfig } from 'vite'

const testConfig = {
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*'],
      exclude: ['src/**/*.d.ts', 'src/components/ui/**']
    }
  }
}

export default defineConfig(configEnv => {
  const baseConfig = {
    plugins: [react()]
  }

  return process.env.VITEST 
    ? mergeConfig(baseConfig, testConfig)
    : baseConfig
})
