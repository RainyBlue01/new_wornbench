<template>
    <div>
        <a-button type="primary" class="w-full" long @click="showItem">修改插入函数</a-button>
        <base-modal ref="modalRef" :render-to-body="false" @handle-ok="formSubmit" @handle-cancel="handleCancel">
            <div class="dia">
                <div class="dia-left">
                    <!-- <div @click="setData(1)" :class="actives == 1 ? 'dia-left-item active' : 'dia-left-item'">自定义函数</div>
                    <div @click="setData(2)" :class="actives == 2 ? 'dia-left-item active' : 'dia-left-item'">公共函数</div> -->
                    <div class="dia-left-tree">
                        <div class="tree-title">
                            组件
                        </div>
                        <div class="tree-search">
                            <a-input-search placeholder="搜索函数" v-model="searchKey" />
                        </div>
                        <div class="tree">
                            <a-tree :show-line="true" :blockNode="true" :default-expand-all="true"
                                :data="formConfs.formList" :fieldNames="{
                                    key: 'id',
                                    title: 'title',
                                }">
                                <template #title="nodeData">
                                    <div class="tree-node">
                                        <div class="title">
                                            {{ nodeData.title }}
                                            {{ nodeData.id }}
                                        </div>
                                    </div>
                                </template>
                                <template #extra="nodeData">
                                    <div class="btn" @click="copyItem(nodeData.id)">
                                        复制ID
                                    </div>
                                </template>
                            </a-tree>
                        </div>
                    </div>
                    <div class="dia-left-bottom">
                        <div class="bottom-tree">
                            函数
                        </div>
                        <div class="tree">
                            <a-tree :blockNode="true" :data="variableData">
                                <template #title="nodeData">
                                    <div class="tree-node">
                                        <div class="title">
                                            {{ nodeData.title }}
                                        </div>


                                    </div>
                                </template>
                                <template #extra="nodeData">
                                    <div class="btn" @click="addItem(nodeData)">
                                        添加
                                    </div>
                                </template>
                            </a-tree>
                        </div>
                    </div>
                </div>
                <div class="dia-right">
                    <AmoAYunMonacoEditorVue3 theme="vs" :config="editorOptions" v-model="content" language="javascript"
                        style="width: 100%;height: 100%" />
                </div>
            </div>
        </base-modal>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { AmoAYunMonacoEditorVue3 } from "@amoayun/monaco-editor-vue3";
import { methodList } from '@/data/method.js'
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
const props = defineProps<{
    activeForm: any,
    formConfs: any,
}>()
const actives = ref(1)
const editorOptions = {
    fontSize: 14,
    minimap: { enabled: false },
    automaticLayout: true,
};
const content = ref('')
if (props.activeForm.method.input) {
    content.value = JSON.parse(JSON.stringify(props.activeForm.method.input))
}
const setData = (val: any) => {
    actives.value = val
}
const addItem = (val: any) => {
    content.value = content.value + '  ' + val.method
}
// 降级复制方法（兼容旧版浏览器）
const fallbackCopyToClipboard = (text: string) => {
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (!successful) {
            alert("由于浏览器安全设置，不支持复制功能!!！");
        }
    } catch (err) {
        console.error('复制失败:', err);
        alert("由于浏览器安全设置，不支持复制功能!!！");
    }
};

const copyItem = async (val: any) => {
    var text = '"' + val + '"'; //复制的内容
    
    // 尝试使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            fallbackCopyToClipboard(text);
        }
    } else {
        // 降级方案：使用 execCommand
        fallbackCopyToClipboard(text);
    }
}
self.MonacoEnvironment = {
    getWorker(_, label) {
        switch (label) {
            case "json":
                return new jsonWorker();
            case "javascript":
                return new tsWorker();
            default:
                return new editorWorker();
        }
    },
};
const modalRef = ref()
const searchKey = ref('')
const variableData = ref(methodList)
const showItem = () => {
    content.value = JSON.parse(JSON.stringify(props.activeForm.method.input))
    modalRef.value.handleClick({
        title: '动作配置',
        okText: '确认',
        cancelText: '取消',
        showBtn: true,
        width: '1200px',
    })

}
const formSubmit = () => {
    props.activeForm.method.input = JSON.parse(JSON.stringify(content.value))
    modalRef.value.handleClose()
}

const handleCancel = () => {
    content.value = ''
    modalRef.value.handleClose()
}
defineExpose({
    showItem,
})
</script>
<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

::v-deep {
    .arco-tree-node:hover {
        .btn {
            display: inline-block;
        }
    }
    .w-full{
        background:rgb(var(--primary-6)) !important;
        border-radius: 8px !important;
    }
}

.dia {
    display: flex;

    &-left {
        width: 240px;
        padding: 8px;
        border: 1px solid oklch(.92 .004 286.32);

        &-item {
            border: 1px solid oklch(.92 .004 286.32);
            padding: 8px 12px;
            border-radius: 3px;
            cursor: pointer;
            margin-bottom: 6px;
        }

        .active {
            color: textColor.$ThemeTextColor;
            border-color: textColor.$ThemeTextColor;
        }

        &-tree {

            .tree-title {
                margin-bottom: 8px;
            }

            .tree-search {
                margin-bottom: 8px;
            }

            .tree {
                margin-bottom: 8px;
            }
        }
    }

    &-right {
        margin-left: 10px;
        width: calc(100% - 250px);
        padding: 8px;
        border: 1px solid oklch(.92 .004 286.32);
    }
}

.tree {
    max-height: 300px;
    overflow: auto;
}

.tree-node {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title {
        width: 100px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 2px 0;
    }


}

.btn {
    display: none;
    padding: 2px 10px;
}

.btn:hover {
    color: textColor.$ThemeTextColor;
}

.tree-node:hover {
    .btn {
        display: inline-block;
    }
}
</style>
