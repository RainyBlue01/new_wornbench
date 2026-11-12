import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import path from "path"
import svgLoader from 'vite-svg-loader';

/**
 * Monaco 0.52 uses the RegExp `d` flag to locate `MARK:` section headers.
 * The TypeScript worker is not processed by @vitejs/plugin-legacy, so it must
 * avoid that flag explicitly for the Chromium 79~89 used by the deployed app.
 */
const monacoLegacyRegExpPlugin = () => ({
  name: 'monaco-legacy-regexp',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    const normalizedId = id.replace(/\\/g, '/')
    if (!normalizedId.endsWith('/monaco-editor/esm/vs/editor/common/services/findSectionHeaders.js')) {
      return null
    }

    const compatibleCode = code
      .replace(
        "const markRegex = new RegExp('\\\\bMARK:\\\\s*(.*)$', 'd');",
        () => "const markRegex = new RegExp('\\\\bMARK:\\\\s*(.*)$');",
      )
      .replace('const column = match.indices[1][0] + 1;', 'const column = match.index + match[0].length - match[1].length + 1;')
      .replace('const endColumn = match.indices[1][1] + 1;', 'const endColumn = column + match[1].length;')

    if (compatibleCode === code) {
      throw new Error('Monaco compatibility transform did not match the expected source')
    }
    return { code: compatibleCode, map: null }
  },
})

// https://vite.dev/config/
export default defineConfig({
  base: '/wornbench/',
  server: {
    host: '0.0.0.0',
    port: 8118,
    open: false,
    // watch: {
    //   // This helper symlink points to a UNC share. Chokidar can throw
    //   // FSWatcher UNKNOWN errors when Windows temporarily cannot stat it.
    //   ignored: ['**/_prototype_summary_link', '**/_prototype_summary_link/**'],
    // },
    proxy: {
      // 跨域代理
      '/api': {
        target: 'http://yfb.jysm.cn:18080',
        // target: 'http://172.17.42.1:8080',
        // target: 'https://www.scpjzz.cn',
        changeOrigin: true, // 允许跨域
      },
      // 文件预览服务代理
      '/preview': {
        target: 'http://172.17.2.122:9001',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/preview/, ''),
      },
    },
    fs: {
      strict: false,
    },
  },
  assetsInclude: ['**/*.xlsx'],
  worker: {
    plugins: () => [monacoLegacyRegExpPlugin()],
  },
  plugins: [
    monacoLegacyRegExpPlugin(),
    vue(),
    legacy({
      // 统一认证现场仍有 Chromium 79~89，无法识别 RegExp 的 `d` flag。
      // legacy 插件会做运行时特性检测，并为这些浏览器加载兼容构建。
      targets: ['Chrome >= 79', 'Edge >= 79'],
    }),
    svgLoader({
      defaultImport: 'url', // or 'raw'
      svgo: true, svgoConfig: {}
    }),
  ],
  resolve: {
    // Vite路径别名配置
    alias: {
      '@': path.resolve('./src'),
      'assets': path.resolve('./src/assets'),
      'styles': path.resolve('./src/styles')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/echarts')) {
            return 'chart-vendor'
          }
        },
      },
    },
  },
})
