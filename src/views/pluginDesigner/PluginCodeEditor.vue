<script setup lang="ts">
import { computed } from 'vue'
import { AmoAYunMonacoEditorVue3 } from '@amoayun/monaco-editor-vue3'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

const props = withDefaults(
  defineProps<{
    filename?: string
    functionKind?: string
    language?: string
  }>(),
  {
    filename: 'index.js',
    functionKind: '前端函数',
    language: 'javascript',
  },
)

const code = defineModel<string>({ required: true })

const editorOptions = {
  automaticLayout: true,
  fontSize: 13,
  fontFamily: "Consolas, 'Courier New', monospace",
  lineHeight: 22,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  tabSize: 2,
  insertSpaces: true,
  wordWrap: 'off',
  padding: { top: 18, bottom: 18 },
}

const lineCount = computed(() => code.value.split('\n').length)
const languageConfig = computed(() => {
  const language = props.language.trim().toLowerCase() || 'javascript'
  const configs: Record<string, { mode: string; label: string; extension: string }> = {
    javascript: { mode: 'javascript', label: 'JavaScript', extension: 'js' },
    js: { mode: 'javascript', label: 'JavaScript', extension: 'js' },
    nodejs: { mode: 'javascript', label: 'Node.js', extension: 'js' },
    node: { mode: 'javascript', label: 'Node.js', extension: 'js' },
    typescript: { mode: 'typescript', label: 'TypeScript', extension: 'ts' },
    ts: { mode: 'typescript', label: 'TypeScript', extension: 'ts' },
    java: { mode: 'java', label: 'Java', extension: 'java' },
    python: { mode: 'python', label: 'Python', extension: 'py' },
    py: { mode: 'python', label: 'Python', extension: 'py' },
    json: { mode: 'json', label: 'JSON', extension: 'json' },
  }
  return configs[language] ?? {
    mode: language || 'plaintext',
    label: props.language || 'Plain Text',
    extension: 'txt',
  }
})
const editorLanguage = computed(() => languageConfig.value.mode)
const languageLabel = computed(() => languageConfig.value.label)
const displayFilename = computed(() => {
  const basename = props.filename.replace(/\.[^./\\]+$/, '')
  return `${basename}.${languageConfig.value.extension}`
})

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'javascript' || label === 'typescript') {
      return new tsWorker()
    }
    return new editorWorker()
  },
}
</script>

<template>
  <section class="plugin-code-editor">
    <header class="editor-header">
      <span class="function-badge">{{ functionKind }}</span>
      <span>{{ displayFilename }}</span>
    </header>
    <div class="editor-content">
      <AmoAYunMonacoEditorVue3
        :key="editorLanguage"
        v-model="code"
        theme="vs-dark"
        :language="editorLanguage"
        :config="editorOptions"
        class="monaco-editor"
      />
    </div>
    <footer class="editor-footer">
      <span>{{ languageLabel }} · UTF-8</span>
      <span>{{ lineCount }} 行 · 已保存</span>
    </footer>
  </section>
</template>

<style scoped lang="scss">
.plugin-code-editor {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  background: #1e293b;
  color: #d5deea;
}

.editor-header,
.editor-footer {
  display: flex;
  height: 40px;
  flex-shrink: 0;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  background: #0f172a;
  color: #86a0c3;
  font-size: 11px;
}

.function-badge {
  padding: 3px 8px;
  border-radius: 5px;
  background: #dcfce7;
  color: #16a34a;
}

.editor-content {
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.monaco-editor {
  width: 100%;
  height: 100%;
}

.editor-footer {
  height: 34px;
  justify-content: space-between;
  border-top: 1px solid #304057;
}
</style>
