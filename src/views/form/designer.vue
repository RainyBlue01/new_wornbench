<template>
    <div class="form-designer-main designer">
        <jsonEditer :formConfs="formConfs" ref="jsonRefEditer" />
        <seeModel :formConfs="formConfs" ref="seeModelRef" />
        <div class="form-designer-canvas-wrap center" @click.self="handleClick()">
            <div class="form-designer-canvas-inner center-item">
                <div class="form-designer-canvas-paper center-body"
                    :style="{ width: formConfs.widthType == 'fixed' ? formConfs.width + 'px' : formConfs.width + '%', maxWidth: '100%' }">
                    <a-form :model="form" ref="forms"
                        :layout="formConfs.titleStyle !== 'hide' ? formConfs.titleStyle : 'vertical'" class="forms"
                        v-bind="formConfs" @click.self="handleClick()" @submit="handleSubmit">
                        <div class="form-designer-drawing-wrap">
                            <draggable class="drawing-board" :sort="true" draggable=".items" :list="formConfs.formList"
                                :animation="340" @add="add" group="componentsGroup" @click.self="handleClick()">
                                <div class="items" v-for="(item, index) in formConfs.formList" :key="index"
                                    :id="item.type == 'ROW' || item.type == 'SUBFORM' || item.type == 'TITLE' || item.type == 'JSON_SCHEMA' || item.type == 'SPLIT_LINE' || item.type == 'HR' || item.type == 'BUTTON_CONNECTOR' ? 'other' : item.type == 'ROW' ? 'others' : ''">
                                    <showItem :deptList="deptLists" :showEdit="true" :activeForm="activeForm"
                                        :newIndex="index" :list="formConfs.formList" :comDes="item"
                                        :formConfs="formConfs" />
                                </div>
                            </draggable>
                            <emptyBox v-if="!formConfs.formList?.length" embedded desc="从左侧拖拽组件到此处"
                                class="form-designer-canvas-empty" />
                        </div>
                    </a-form>
                </div>
            </div>
        </div>
        <right :activeForm="activeForm" :deptList="deptLists" :formList="formConfs.formList" :formConfs="formConfs" />

        <div class="form-designer-bottom-bar bottom-bar">
            <div class="form-designer-status-info status-info">
                <span><i class="fas fa-cubes" aria-hidden="true" /> 已添加 <strong class="status-count">{{
                    formConfs.formList?.length || 0 }}</strong> 个组件</span>
                <span><i class="fas fa-clock" aria-hidden="true" /> 上次保存：<strong class="status-save">{{ lastSaveLabel
                        }}</strong></span>
                <span><i class="fas fa-check-circle" aria-hidden="true" /> 状态：<strong
                        class="status-editing">编辑中</strong></span>
            </div>
            <div class="form-designer-status-actions status-actions">
                <button type="button" class="btn-bar btn-bar--ghost" title="编辑" @click="openJsonEditer">
                    <i data-v-3a522a8f="" class="fas fa-pen"></i> 编辑
                </button>
                <button type="button" class="btn-bar btn-bar--ghost" title="重做" @click="handleRedo">
                    <i class="fas fa-redo" aria-hidden="true" />重做
                </button>
                <button type="button" class="btn-bar btn-bar--ghost" :disabled="loading" @click="handleModalOk">
                    <i class="fas fa-save" aria-hidden="true" />保存
                </button>
                <button type="button" class="btn-bar btn-bar--ghost" @click="openPreview">
                    <i class="fas fa-eye" aria-hidden="true" />预览
                </button>
                <button v-if="route.query.type === '2'" type="button" class="btn-bar btn-bar--primary"
                    :disabled="loading" @click="nexStop">
                    下一步：流程设计
                </button>
                <button v-if="route.query.type === '1'" type="button" class="btn-bar btn-bar--primary"
                    :disabled="loading" @click="goPublishApp">
                    下一步：发布应用
                </button>
            </div>
        </div>

        <!-- 保存确认弹窗 -->
        <a-modal v-model:visible="showSaveModal" title="提示" title-align="start" hide-footer class="save-confirm-modal"
            :mask-closable="true" :unmount-on-close="true">
            <div class="modal-content">
                <div class="modal-icon">
                    <svg viewBox="0 0 24 24" width="48" height="48">
                        <circle cx="12" cy="12" r="10" fill="rgba(var(--primary-6), 0.1)" />
                        <path
                            d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-4v2h2v-2h-2zm0-8v6h2V8h-2z"
                            fill="rgb(var(--primary-6))" />
                    </svg>
                </div>
                <div class="modal-text">确定要保存表单设计吗？</div>
            </div>
            <template #footer>
                <div class="modal-footer">
                    <a-button class="btn-next" :disabled="loading" @click="handleModalCancel">
                        下一步
                    </a-button>
                    <a-button class="btn-save" type="primary" :loading="loading" @click="handleModalOk">
                        保存
                    </a-button>
                </div>
            </template>
        </a-modal>

        <!-- 导入弹窗 -->
        <a-modal v-model:visible="dialogFormVisible" title="导入" title-align="start" :footer="false"
            class="import-confirm-modal" :mask-closable="true" :unmount-on-close="true">
            <div class="import-content">
                <div class="import-step">
                    <div class="step-left">
                        <div class="step-num">1</div>
                        <div class="step-line"></div>
                    </div>
                    <div class="step-right">
                        <div class="step-title">获取导入模板</div>
                        <div class="step-des">请按照模板要求规范填写相关项目</div>
                        <div class="step-actions">
                            <div class="action-btn" @click="uploadTemp(1)">
                                <icon-download />
                                下载导入模板.xlsx
                            </div>
                            <div class="action-btn" @click="uploadTemp(2)">
                                <icon-download />
                                下载导入模板.docx
                            </div>
                        </div>
                    </div>
                </div>
                <div class="import-step">
                    <div class="step-left">
                        <div class="step-num">2</div>
                    </div>
                    <div class="step-right">
                        <div class="step-title">导入数据</div>
                        <div class="step-des">为保障顺利上传，请上传xlsx格式或者docx格式的文件</div>
                        <a-upload :auto-upload="false" :show-file-list="false" :before-upload="beforeAvatarUpload"
                            @change="importTemp" accept=".xlsx,.docx" class="custom-upload">
                            <div class="upload-area">
                                <div class="upload-text-c">点击上传</div>
                                <div class="upload-divider">/</div>
                                <div class="upload-text-d">拖拽到此区域</div>
                            </div>
                        </a-upload>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="modal-footer">
                    <a-button class="btn-cancel" @click="dialogFormVisible = false">
                        取 消
                    </a-button>
                    <a-button class="btn-ok" type="primary" @click="dialogFormVisible = false">
                        确 定
                    </a-button>
                </div>
            </template>
        </a-modal>

    </div>
</template>
<script lang="ts" setup>
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import jsonEditer from './components/jsonEditer.vue'
import { designApp, formDesign } from '@/api/form/index'
import { ref, provide, watch, computed } from 'vue';
import { generate } from '@/utils/id';
import { getFlowById, setFlowById, setProps as syncFlowFieldControl } from '@/utils/flowPath.ts'
import { formConf } from '@/data/form'
import { getDeptTree } from '@/api/common/index'
import { useRoute, useRouter } from 'vue-router'
import { getAppReturnRoute } from '@/views/application/composables/useAppFormNav'
import { setProps, getProps, getFormById, setFormById, toBackendDateFormat, setDefaultValue } from '@/utils/form'
import right from './right.vue';
import seeModel from './components/seeModel.vue';
import emptyBox from '@/components/emptyBox/emptyBox.vue';
import { nanoid } from 'nanoid';
import * as XLSX from 'xlsx'
import mammoth from "mammoth";
import { Message, Modal } from '@arco-design/web-vue';
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const showSaveModal = ref(false)
const dialogFormVisible = ref(false)
const seeModelRef = ref<InstanceType<typeof seeModel> | null>(null)
const jsonRefEditer = ref<InstanceType<typeof jsonEditer> | null>(null)
const lastSaveLabel = ref('未保存')
const form = ref({})
let formConfig = getFormById(route.query.id)

// setDefaultValue(formConfig.formList, form.value)
const formConfs = ref(formConfig.formList && Array.isArray(formConfig.formList) && formConfig.formList.length > 0 ? formConfig : { name: formConfig.name, category: formConfig.category, ...JSON.parse(JSON.stringify(formConf)) })
formConfs.value.useTempProps = true
const initialHadFormData = !!(formConfig.formList && formConfig.formList.length > 0)
const hasSavedInSession = ref(false)
const lastSavedSnapshot = ref(JSON.parse(JSON.stringify(formConfs.value)))
const isNewForm = computed(() => !initialHadFormData && !hasSavedInSession.value)


const forms = ref()
const deptLists = ref([])
const activeForm = ref({ id: '' })
activeForm.value = formConfig.formList && formConfig.formList.length > 0 ? formConfig.formList[0] : { id: '' }
const setFormConfs = (item: any) => {
    // console.log(item)
    formConfs.value = item
    setFormById(formConfs.value, route.query.id)
}
const syncFlowConfigWithForm = () => {
    const latestFlowConfig = getFlowById(route.query.id)
    if (!latestFlowConfig?.id) {
        return
    }
    syncFlowFieldControl(latestFlowConfig, formConfs.value.formList)
    setFlowById(latestFlowConfig, route.query.id)
}
const getPropsItem = (id: string, propsItem: any) => {
    return getProps(id, formConfs.value.formList, propsItem)
}
const setPropsItem = (id: string, propsItem: any, data: any) => {
    setProps(id, formConfs.value.formList, propsItem, data)
}
watch(
    formConfs.value,
    (newVal: any, oldVal: any) => {
        setFormById(formConfs.value, route.query.id)
        syncFlowConfigWithForm()
    },
    { immediate: true }
);
const getData = () => {
    getDeptTree().then(res => {
        deptLists.value = res
    })
}
getData()
const openPreview = () => {
    seeModelRef.value?.openPreviewDrawer()
}

const updateSavedSnapshot = () => {
    lastSavedSnapshot.value = JSON.parse(JSON.stringify(formConfs.value))
    hasSavedInSession.value = true
}

const applyFormConfs = (config: any) => {
    formConfs.value = JSON.parse(JSON.stringify(config))
    setFormById(formConfs.value, route.query.id)
    activeForm.value = formConfs.value.formList?.[0] || { id: '' }
}
const openJsonEditer = () => {
    jsonRefEditer.value?.openEditor()
}

const buildEmptyFormConfs = () => ({
    ...JSON.parse(JSON.stringify(formConf)),
    name: formConfs.value.name,
    category: formConfs.value.category,
    id: formConfs.value.id,
    processId: formConfs.value.processId,
    formList: [],
    formLogics: [],
})

const handleRedo = () => {
    if (isNewForm.value) {
        if (!formConfs.value.formList?.length) {
            Message.info('表单已是空白状态')
            return
        }
        Modal.confirm({
            title: '确认清空',
            titleAlign: 'start',
            content: '确定要清空当前表单吗？清空后所有已添加的组件将被移除。',
            okText: '确定清空',
            cancelText: '取消',
            onOk: () => {
                applyFormConfs(buildEmptyFormConfs())
                Message.success('表单已清空')
            },
        })
        return
    }
    Modal.confirm({
        title: '确认重做',
        titleAlign: 'start',
        content: '确定要已恢复至上次保存的状态？重做后新添加的组件将被移除。',
        okText: '确定重做',
        cancelText: '取消',
        onOk: () => {
            applyFormConfs(lastSavedSnapshot.value)
            Message.success('重做成功')
        },
    })


}

const pickForwardQuery = () => {
    const q: Record<string, string> = {
        id: route.query.id as string,
        type: route.query.type as string,
    }
    if (route.query.from) {
        q.from = route.query.from as string
    }
    return q
}

const persistFormDesign = () => {
    const formConfig = JSON.parse(JSON.stringify(formConfs.value))
    setBottom(formConfig.formList)
    // console.log('保存的表单配置:', formConfig)
    const prams: Record<string, string> = {
        formConfig: JSON.stringify(formConfig),
    }
    if (route.query.type === '2') {
        prams.processId = formConfs.value.processId
        return formDesign(prams, route.query.id)
    }
    return designApp(prams, route.query.id)
}

const handleBottomSave = () => {
    if (route.query.type === '1' || route.query.type === '2') {
        saveData()
        return
    }
    nexStop()
}

const saveData = () => {
    showSaveModal.value = true
}

const handleModalOk = () => {
    if (!formConfs.value.formList || formConfs.value.formList.length === 0) {
        Message.warning('请设置应用后再保存')
        return
    }
    loading.value = true
    persistFormDesign()
        .then(() => {
            showSaveModal.value = false
            lastSaveLabel.value = new Date().toLocaleString('zh-CN')
            updateSavedSnapshot()
            Message.success('保存成功')
            // router.push(getAppReturnRoute(route))
        })
        .finally(() => {
            loading.value = false
        })
}
const setBottom = (formList: any) => {
    formList.map((v: any) => {
        if (v.type == 'DATE_INTERVAL' || v.type == 'DATE') {
            v.props.format = toBackendDateFormat(v.props.format)
        } else if (v.type == 'RELATION_DATA') {
            v.props.options = []
        }
        v.showItem = false
        if (v.children && v.children.length > 0) {
            setBottom(v.children)
        }
        if (Array.isArray(v.list)) {
            v.list.forEach((row: any[]) => setBottom(row))
        }
    })
}

const handleModalCancel = () => {
    showSaveModal.value = false
    if (route.query.type === '1') {
        goPublishApp()
        return
    }
    nexStop()
}

const goPublishApp = () => {
    if (!formConfs.value.formList || formConfs.value.formList.length === 0) {
        Message.warning('请设置应用后再保存')
        return
    }
    loading.value = true
    persistFormDesign()
        .then(() => {
            lastSaveLabel.value = new Date().toLocaleString('zh-CN')
            updateSavedSnapshot()
            router.push({
                path: '/publishApp',
                query: pickForwardQuery(),
            })
        })
        .finally(() => {
            loading.value = false
        })
}

const nexStop = () => {
    if (!formConfs.value.formList || formConfs.value.formList.length === 0) {
        Message.warning('请设置应用后再保存')
        return
    }
    if (route.query.type === '1') {
        goPublishApp()
        return
    }
    loading.value = false
    router.push({
        name: 'flowPath',
        query: pickForwardQuery(),
    })
}
const copyItem = (val: any, list: any) => {
    let item = val.id.split('.')
    let clone = JSON.parse(JSON.stringify(val))
    if (item.length !== 1) {
        clone.id = item[0] + '.' + generate()
        clone.props.field = clone.id
    } else {
        clone.id = generate()
        clone.props.field = clone.id
    }

    if (Array.isArray(clone.children) && clone.children.length > 0) {
        setId(clone.children, clone)
    }
    if (Array.isArray(clone.props.options) && clone.props.options.length > 0) {
        clone.props.options.map((v: { value: any; }) => {
            v.value = nanoid(9)
        })
    }
    if (isFunctionField(clone)) {
        clearPropsValueDeep(clone)
    }
    list.push(clone)
    handleClick(clone)
}
const setId = (list: any, item?: any) => {
    list.map((v: { id: string; props: { field: any; options: any[]; }; children: string | any[]; }) => {
        if (item?.type == 'SUBFORM') {
            v.id = item.id + '.' + generate()
            v.props.field = v.id
        } else {
            v.id = generate()
            v.props.field = v.id
        }

        if (Array.isArray(v.props.options) && v.props.options.length > 0) {
            v.props.options.map((v: { value: any; }) => {
                v.value = nanoid(9)
            })
        }
        if (Array.isArray(v.children) && v.children.length > 0) {
            setId(v.children, item)
        }
    })
}
const deleteItem = (index: any, list: any) => {
    list.splice(index, 1)
    handleClick({})
}
const updataInput = (val: any) => {
    activeForm.value.method.input = val
}
const submit = () => {
    forms.value.validate((error: any) => {
        if (!error) {
        } else {
            // console.log(error)
        }
    });
}
const updataDes = (val: any) => {
    activeForm.value.props.desc = val
}
const add = (evt?: { newIndex?: number }) => {
    setData(formConfs.value.formList)
    if (typeof evt?.newIndex === 'number') {
        const insertedItem = formConfs.value.formList?.[evt.newIndex]
        if (isFunctionField(insertedItem)) {
            clearPropsValueDeep(insertedItem)
        }
    }
    // let formList = JSON.parse(JSON.stringify(formConfs.value.formList))
    // formConfs.value.formList = ''
    // setTimeout(() => {
    //     formConfs.value.formList = formList
    // })
}
const setData = (list: any) => {
    list.map((v: any) => {
        let item = v.id.split('.')
        if (item.length > 1) {
            v.id = item[1]
            v.props.field = v.id
        }
        if (v.children && v.type !== 'SUBFORM') {
            setData(v.children)
        }

    })
}
const handleClick = (val: any) => {
    if (val && val.id == activeForm?.value.id) {
        return
    }
    if (val) {
        activeForm.value = val ? val : { id: '' }
    } else {
        activeForm.value = { id: '' }
    }
}
const handleSubmit = () => {

}
const isFunctionField = (item: any) => {
    return item?.props?.label === '函数' || item?.props?.expressionLabel === '函数'
}
const clearPropsValueDeep = (item: any) => {
    if (!item || typeof item !== 'object') {
        return
    }

    if (item.props && Object.prototype.hasOwnProperty.call(item.props, 'value')) {
        item.props.value = ''
    }

    if (Array.isArray(item.children)) {
        item.children.forEach((child: any) => {
            clearPropsValueDeep(child)
        })
    }

    if (Array.isArray(item.list)) {
        item.list.forEach((childList: any) => {
            if (Array.isArray(childList)) {
                childList.forEach((child: any) => {
                    clearPropsValueDeep(child)
                })
                return
            }
            clearPropsValueDeep(childList)
        })
    }
}
formConfs.value.formList.map(v => {
    clearPropsValueDeep(v)
})

const setForms = (val: any) => {
    if (!val) {
        return
    }
    if (!formConfs.value.formList) {
        formConfs.value.formList = []
    }
    if (isFunctionField(val)) {
        clearPropsValueDeep(val)
    }
    formConfs.value.formList.push(val)
    handleClick(val)
}

defineExpose({
    setForms,
})
const drawingItemon = (index: any, list: any, item: any) => {
    [list[index - 1], list[index]] = [list[index], list[index - 1]]
    handleClick(item)
}
const drawingItemup = (index: any, list: any, item: any) => {
    [list[index], list[index + 1]] = [list[index + 1], list[index]]
    handleClick(item)
}
const filterData = () => {
    // console.log(111)
}

// 导入功能实现
const handUpload = () => {
    dialogFormVisible.value = true
}

const uploadTemp = (val: number) => {
    const fileUrl = val == 1 ? '/wornbench/form.xlsx' : '/wornbench/form.docx';
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = val == 1 ? '导入模板.xlsx' : '导入模板.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const beforeAvatarUpload = (file: any) => {
    const FileExt = file.name.replace(/.+\./, "");
    const isAllowed = ["docx", "xlsx"].indexOf(FileExt.toLowerCase()) >= 0;
    if (!isAllowed) {
        Message.error("只能上传xlsx或者docx格式的文件");
    }
    return isAllowed; // 返回 true 允许继续处理，false 阻止
}

const importTemp = async (fileList: any[]) => {
    // Arco Design 的 @change 回调第一个参数是 fileList 数组
    if (!fileList || !Array.isArray(fileList) || fileList.length === 0) return;

    const fileItem = fileList[fileList.length - 1];
    const originFile = fileItem?.originFile || fileItem?.file;

    if (!originFile) {
        Message.error('文件读取失败，请重试');
        return;
    }

    const fileName = fileItem.name || originFile.name;
    const FileExt = fileName.replace(/.+\./, "").toLowerCase();

    if (!formConfs.value.formList) {
        formConfs.value.formList = [];
    }

    if (FileExt === 'xlsx') {
        const fileReader = new FileReader();
        fileReader.onload = ev => {
            try {
                const data = ev.target?.result;
                // 使用 ArrayBuffer 读取，兼容性更好
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = Object.keys(workbook.Sheets)[0];
                const worksheet = workbook.Sheets[sheetName];
                // 使用 defval 确保空单元格也有值
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

                console.log('Excel 解析数据:', jsonData);

                if (!jsonData || jsonData.length === 0) {
                    Message.error('Excel文件内容为空');
                    return;
                }

                // 遍历所有行（包括表头行），将每一行的每一列都作为独立的表单项
                let count = 0;
                jsonData.forEach((row: any[], rowIndex: number) => {
                    if (!row) return;
                    row.forEach((cell: any, colIndex: number) => {
                        // 只处理非空单元格
                        if (cell !== undefined && cell !== null && String(cell).trim() !== '') {
                            const item = {
                                id: generate(),
                                type: 'INPUT',
                                title: String(cell).trim(),
                                component: 'qInput',
                                props: {
                                    field: generate(),
                                    label: String(cell).trim(),
                                    placeholder: '请输入',
                                    required: false,
                                    desc: '',
                                    defaultValue: '',
                                    maxLength: 20,
                                    allowClear: true,
                                    showWordLimit: true,
                                    size: 'medium',
                                    disabled: false,
                                    readonly: false,
                                    visible: true
                                },
                                method: { input: '' },
                                attribute: [
                                    {
                                        field: 'type',
                                        label: '组件类型',
                                        type: 'type',
                                    },
                                    {
                                        field: 'title',
                                        label: '标题',
                                        type: 'input',
                                    },
                                    {
                                        field: 'desc',
                                        label: '描述',
                                        type: 'wangEditor',
                                    },
                                    {
                                        field: 'required',
                                        label: '必填验证',
                                        type: 'switch',
                                    },
                                    {
                                        field: 'placeholder',
                                        label: '提示',
                                        type: 'input',
                                    },
                                    {
                                        field: 'showWordLimit',
                                        label: '字数限制',
                                        type: 'numSwitch',
                                    },
                                    {
                                        field: 'defaultValue',
                                        label: '默认值',
                                        component: 'a-textarea',
                                        type: 'component',
                                    },
                                    {
                                        field: 'props.linkage',
                                        label: '数据联动',
                                        type: 'linkage',
                                    }
                                ],
                                showItem: false
                            };
                            formConfs.value.formList.push(item);
                            count++;
                        }
                    });
                });

                console.log('生成的 formList:', formConfs.value.formList);

                if (count > 0) {
                    Message.success(`成功导入 ${count} 个字段`);
                    dialogFormVisible.value = false;
                } else {
                    Message.error('未找到有效数据');
                }
            } catch (e) {
                console.error('Excel 解析错误:', e);
                Message.error('解析Excel文件失败，请检查文件格式');
            }
        };
        // 使用 readAsArrayBuffer 替代 readAsBinaryString
        fileReader.readAsArrayBuffer(originFile);
    } else if (FileExt === 'docx') {
        try {
            const result = await mammoth.extractRawText({ arrayBuffer: originFile });
            const text = result.value || '';
            // 按换行符分割，保留所有有效文本行（长度>0）
            const lines = text.split(/[\n\r]+/).filter(line => line.trim().length > 0);

            console.log('Word 解析文本行数:', lines.length);

            if (lines.length === 0) {
                Message.error('Word文件中未找到有效文本');
                return;
            }

            lines.forEach(line => {
                const item = {
                    id: generate(),
                    type: 'INPUT',
                    title: line.trim(),
                    component: 'qInput',
                    props: {
                        field: generate(),
                        label: line.trim(),
                        placeholder: '请输入',
                        required: false,
                        desc: '',
                        defaultValue: '',
                        maxLength: 20,
                        allowClear: true,
                        showWordLimit: true,
                        size: 'medium',
                        disabled: false,
                        readonly: false,
                        visible: true
                    },
                    method: { input: '' },
                    attribute: [
                        {
                            field: 'type',
                            label: '组件类型',
                            type: 'type',
                        },
                        {
                            field: 'title',
                            label: '标题',
                            type: 'input',
                        },
                        {
                            field: 'desc',
                            label: '描述',
                            type: 'wangEditor',
                        },
                        {
                            field: 'required',
                            label: '必填验证',
                            type: 'switch',
                        },
                        {
                            field: 'placeholder',
                            label: '提示',
                            type: 'input',
                        },
                        {
                            field: 'showWordLimit',
                            label: '字数限制',
                            type: 'numSwitch',
                        },
                        {
                            field: 'defaultValue',
                            label: '默认值',
                            component: 'a-textarea',
                            type: 'component',
                        },
                        {
                            field: 'props.linkage',
                            label: '数据联动',
                            type: 'linkage',
                        }
                    ],
                    showItem: false
                };
                formConfs.value.formList.push(item);
            });

            console.log('生成的 formList:', formConfs.value.formList);
            dialogFormVisible.value = false;
        } catch (e) {
            console.error(e);
            Message.error('解析Word文件失败，请检查文件格式');
        }
    } else {
        Message.error("只能上传xlsx或者docx格式的文件");
    }
}

provide("provideDesigner", { setForms, setFormConfs, handleClick, copyItem, deleteItem, drawingItemon, drawingItemup, updataInput, updataDes, getPropsItem, setPropsItem, filterData, handUpload });
</script>
<style lang="scss" scoped>
@use "@/styles/form-designer.scss";
@use "../../styles/textColor.scss" as textColor;

.designer {
    flex: 1;
    min-width: 0;
    display: flex;
    overflow: hidden;
    position: relative;
    height: 100%;
    background: transparent;

    .center {
        flex: 1;
        min-width: 0;
        max-height: calc(100vh - 160px);

        .drawing-board {
            position: relative;
            overflow: visible;
        }
    }
}

.form-designer-drawing-wrap {
    position: relative;
}

.form-designer-canvas-empty {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
}

.center-body {
    margin: 0 auto;
}

.center-item {
    height: auto;
    overflow: visible;
    padding: 0;
}

.btn-form-items {
    color: #fff;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgb(var(--primary-6));
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    border: none;
    margin-right: 8px;
    cursor: pointer;
    line-height: 1;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
        background: #2563eb;
    }
}

.forms {
    height: 100%;
}

.btns-bottom {
    :deep(.btn-form-draft) {
        border-radius: 8px;
        font-weight: 500;
        padding: 8px 16px;
        font-size: 13px;
        line-height: 1;
        height: auto;
    }
}

.btns-bottom {
    background-color: #fff;
}

.items {
    background-color: #fff;
    position: relative;
    overflow: visible;
}
</style>
<style>
.arco-modal-simple .arco-modal-footer {
    text-align: right;
}

.save-confirm-modal {
    .arco-modal-body {
        padding: 32px 24px 24px;
    }

    .modal-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        .modal-icon {
            margin-bottom: 16px;
            animation: iconBounce 0.6s ease-out;

            svg {
                filter: drop-shadow(0 4px 8px rgba(var(--primary-6), 0.2));
            }
        }

        .modal-text {
            font-size: 16px;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.85);
            line-height: 1.5;
        }
    }

    .modal-footer {
        display: flex;
        justify-content: center;
        gap: 12px;
        padding-top: 8px;

        .btn-next,
        .btn-save {
            padding: 10px 28px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

            &:hover {
                transform: translateY(-1px);
            }

            &:active {
                transform: translateY(0);
            }
        }

        .btn-next {
            background: #f5f5f5;
            border: 1px solid #e8e8e8;
            color: rgba(0, 0, 0, 0.65);

            &:hover {
                background: rgb(var(--primary-1));
                border-color: rgb(var(--primary-3));
                color: rgb(var(--primary-6));
                box-shadow: 0 4px 12px rgba(var(--primary-6), 0.15);
            }
        }

        .btn-save {
            background: linear-gradient(135deg, rgb(var(--primary-6)) 0%, rgb(var(--primary-5)) 100%);
            border: none;
            box-shadow: 0 4px 12px rgba(var(--primary-6), 0.3);

            &:hover {
                box-shadow: 0 6px 20px rgba(var(--primary-6), 0.4);
            }
        }
    }
}

.save-confirm-modal.arco-modal-mask {
    backdrop-filter: blur(4px);
}

.import-confirm-modal {
    .arco-modal-body {
        padding: 24px;
    }

    .import-content {
        .import-step {
            display: flex;
            margin-bottom: 24px;

            &:last-child {
                margin-bottom: 0;
            }

            .step-left {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-right: 16px;

                .step-num {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: rgb(var(--primary-6));
                    color: #fff;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 500;
                }

                .step-line {
                    width: 2px;
                    flex: 1;
                    background: #f2f3f5;
                    margin-top: 8px;
                    min-height: 40px;
                }
            }

            .step-right {
                flex: 1;

                .step-title {
                    font-size: 14px;
                    font-weight: 500;
                    color: rgba(0, 0, 0, 0.85);
                    margin-bottom: 4px;
                }

                .step-des {
                    font-size: 12px;
                    color: rgba(0, 0, 0, 0.45);
                    margin-bottom: 12px;
                }

                .step-actions {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 12px;

                    .action-btn {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        padding: 6px 12px;
                        background: #f7f8fa;
                        border-radius: 4px;
                        font-size: 12px;
                        color: rgb(var(--primary-6));
                        cursor: pointer;
                        transition: all 0.2s;

                        &:hover {
                            background: rgb(var(--primary-1));
                        }
                    }
                }

                .custom-upload {
                    :deep(.arco-upload) {
                        width: 100%;
                    }

                    .upload-area {
                        border: 1px dashed #e5e6eb;
                        border-radius: 4px;
                        background: #f7f8fa;
                        padding: 24px;
                        text-align: center;
                        cursor: pointer;
                        transition: all 0.2s;

                        &:hover {
                            border-color: rgb(var(--primary-6));
                        }

                        .upload-text-c,
                        .upload-text-d {
                            font-size: 14px;
                            color: rgba(0, 0, 0, 0.65);
                        }

                        .upload-divider {
                            font-size: 12px;
                            color: rgba(0, 0, 0, 0.25);
                            margin: 4px 0;
                        }
                    }
                }
            }
        }
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding-top: 16px;
        border-top: 1px solid #f2f3f5;

        .btn-cancel,
        .btn-ok {
            padding: 6px 16px;
            border-radius: 4px;
            font-size: 14px;
        }

        .btn-cancel {
            background: #fff;
            border: 1px solid #e5e6eb;
            color: rgba(0, 0, 0, 0.65);

            &:hover {
                color: rgb(var(--primary-6));
                border-color: rgb(var(--primary-6));
            }
        }

        .btn-ok {
            background: rgb(var(--primary-6));
            border: none;
            color: #fff;

            &:hover {
                background: rgb(var(--primary-7));
            }
        }
    }
}

@keyframes iconBounce {
    0% {
        opacity: 0;
        transform: scale(0.5);
    }

    50% {
        transform: scale(1.1);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}
</style>
