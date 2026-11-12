---
name: "chrome-compatibility-fixer"
description: "Diagnose and fix Vite/Rolldown compatibility issues with older Chrome browsers. Invoke when project works on modern browsers but crashes/white-screens on Chrome 80-90 without error messages."
---

# Chrome Compatibility Fixer

**Battle-tested solution for "silent white screen" issue on older Chrome versions**

## Problem Pattern

You MUST use this skill when:
- Project works fine on Chrome 100+ but fails on Chrome 80-90
- White screen / blank page with NO console errors
- Script silently fails during parsing phase (no execution)

## Step 1: Root Cause Diagnosis

### Check #1: Vite Build Engine
```bash
# Check package.json for Rolldown - THE #1 CULPRIT!
cat package.json | grep "rolldown"
```
✅ **FIX FOUND IF**: `"vite": "npm:rolldown-vite@x.y.z"`

**Why?** Rolldown is experimental and DOES NOT do ES syntax downgrade. It outputs pure modern JS that Chrome < 90 cannot parse at all.

### Check #2: Legacy Plugin Missing
```bash
cat package.json | grep "@vitejs/plugin-legacy"
```
✅ **FIX FOUND IF**: No match

**Why?** Vite only targets modern browsers by default. Without legacy plugin, no polyfills for older browsers.

### Check #3: Build Target Not Set
```typescript
// vite.config.ts
build: {
  target: 'esnext'  // BAD - outputs ?. ?? #private etc.
}
```

## Step 2: The Fix

### 2.1 Replace Rolldown with Standard Vite
```diff
// package.json
{
  "devDependencies": {
-   "vite": "npm:rolldown-vite@7.2.5",
+   "vite": "^6.0.0",
  },
- "overrides": {
-   "vite": "npm:rolldown-vite@7.2.5"
- }
}
```

### 2.2 Install Compatibility Dependencies
```bash
npm install --save-dev @vitejs/plugin-legacy@^6.0.0 terser --legacy-peer-deps
```

### 2.3 Configure vite.config.ts
```typescript
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  build: {
    target: ['chrome80', 'edge80', 'firefox80', 'safari14'],
    cssTarget: ['chrome80'],
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'arco-design': ['@arco-design/web-vue'],
          'chart-vendor': ['echarts'],
        },
      },
    },
  },

  plugins: [
    vue(),
    legacy({
      targets: ['chrome >= 80', 'edge >= 80', 'firefox >= 80', 'safari >= 14'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      polyfills: [
        'es.array.at',
        'es.array.flat',
        'es.array.flat-map',
        'es.object.from-entries',
        'es.object.has-own',
        'es.promise.all-settled',
        'es.promise.finally',
        'es.string.replace-all',
        'es.global-this',
      ],
      modernPolyfills: [
        'es.array.at',
        'es.object.has-own',
      ],
    }),
  ],
})
```

## Step 3: Clean Reinstall & Build
```bash
# Remove node_modules and lock if needed
rm -rf node_modules package-lock.json
npm install

# Build and verify
npm run build
```

## Browser Coverage

| Browser | Minimum Version | Release Date |
|---------|-----------------|--------------|
| Chrome | 80+ | Feb 2020 |
| Edge | 80+ | Feb 2020 |
| Firefox | 80+ | Aug 2020 |
| Safari | 14+ | Sep 2020 |

## Why No Error Message?

This is the TRAP:
1. Older Chrome receives JS with syntax it doesn't recognize (optional chaining `?.`, etc.)
2. Chrome ABORTS script parsing **BEFORE ANY CODE EXECUTES**
3. No error logged, no stack trace, NOTHING - just silence
4. The `</script>` tag that loads your app is never "executed"
5. Your app code literally never runs. At all.

This is why @vitejs/plugin-legacy is NON-NEGOTIABLE for enterprise deployments!

## Pro Tips

- **DO NOT** use `rolldown-vite` for production - it's for build speed benchmarks only
- **DO** test on actual old Chrome versions, not just devtools "user agent" spoof
- **DO** add `.browserslistrc` for extra safety
- **DO NOT** skip legacy plugin thinking "our users use new Chrome" - enterprise environments are NOT like your dev machine!
