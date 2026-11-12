<template>
    <div>
        <AmoAYunMonacoEditorVue3 theme="vs" :config="editorOptions" v-model="content" :smoothScrolling="false"
            :language="props.language" style="width: 100%;height: 400px;margin-bottom:30px" />
    </div>
</template>

<script setup lang="ts">
import { ref, watch, inject } from "vue";
import { AmoAYunMonacoEditorVue3 } from "@amoayun/monaco-editor-vue3";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
const props = defineProps<{
    contents: any,
    language: any
}>()
const provideState = inject("provideDesigner") as {
    updataInput: (...args: any) => void;
};
self.MonacoEnvironment = {
    getWorker(_, label) {
        switch (label) {
            case "json":
                return new jsonWorker();
            case "css":
            case "scss":
            case "less":
                return new cssWorker();
            case "html":
            case "handlebars":
            case "razor":
                return new htmlWorker();
            case "typescript":
            case "javascript":
                return new tsWorker();
            default:
                return new editorWorker();
        }
    },
};
const content = ref();
content.value = JSON.parse(JSON.stringify(props.contents))
watch(
    () => content.value,
    (val) => {
        provideState.updataInput(val)
    }
)
const editorOptions = {
    fontSize: 14,
    minimap: { enabled: false },
    automaticLayout: true,
};
</script>