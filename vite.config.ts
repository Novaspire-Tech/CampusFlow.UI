import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), visualizer({ open: false })],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        //'\\.svg$': path.resolve(__dirname, './src/test/__mocks__/svgMock.ts'),
      },
    },

    server: {
      open: true,
      port: Number(env.VITE_REACT_PORT) || 9081,
      host: true,
      strictPort: true,
      allowedHosts: true,
    },

    preview: {
      port: 3000,
      host: true,
      allowedHosts: true,
      strictPort: true,
    },

    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'axios'],
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
      chunkSizeWarningLimit: 1000,
      esbuild: {
        drop: ['console', 'debugger'],
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('react')) {
              return 'react'
            }

            if (id.includes('react-router')) {
              return 'router'
            }

            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
        },
      },
    },

    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.ts',
      mockReset: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 70,
          statements: 80,
        },
      },
    },
  }
})