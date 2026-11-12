<template>
  <a-modal class="scene-config-model" title="动作配置" title-align="start" :visible="dialogVisible" :width="700"
    :body-style="{ height: '500px' }" :esc-to-close="false" :mask-closable="false" unmount-on-close
    @cancel="handleClose" @ok="submit" ok-text="确认" cancel-text="取消">
    <div class="dialog-content">
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
        <a-form-item label="动作名称" field="name" required>
          <a-input v-model="form.name" :max-length="24" show-word-limit placeholder="请输入动作名称" allow-clear />
        </a-form-item>

        <a-form-item label="入参变量">
          <div class="input-box">
            <a-table ref="refInputTable" :columns="inputColumns" :data="form.input" :pagination="false" :bordered="true"
              default-expand-all-rows>
              <!-- 变量名称列 -->
              <template #name="{ record, rowIndex }">
                <a-input v-model="record.name" placeholder="请输入变量名称" class="name-input" />
              </template>

              <!-- 变量类型列 -->
              <template #classify="{ record, rowIndex }">
                <a-select :disabled="!!record.parentName" v-model="record.classify" placeholder="请选择"
                  class="type-select" @change="changeInputIsSubForm($event, record)">
                  <a-option value="any">任意</a-option>
                  <a-option value="object">对象</a-option>
                  <a-option value="array">列表</a-option>
                </a-select>
              </template>

              <!-- 默认值/操作列 -->
              <template #valueOrAction="{ record, rowIndex }">
                <template v-if="record.classify === 'any'">
                  <a-input v-model="record.defaultValue" placeholder="请输入默认值" class="value-input" />
                </template>
                <template v-else>
                  <a-button @click="addInputSubForm(record)" style="width: 100%">
                    新增对象入参变量
                  </a-button>
                </template>
              </template>

              <!-- 删除操作列 -->
              <template #operation="{ record }">
                <icon-close-circle class="delete-icon" @click="deleteInputItem(record)" />
              </template>

              <!-- 表格底部的新增按钮 -->
              <template #footer>
                <div style="display: flex; justify-content: flex-start; padding: 8px;">
                  <a-button @click="addInput" class="add-btn">
                    <icon-plus />
                    新增变量
                  </a-button>
                </div>
              </template>
            </a-table>

            <!-- 当没有数据时显示空状态 -->
            <!-- <div v-if="form.input.length === 0" class="empty-state">
              <a-button @click="addInput" class="add-btn">
                <icon-plus />
                新增变量
              </a-button>
              <span style="margin-left: 8px; color: #86909c;">暂无变量，请点击新增</span>
            </div> -->
          </div>
        </a-form-item>

        <a-form-item label="URL">
          <a-row :gutter="10" style="width: 100%">
            <a-col :span="4">
              <a-select v-model="form.execConfig.method" placeholder="Method">
                <a-option v-for="item in methodType" :key="item.value" :value="item.label" :label="item.label" />
              </a-select>
            </a-col>
            <a-col :span="20">
              <a-input v-model="form.execConfig.url" placeholder="请输入URL" allow-clear />
            </a-col>
          </a-row>
        </a-form-item>

        <div class="checkbox-wrapper">
          <a-checkbox v-model="form.enableAuth" :disabled="!existAuthConfig">
            鉴权（如该接口无需鉴权，则无需勾选）
          </a-checkbox>
        </div>

        <a-form-item label="QueryParam">
          <div class="input-box">
            <a-button v-if="form.execConfig.query.length === 0" class="add-btn" @click="addQuery">
              <icon-plus />
            </a-button>
            <template v-else>
              <div class="input-item" v-for="(item, index) in form.execConfig.query" :key="index">
                <a-input v-model="item.name" placeholder="KEY" class="key-input" />
                <a-select v-model="item.type" placeholder="请选择" class="type-select" @change="item.value = ''">
                  <a-option :value="0">固定值</a-option>
                  <a-option :value="1">入参变量</a-option>
                </a-select>
                <a-select v-if="item.type === 1" v-model="item.value" placeholder="请选择" class="value-select">
                  <a-option v-for="(inputItem, idx) in form.input" :key="idx" :value="inputItem.name"
                    :label="inputItem.name" />
                </a-select>
                <a-input v-else v-model="item.value" placeholder="VALUE" class="value-input" />
                <icon-close-circle class="delete-icon" @click="deleteQuery(index)" />
              </div>
              <a-button @click="addQuery" class="add-btn">新增</a-button>
            </template>
          </div>
        </a-form-item>

        <a-form-item label="Header">
          <div class="input-box">
            <a-button v-if="form.execConfig.header.length === 0" class="add-btn" @click="addHeader">
              <icon-plus />
            </a-button>
            <template v-else>
              <div class="input-item" v-for="(item, index) in form.execConfig.header" :key="index">
                <a-input v-model="item.name" placeholder="KEY" class="key-input" />
                <a-select v-model="item.type" placeholder="请选择" class="type-select" @change="item.value = ''">
                  <a-option :value="0">固定值</a-option>
                  <a-option :value="1">入参变量</a-option>
                </a-select>
                <a-select v-if="item.type === 1" v-model="item.value" placeholder="请选择" class="value-select">
                  <a-option v-for="(inputItem, idx) in form.input" :key="idx" :value="inputItem.name"
                    :label="inputItem.name" />
                </a-select>
                <a-input v-else v-model="item.value" placeholder="VALUE" class="value-input" />
                <icon-close-circle class="delete-icon" @click="deleteHeader(index)" />
              </div>
              <a-button @click="addHeader" class="add-btn">新增</a-button>
            </template>
          </div>
        </a-form-item>

        <div class="body-set-wrapper">
          <div class="form-title">
            <div class="title">
              Body
              <a-dropdown @select="handleContentTypeChange">
                <span class="content-type">
                  {{ form.execConfig.contentType }}
                  <icon-down />
                </span>
                <template #content>
                  <a-doption v-for="item in contentType" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </a-doption>
                </template>
              </a-dropdown>
            </div>
            <a-dropdown @select="handleBody">
              <span class="dropdown-link">
                入参变量 <icon-down />
              </span>
              <template #content>
                <a-doption v-for="(item, idx) in form.input" :key="idx" :value="item">
                  {{ item.name }}
                </a-doption>
              </template>
            </a-dropdown>
          </div>

          <template v-if="form.execConfig.contentType === 'application/json'">
            <Codemirror ref="refCodemirror" v-model:value="form.execConfig.requestBody" :options="cmOptions"
              :border="true" :height="120" />
          </template>

          <!-- form-data 类型 -->
          <template v-if="
            form.execConfig.contentType === 'multipart/form-data' ||
            form.execConfig.contentType === 'application/x-www-form-urlencoded'
          ">
            <div class="input-box">
              <a-button v-if="form.execConfig.body.length === 0" class="add-btn" @click="addBody">
                <icon-plus />
              </a-button>
              <template v-else>
                <div class="input-item" v-for="(item, index) in form.execConfig.body" :key="index">
                  <a-input v-model="item.name" placeholder="KEY" class="key-input" />
                  <a-select v-model="item.value" placeholder="请选择" class="value-select">
                    <a-option v-for="(inputItem, idx) in form.input" :key="idx" :value="inputItem.name"
                      :label="inputItem.name" />
                  </a-select>
                  <icon-close-circle class="delete-icon" @click="deleteBody(index)" />
                </div>
                <a-button @click="addBody" class="add-btn">新增</a-button>
              </template>
            </div>
          </template>
        </div>

        <a-form-item>
          开启回调
          <a-switch v-model="form.callback" class="switch" />
        </a-form-item>

        <template v-if="form.callback">
          <a-form-item label="数据结构">
            <a-select v-model="form.output.resolve" placeholder="请选择数据结构">
              <a-option v-for="item in resolveDataType" :key="item.value" :value="item.value" :label="item.label" />
            </a-select>
          </a-form-item>

          <a-form-item label="出参变量/数据解析">
            <div class="input-box">
              <a-table :columns="outputColumns" :data="form.output.outputParams" :pagination="false" :bordered="true"
                default-expand-all-rows>
                <!-- 变量名称列 -->
                <template #name="{ record, rowIndex }">
                  <a-input v-model="record.name" placeholder="变量名称" class="name-input" />
                </template>

                <!-- 等于符号列 -->
                <template #equal="{ record }">
                  <span class="equal-sign">=</span>
                </template>

                <!-- 路径列 -->
                <template #path="{ record, rowIndex }">
                  <a-input v-model="record.path" placeholder="路径" class="path-input" />
                </template>

                <!-- 变量类型列 -->
                <template #classify="{ record, rowIndex }">
                  <a-select :disabled="!!record.parentName" v-model="record.classify" placeholder="请选择"
                    class="type-select" @change="changeOutputIsSubForm($event, record)">
                    <a-option value="any">任意</a-option>
                    <a-option value="object">对象</a-option>
                    <a-option value="array">列表</a-option>
                  </a-select>
                </template>

                <!-- 操作列 -->
                <template #operation="{ record }">
                  <div class="operation-buttons">
                    <template v-if="record.classify !== 'any'">
                      <icon-plus @click="addChildParam(record)" title="添加对象出参" />
                    </template>
                    <icon-close-circle @click="deleteOutputItem(record)" />
                  </div>
                </template>

                <!-- 表格底部的新增按钮 -->
                <template #footer>
                  <div style="display: flex; justify-content: flex-start; padding: 8px;">
                    <a-button @click="addOutputParam" class="add-btn">
                      <icon-plus />
                      新增变量
                    </a-button>
                  </div>
                </template>
              </a-table>

              <!-- 当没有数据时显示空状态 -->
              <!-- <div v-if="!form.output?.outputParams?.length" class="empty-state">
                <a-button @click="addOutputParam" class="add-btn">
                  <icon-plus />
                  新增变量
                </a-button>
                <span style="margin-left: 8px; color: #86909c;">暂无变量，请点击新增</span>
              </div> -->
            </div>
          </a-form-item>
        </template>

      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconCloseCircle, IconDown, IconPlus } from '@arco-design/web-vue/es/icon'
import Codemirror from 'codemirror-editor-vue3'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/idea.css'
import 'codemirror/mode/javascript/javascript.js'
import { addSceneConfig, getSceneConfig, modifySceneConfig } from "@/api/connector";

const existAuthConfig = ref(true)

const emits = defineEmits(['refresh'])

// 状态定义
const dialogVisible = ref(false)
const formRef = ref(null)
const refCodemirror = ref(null)

const connectorId = ref()

const refInputTable = ref()

const inputColumns = [
  {
    title: '变量名称',
    dataIndex: 'name',
    slotName: 'name',
    width: 200
  },
  {
    title: '变量类型',
    dataIndex: 'classify',
    slotName: 'classify',
    width: 120
  },
  {
    title: '默认值/操作',
    dataIndex: 'valueOrAction',
    slotName: 'valueOrAction',
    width: 160
  },
  {
    title: '操作',
    dataIndex: 'operation',
    slotName: 'operation',
    width: 60
  }
]

const outputColumns = [
  {
    title: '变量名称',
    dataIndex: 'name',
    slotName: 'name',
    width: 160
  },
  {
    title: '',
    dataIndex: 'equal',
    slotName: 'equal',
    width: 50
  },
  {
    title: '路径',
    dataIndex: 'path',
    slotName: 'path',
    width: 200
  },
  {
    title: '变量类型',
    dataIndex: 'classify',
    slotName: 'classify',
    width: 120
  },
  {
    title: '操作',
    dataIndex: 'operation',
    slotName: 'operation',
    width: 80
  }
]

// 表单数据
let form = reactive({
  connectorId: '',
  id: null,
  name: '',
  input: [],
  execConfig: {
    url: '',
    query: [],
    header: [],
    method: 'POST',
    contentType: 'application/json',
    requestBody: '{}',
    body: []
  },
  output: {
    resolve: 'json',
    outputParams: [],
  },
  callback: false,
  enableAuth: false
})

const rules = {
  name: [{ required: true, message: '请输入动作名称' }]
}

const resolveDataType = [
  { label: 'JSON', value: 'json' },
  { label: 'XML', value: 'xml' }
]

const methodType = [
  { label: 'POST', value: '1' },
  { label: 'GET', value: '2' },
  { label: 'PUT', value: '3' },
  { label: 'DELETE', value: '4' },
  { label: 'OPTIONS', value: '5' }
]

const contentType = [
  { label: 'application/json', value: 'application/json' },
  { label: 'application/x-www-form-urlencoded', value: 'application/x-www-form-urlencoded' },
  { label: 'multipart/form-data', value: 'multipart/form-data' }
]

// CodeMirror 配置
const cmOptions = {
  tabSize: 4,
  mode: 'application/json',
  theme: 'idea',
  lineNumbers: true,
  line: false,
  viewportMargin: Infinity,
  highlightDifferences: true,
  autofocus: false,
  indentUnit: 2,
  smartIndent: true,
  readOnly: false,
  showCursorWhenSelecting: true,
  firstLineNumber: 1
}

// 处理ContentType切换
const handleContentTypeChange = (val) => {
  form.execConfig.contentType = val
  if (!form.execConfig.body) {
    form.execConfig.body = []
  }
  nextTick(() => {
  })
}

// 插入入参变量到JSON编辑器
const handleBody = (val: any) => {
  // 获取编辑器实例
  const cm = refCodemirror.value.cminstance
  if (cm) {
    const pos = cm.getCursor()
    const bookMark = `"${val.name}"`
    cm.replaceRange(bookMark, pos)
  }
}

// 添加入参变量
const addInput = () => {
  form.input.push({
    name: '',
    classify: 'any',
    defaultValue: ''
  })
}

const findInputParent = (record: any) => {
  if (record.parentName) {
    const parent = form.input.find((item) => item.name === record.parentName)
    if (parent) return parent
  }
  return form.input.find((item) => item.children?.includes(record)) || null
}

// 删除入参变量（支持顶层与子项）
const deleteInputItem = (record: any) => {
  if (record.parentName || findInputParent(record)) {
    const parent = findInputParent(record)
    if (parent?.children) {
      const childIndex = parent.children.findIndex((item) => item === record)
      if (childIndex > -1) {
        parent.children.splice(childIndex, 1)
      }
    }
    return
  }

  const index = form.input.findIndex((item) => item === record)
  if (index > -1) {
    form.input.splice(index, 1)
  }
}

const changeInputIsSubForm = (val: any, record: any) => {
  if (!val) {
    delete record.children
  }
}

const changeOutputIsSubForm = (val: any, record: any) => {
  if (!val) {
    delete record.children
  }
}

const addInputSubForm = (item: any) => {
  if (!item.children || item.children.length === 0) {
    item.children = []
  }
  item.children.push({
    name: '',
    defaultValue: '',
    classify: 'any',
    parentName: item.name,
  })
}


// 添加Query参数
const addQuery = () => {
  form.execConfig.query.push({
    name: '',
    type: '',
    value: '',
  })
}

// 删除Query参数
const deleteQuery = (index: number) => {
  form.execConfig.query.splice(index, 1)
}

// 添加Body参数
const addBody = () => {
  form.execConfig.body.push({
    name: '',
    value: ''
  })
}

// 删除Body参数
const deleteBody = (index: number) => {
  form.execConfig.body.splice(index, 1)
}

// 添加Header参数
const addHeader = () => {
  form.execConfig.header.push({
    name: '',
    type: '',
    value: '',
  })
}

// 删除Header参数
const deleteHeader = (index) => {
  form.execConfig.header.splice(index, 1)
}

// 添加输出参数解析
const addOutputParam = () => {
  if (!form.output.outputParams) {
    form.output.outputParams = []
  }
  form.output.outputParams.push({
    name: '',
    path: '',
    classify: 'any',
  })
}

const findOutputParent = (record: any) => {
  if (record.parentName) {
    const parent = form.output.outputParams.find((item) => item.name === record.parentName)
    if (parent) return parent
  }
  return form.output.outputParams.find((item) => item.children?.includes(record)) || null
}

// 删除出参变量（支持顶层与子项）
const deleteOutputItem = (record: any) => {
  if (record.parentName || findOutputParent(record)) {
    const parent = findOutputParent(record)
    if (parent?.children) {
      const childIndex = parent.children.findIndex((item) => item === record)
      if (childIndex > -1) {
        parent.children.splice(childIndex, 1)
      }
    }
    return
  }

  const index = form.output.outputParams.findIndex((item) => item === record)
  if (index > -1) {
    form.output.outputParams.splice(index, 1)
  }
}

// 添加子参数
const addChildParam = (parentRecord) => {
  const newChild = {
    name: '',
    path: '',
    classify: "any",
    parentName: parentRecord.name
  };

  if (!parentRecord.children) {
    parentRecord.children = []
  }

  parentRecord.children.push(newChild);
}

// 显示弹窗
const showModal = async (id: number, sceneObj: any, bol: boolean) => {
  connectorId.value = id
  dialogVisible.value = true
  existAuthConfig.value = bol

  if (sceneObj) {
    // 获取详情
    const scene = await getSceneConfig(sceneObj.id)

    const rowData = JSON.parse(JSON.stringify(scene))

    // 转换布尔值
    rowData.callback = scene.callback === 1
    rowData.enableAuth = scene.enableAuth === 1

    // input处理
    if (Array.isArray(scene.input)) {
      rowData.input = scene.input.map((i) => {
        if (Array.isArray(i.children)) {
          i.children.forEach((c) => {
            c.parentName = i.name
          })
        }
        return i
      })
    } else {
      rowData.input = []
    }

    // 初始化output
    if (!scene.output) {
      rowData.output = {
        resolve: 'json',
        outputParams: [],
      }
    } else {
      rowData.output.outputParams = (scene.output.outputParams || []).map((i) => {
        if (Array.isArray(i.children)) {
          i.children.forEach((c) => {
            c.parentName = i.name
          })
        }
        return i
      })
      rowData.output.resolve = scene.output.resolve || 'json'
    }

    // 处理body
    if (!rowData.execConfig) {
      rowData.execConfig = {
        url: '',
        query: [],
        header: [],
        method: 'POST',
        contentType: 'application/json',
        requestBody: '{}',
        body: [],
      }
    }
    rowData.execConfig.query = rowData.execConfig.query || []
    rowData.execConfig.header = rowData.execConfig.header || []
    rowData.execConfig.body = []
    const requestBody = JSON.parse(scene.execConfig.requestBody || '{}')
    if (scene.execConfig.contentType === 'multipart/form-data' ||
      scene.execConfig.contentType === 'application/x-www-form-urlencoded') {
      try {
        Object.keys(requestBody).forEach(key => {
          rowData.execConfig.body.push({
            name: key,
            type: 1,
            value: requestBody[key],
          })
        })
      } catch (e) {
        console.error('解析requestBody失败', e)
      }
    }

    // 更新表单
    Object.assign(form, rowData)

    await nextTick(() => {
      refInputTable.value.expandAll(true)
    })
  } else {
    // 重置表单
    resetForm()
  }
}

// 重置表单
const resetForm = () => {
  form.connectorId = ''
  form.id = null
  form.name = ''
  form.input = []
  form.execConfig = {
    url: '',
    query: [],
    header: [],
    method: 'POST',
    contentType: 'application/json',
    requestBody: '{}',
    body: []
  }
  form.output = {
    resolve: 'json',
    outputParams: []
  }
  form.callback = false
  form.enableAuth = false
}

// 关闭弹窗
const handleClose = () => {
  resetForm()
  dialogVisible.value = false
  formRef.value?.clearValidate()
}

// 提交表单
const submit = async () => {
  try {
    const validateResult = await formRef.value?.validate()
    if (validateResult) {
      return false
    }

    // 准备提交数据
    const submitData = JSON.parse(JSON.stringify(form))
    submitData.connectorId = connectorId.value
    submitData.enableAuth = form.enableAuth ? 1 : 0
    submitData.callback = form.callback ? 1 : 0

    // 处理requestBody
    if (submitData.execConfig.contentType === 'multipart/form-data' ||
      submitData.execConfig.contentType === 'application/x-www-form-urlencoded') {
      const requestBody = {}
      submitData.execConfig.body.forEach(item => {
        requestBody[item.name] = item.value
      })
      submitData.execConfig.requestBody = JSON.stringify(requestBody)
    }
    if (submitData.id) {
      // 更新场景
      await modifySceneConfig(submitData.id, submitData)
    } else {
      // 创建场景
      if (!submitData.callback) {
        delete submitData.output
      }
      await addSceneConfig(submitData)
    }
    Message.success('场景配置成功')
    emits('refresh')
    handleClose()
  } catch (error) {
    Message.error('操作失败')
  }
}

// 暴露方法给父组件
defineExpose({
  showModal
})
</script>

<style lang="scss" scoped>
@use "@/styles/textColor" as textColor;

.scene-config-model {

  .dialog-content {}

  .checkbox-wrapper {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .body-set-wrapper {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .input-box {
    width: 100%;

    .input-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;

      :deep(.arco-select) {
        flex: 1;
      }

      .key-input,
      .type-select,
      .value-select,
      .value-input,
      .name-input,
      .path-input,
      .scene-select {
        flex: 1;
      }

      .equal-btn {
        flex: 0 0 auto;
      }

      .delete-icon {
        flex: 0 0 auto;
        cursor: pointer;
        color: rgba(0, 0, 0, 0.4);
        font-size: 16px;

        &:hover {
          color: #f26161;
        }
      }
    }
  }

  .add-btn {
    width: 100%;
    border: 1px dashed #dcdfe6;
    background: #fff;

    &:hover {
      border-color: textColor.$ThemeTextColor;
      color: textColor.$ThemeTextColor;
    }
  }

  .form-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .title {
      display: flex;
      align-items: center;
      gap: 8px;

      .content-type {
        cursor: pointer;
        color: textColor.$ThemeTextColor;
        font-size: 12px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
    }

    .dropdown-link {
      cursor: pointer;
      color: textColor.$ThemeTextColor;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  }

  .switch {
    margin-left: 10px;
  }
}

:deep(.CodeMirror) {
  border: 1px solid #e5e5e5;
  height: 120px;
  width: 100%;
  border-radius: 3px;
}

:deep(.CodeMirror-gutters) {
  left: 0 !important;
}

.operation-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  width: 100%;
}
</style>
