<template>
    <a-drawer :width="800" :visible="visible" unmount-on-close class="form-designer-json-drawer" @ok="handleOk"
        @cancel="handleCancel">
        <template #title>编辑</template>
        <AmoAYunMonacoEditorVue3 theme="vs" :config="editorOptions" v-model="content" language="json"
            style="width: 100%; height: 100%" />
    </a-drawer>
</template>
<script setup lang="ts">
import { ref, inject } from 'vue'
import { Message } from '@arco-design/web-vue'
import { AmoAYunMonacoEditorVue3 } from "@amoayun/monaco-editor-vue3";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";

const props = defineProps<{
    formConfs: any,
}>()

self.MonacoEnvironment = {
    getWorker(_, label) {
        switch (label) {
            case "json":
                return new jsonWorker();
            default:
                return new editorWorker();
        }
    },
};

const editorOptions = {
    fontSize: 14,
    minimap: { enabled: false },
    automaticLayout: true,
};

const content = ref('')
const provideState = inject("provideDesigner") as {
    setFormConfs: (...args: any) => void;
};
const visible = ref(false)

const openEditor = () => {
    visible.value = true
    content.value = JSON.stringify(props.formConfs, null, 2)
}

const handleOk = () => {
    try {
        provideState.setFormConfs(JSON.parse(content.value))
        visible.value = false
    } catch (error) {
        console.error(error)
        Message.error('JSON 格式不正确，请检查后再保存')
    }
}

const handleCancel = () => {
    visible.value = false
}

defineExpose({
    openEditor,
    showItem: openEditor,
})
</script>
