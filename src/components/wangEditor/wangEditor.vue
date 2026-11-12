<template>
    <div class="wangEditor">
        <Toolbar
            class="wangEditor__toolbar"
            :editor="editorRef"
            :default-config="toolbarConfig"
            mode="default"
        />
        <div class="wangEditor__editor-wrap">
            <Editor
                class="wangEditor__editor"
                v-model="valueHtml"
                :default-config="editorConfig"
                mode="default"
                @on-created="handleCreated"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import '@wangeditor/editor/dist/css/style.css';

import { onBeforeUnmount, shallowRef, inject, watch } from 'vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor';

const props = defineProps<{
    contents: any;
}>();

const emit = defineEmits<{
    'update:contents': [value: string];
}>();

const EMPTY_HTML = '<p><br></p>';

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function slateNodesToHtml(nodes: any[]): string {
    const text = nodes
        .map((node) => {
            if (typeof node?.text === 'string') return node.text;
            if (Array.isArray(node?.children)) {
                return node.children.map((child: any) => child?.text || '').join('');
            }
            return '';
        })
        .join('\n')
        .trim();
    return text ? text.split('\n').map((line) => `<p>${escapeHtml(line)}</p>`).join('') : EMPTY_HTML;
}

function normalizeHtml(value: any): string {
    if (value == null || value === '') return EMPTY_HTML;
    if (typeof value === 'string') return value || EMPTY_HTML;
    if (Array.isArray(value)) return slateNodesToHtml(value);
    if (Array.isArray(value?.children)) return slateNodesToHtml(value.children);
    return EMPTY_HTML;
}

const valueHtml = shallowRef(normalizeHtml(props.contents));
const editorRef = shallowRef<IDomEditor>();

const toolbarConfig: Partial<IToolbarConfig> = {
    // 挂载到 body 会使用 left:0;right:0，在侧边栏场景下定位错误
    modalAppendToBody: false,
    toolbarKeys: [
        'justifyLeft',
        'justifyRight',
        'justifyCenter',
        'bold',
        'underline',
        'italic',
        'clearStyle',
        'color',
        'fontSize',
        'insertLink',
        'editLink',
    ],
    excludeKeys: [],
};

const editorConfig: Partial<IEditorConfig> = {
    placeholder: '请输入内容...',
    scroll: true,
    MENU_CONF: {
        uploadImage: {
            server: '',
            fieldName: 'file',
            meta: {},
            headers: { token: localStorage.getItem('token') || '' },
            timeout: 5 * 1000,
            allowedFileTypes: ['image/*'],
            maxFileSize: 30 * 1024 * 1024,
            base64LimitSize: 1000000 * 1024,
            customInsert(_res: unknown, insertFn: (url: string, alt?: string, href?: string) => void) {
                insertFn('', '', '');
            },
        },
        uploadVideo: {
            server: '',
            fieldName: 'file',
            meta: {},
            headers: { token: localStorage.getItem('token') || '' },
            timeout: 5 * 1000,
            allowedFileTypes: ['video/*'],
            customInsert(_res: unknown, insertFn: (url: string, alt?: string, href?: string) => void) {
                insertFn('', '', '');
            },
        },
    },
};

const provideState = inject('provideDesigner') as {
    updataDes: (...args: any) => void;
} | null;

const handleCreated = (editor: IDomEditor) => {
    editorRef.value = editor;
};

watch(
    () => valueHtml.value,
    (val) => {
        const next = val !== EMPTY_HTML ? val : '';
        emit('update:contents', next);
        provideState?.updataDes(next);
    },
);

watch(
    () => props.contents,
    (val) => {
        const next = normalizeHtml(val);
        if (next !== valueHtml.value) {
            valueHtml.value = next;
        }
    },
);

onBeforeUnmount(() => {
    const editor = editorRef.value;
    if (editor == null) {
        return;
    }
    editor.destroy();
});
</script>

<style lang="scss" scoped>
@use '../../styles/textColor.scss' as textColor;

.wangEditor {
    position: relative;
    z-index: 0;
    display: flex;
    flex-direction: column;
    min-height: 400px;
    overflow: visible;
    border: 1px solid #ccc;
    border-radius: 8px;
}

.wangEditor__toolbar {
    flex-shrink: 0;
    border-bottom: 1px solid #ccc;
    border-radius: 8px 8px 0 0;
    overflow: visible;
}

.wangEditor__editor-wrap {
    position: relative;
    flex: 0 0 320px;
    min-height: 320px;
    height: 320px;
    overflow: visible;
}

.wangEditor__editor {
    height: 100%;
}

:deep(.w-e-toolbar) {
    overflow: visible !important;
    flex-wrap: wrap;
}

:deep(.w-e-bar-item) {
    overflow: visible !important;
}

:deep(.w-e-text-container) {
    min-height: 320px !important;
    height: 320px !important;
}

:deep(.w-e-scroll) {
    min-height: 320px !important;
    height: 320px !important;
    overflow-y: auto !important;
}

:deep(.w-e-select-list) {
    z-index: 10001 !important;
}

:deep(.w-e-drop-panel) {
    z-index: 10001 !important;
}

:deep(.w-e-modal) {
    z-index: 10002 !important;
}

:deep(.w-e-text-container p) {
    padding: 0;
    margin: 0;
}

:deep(.w-e-text-placeholder) {
    top: 5px;
}
</style>
