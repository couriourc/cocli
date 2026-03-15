import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 60000, // 增加到 60 秒
    hookTimeout: 60000, // 增加到 60 秒
    teardownTimeout: 30000, // 增加到 30 秒
    // 配置转译器以支持 CommonJS 模块
    transformMode: {
      web: [/\.[jt]sx?$/],
      ssr: [/\.[jt]sx?$/],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
  // 配置 esbuild 选项以更好地处理 CommonJS
  esbuild: {
    target: 'node18',
    format: 'esm',
  },
})

