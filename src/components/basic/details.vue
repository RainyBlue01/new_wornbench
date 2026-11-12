<template>
    <div class="create">
        <a-drawer v-model:visible="dialogVisible" title="详情" width="680px" :footer="false" @cancel="next">
            <div class="dia">
                <a-descriptions :column="1" bordered>
                    <a-descriptions-item v-for="(item, index) in topList" :key="item.column" :label="item.label">
                        <div class="itema">
                            <span
                                v-if="!isFileFieldType(item.type) && item.type !== 'SIGNATURE' && item.type !== 'SUBFORM' && item.type !== 'RELATION_DATA' && !item.nodeInfo">
                                {{ getDisplayValue(item) }}
                            </span>
                            <span v-if="item.nodeInfo" class="node-info-container">
                                <template v-if="datas[item.column]?.formatValue && typeof datas[item.column]?.formatValue === 'object'">
                                    <div v-if="Array.isArray(datas[item.column]?.formatValue)" class="node-list">
                                        <div v-for="(itema, index) in datas[item.column]?.formatValue" :key="index + 'i'" class="node-item">
                                            <div class="node-row">
                                                <span class="node-label">{{ item.extra?.operator?.showLabel || '节点负责人' }}：</span>
                                                <span class="node-value">{{ itema.operator || '' }}</span>
                                            </div>
                                            <div class="node-row">
                                                <span class="node-label">{{ item.extra?.status?.showLabel || '节点状态' }}：</span>
                                                <span class="node-value">{{ itema.status || '' }}</span>
                                            </div>
                                            <div class="node-row">
                                                <span class="node-label">{{ item.extra?.duration?.showLabel || '节点耗时' }}：</span>
                                                <span class="node-value">{{ itema.duration || '' }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="node-single">
                                        <div class="node-row">
                                            <span class="node-label">{{ item.extra?.operator?.showLabel || '节点负责人' }}：</span>
                                            <span class="node-value">{{ datas[item.column]?.formatValue.operator || '' }}</span>
                                        </div>
                                        <div class="node-row">
                                            <span class="node-label">{{ item.extra?.status?.showLabel || '节点状态' }}：</span>
                                            <span class="node-value">{{ datas[item.column]?.formatValue.status || '' }}</span>
                                        </div>
                                        <div class="node-row">
                                            <span class="node-label">{{ item.extra?.duration?.showLabel || '节点耗时' }}：</span>
                                            <span class="node-value">{{ datas[item.column]?.formatValue.duration || '' }}</span>
                                        </div>
                                    </div>
                                </template>
                            </span>
                            <span v-if="item.type == 'SUBFORM' || item.type == 'RELATION_DATA'">
                                <div v-for="(itema, index) in datas[item.column]?.formatValue" :key="index + 'i'">
                                    <template v-if="Array.isArray(item.extra?.children)">
                                        <template v-for="(itemas, indexs) in item.extra.children" :key="indexs + 'isi'">
                                            <div class="left-box" v-if="itemas && !isFileFieldType(itemas.type || itemas.componentType) && (itemas.type || itemas.componentType) !== 'SIGNATURE' && itema?.[itemas.column || itemas.fieldCode]">
                                                {{ getSubFormDisplayValue(itemas, itema) }},
                                            </div>
                                            <div class="left-box" v-if="itemas && (itemas.type || itemas.componentType) == 'SIGNATURE' && itema?.[itemas.column || itemas.fieldCode]">
                                                {{ itemas.showLabel }} :
                                                <img
                                                    class="preview-img"
                                                    :src="win.api?.dowUrl + itema[itemas.column || itemas.fieldCode] + '&token=' + token"
                                                    alt=""
                                                    @click="handleSignaturePreview(itema[itemas.column || itemas.fieldCode])"
                                                >,
                                            </div>
                                            <div class="left-box" v-if="itemas && isFileFieldType(itemas.type || itemas.componentType) && getFileList(itema?.[itemas.column || itemas.fieldCode]).length">
                                                {{ itemas.showLabel }} :
                                                <a class="span" @click="handlePreview(itemass)"
                                                    v-for="(itemass, index1s) in getFileList(itema[itemas.column || itemas.fieldCode])"
                                                    :key="index1s + 'iii'"> {{ itemass.fileName }}
                                                </a>,
                                            </div>
                                        </template>
                                    </template>
                                </div>
                            </span>
                            <span class="itema" v-if="isFileFieldType(item.type) && getFileList(datas[item.column]?.formatValue).length">
                                <a class="span" @click="handlePreview(itema)"
                                    v-for="(itema, index1) in getFileList(datas[item.column]?.formatValue)"
                                    :key="index1 + 'i'"> {{ itema.fileName }}
                                </a>
                            </span>
                            <span class="itema" v-if="item.type == 'SIGNATURE' && datas[item.column]?.formatValue">
                                <img
                                    class="preview-img"
                                    :src="win.api?.dowUrl + datas[item.column]?.formatValue + '&token=' + token"
                                    alt=""
                                    @click="handleSignaturePreview(datas[item.column]?.formatValue)"
                                >
                            </span>
                        </div>
                    </a-descriptions-item>
                </a-descriptions>

            </div>
        </a-drawer>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { isFileFieldType, parseFileFieldValue } from '@/utils/fileFieldValue'
import { openFilePreview } from '@/utils/filePreview'
import { getReportDetailDisplayValue } from '@/utils/reportDetailValue'

// 声明全局变量以解决 TS 报错
const win = window as any
const token = localStorage.getItem('wornbench_token') || ''

const dialogVisible = ref(false)
const form = ref({})
const topList = ref<any[]>([])
const datas = ref<any>({})

const getFileList = (val: unknown) => parseFileFieldValue(val)

const showItem = (topListData: any[], datasData: any) => {
    dialogVisible.value = true
    topList.value = topListData
    datas.value = datasData
}

const next = () => {
    dialogVisible.value = false
}
const handlePreview = (item: any) => {
    openFilePreview(item)
}

const handleSignaturePreview = (fileId: string) => {
    openFilePreview({ path: fileId, fileName: 'signature.png', type: 1 })
}

// 处理选项字段映射回显
const getDisplayValue = (item: any) => {
    const val = getReportDetailDisplayValue(datas.value[item.column])
    if (val === '') return ''
    
    // 处理选项字段映射（如流程状态、数据来源、删除状态等）
    if (item.column == 'instance_state' || item.column == 'input_source' || item.column == 'delete_state') {
        if (item.extra?.options && Array.isArray(item.extra.options)) {
            const matched = item.extra.options.find((opt: any) => opt.value == val)
            if (matched) {
                return matched.label
            }
        }
    }
    
    return val
}

// 处理子表单选项字段映射回显
const getSubFormDisplayValue = (itemas: any, itema: any) => {
    let val = itema[itemas.column || itemas.fieldCode]
    if (val === undefined || val === null) return ''
    
    // 处理选项字段映射
    const column = itemas.column || itemas.fieldCode
    if (column == 'instance_state' || column == 'input_source' || column == 'delete_state') {
        if (itemas.extra?.options && Array.isArray(itemas.extra.options)) {
            const matched = itemas.extra.options.find((opt: any) => opt.value == val)
            if (matched) {
                return `${itemas.showLabel} : ${matched.label}`
            }
        }
    }
    
    return `${itemas.showLabel} : ${val}`
}

defineExpose({
    showItem
})
</script>
<style lang="scss" scoped>
:deep(.el-dialog) {
    border-radius: 10px;
}

:deep(.el-form-item) {
    margin-bottom: 18px;
}

:deep(.el-dialog__body) {
    padding: 15px 20px 20px;
}

.dialog-footer :deep() {
    .el-button--small {
        padding: 9px 30px;
    }
}

.itema {
    .node-info-container {
        width: 100%;
        
        .node-list {
            .node-item {
                padding: 8px 0;
                border-bottom: 1px dashed #eee;
                
                &:last-child {
                    border-bottom: none;
                }
                
                .node-row {
                    display: flex;
                    margin-bottom: 4px;
                    line-height: 1.6;
                    
                    &:last-child {
                        margin-bottom: 0;
                    }
                    
                    .node-label {
                        color: #666;
                        min-width: 80px;
                        flex-shrink: 0;
                    }
                    
                    .node-value {
                        color: #333;
                        flex: 1;
                        word-break: break-all;
                    }
                }
            }
        }
        
        .node-single {
            .node-row {
                display: flex;
                margin-bottom: 6px;
                line-height: 1.6;
                
                &:last-child {
                    margin-bottom: 0;
                }
                
                .node-label {
                    color: #666;
                    min-width: 80px;
                    flex-shrink: 0;
                }
                
                .node-value {
                    color: #333;
                    flex: 1;
                    word-break: break-all;
                }
            }
        }
    }
    
    img {
        height: 62px
    }

    .preview-img {
        cursor: pointer;
    }

    .span {
        cursor: pointer;
        color: #165DFF;

        &:hover {
            text-decoration: underline;
        }
    }
}
</style>
