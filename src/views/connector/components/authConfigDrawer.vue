<template>
  <a-drawer
      class="auth-config-drawer"
      :visible="dialogVisible"
      :width="600"
      :mask-closable="false"
      :esc-to-close="false"
      placement="right"
      @cancel="handleClose"
  >
    <template #title>
      <div class="title">
        <div class="name">鉴权</div>
        <div class="des">建议鉴权方提供黑白名单巩固数据安全</div>
      </div>
    </template>

    <div class="dialog-content">
      <a-form
          ref="formRef"
          :model="form"
          :rules="rules"
          layout="vertical"
      >
        <a-form-item label="Method" field="classify" required>
          <a-select
              v-model="form.classify"
              placeholder="请选择Method"
              @change="changeAuthClassify"
          >
            <a-option
                v-for="item in methodType"
                :key="item.value"
                :value="item.value"
                :label="item.label"
            />
          </a-select>
        </a-form-item>

        <a-form-item label="插入示例：" field="codeSnippets">
          <Codemirror
              v-model:value="codeSnippets"
              :options="cmOptions"
              :border="true"
              :height="120"
          />
        </a-form-item>

        <a-form-item label="设置鉴权参数" required v-if="form.classify !== 0">
          <div class="spec-item">
            <template v-if="form.classify === 1">
              <a-form-item field="token" hide-asterisk>
                <div class="param-item">
                  <span class="param-label">token</span>
                  <a-input
                      v-model="form.token"
                      placeholder="请填写"
                      class="param-input"
                  />
                </div>
              </a-form-item>
            </template>

            <template v-if="form.classify === 2">
              <a-form-item field="username" hide-asterisk>
                <div class="param-item">
                  <span class="param-label">username</span>
                  <a-input
                      v-model="form.username"
                      placeholder="请填写"
                      class="param-input"
                  />
                </div>
              </a-form-item>

              <a-form-item field="password" hide-asterisk>
                <div class="param-item">
                  <span class="param-label">password</span>
                  <a-input
                      v-model="form.password"
                      placeholder="请填写"
                      class="param-input"
                  />
                </div>
              </a-form-item>
            </template>
          </div>
        </a-form-item>
      </a-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <a-button @click="handleClose">取消</a-button>
        <a-button type="primary" @click="submit">确认</a-button>
      </div>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import {reactive, ref} from 'vue'
import {useRoute} from 'vue-router'
import {Message} from '@arco-design/web-vue'
import Codemirror from 'codemirror-editor-vue3'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/idea.css'
import 'codemirror/mode/javascript/javascript.js'
import {setConnectorAuthConfig} from "@/api/connector";

const route = useRoute()

const emit = defineEmits(['refresh'])

const dialogVisible = ref(false)
const formRef = ref(null)
const codeSnippets = ref('')

const form = reactive({
  classify: 0,
  token: '',
  username: '',
  password: '',
})

const rules = {
  token: [{required: true, message: '请输入token'}],
  username: [{required: true, message: '请输入username'}],
  password: [{required: true, message: '请输入password'}],
}

// 鉴权类型选项
const methodType = [
  {
    label: 'none',
    value: 0
  },
  {
    label: 'token',
    value: 1
  },
  {
    label: 'Basic Auth',
    value: 2
  }
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

const connectorId = ref()

// 切换鉴权类型时更新示例代码
const changeAuthClassify = (val: any) => {
  let example = {}
  if (val === 0) {
  } else if (val === 1) {
    example = {
      header: {
        token: 'a32d2606-37c1-483c-ac6c-3f7d69cae9b0',
      }
    }
  } else if (val === 2) {
    example = {
      header: {
        Authorization: "Basic xxx"
      }
    }
  }
  codeSnippets.value = JSON.stringify(example, null, 2)
}

const resetForm = () => {
  form.classify = 0
  form.token = ''
  form.username = ''
  form.password = ''
}

const showModal = (id: any, item: any) => {
  resetForm()
  connectorId.value = id
  if (item) {
    form.classify = item.classify
    item.apiParmaList?.forEach(v => {
      switch (v.name) {
        case 'token':
          form.token = v.value
          break
        case 'username':
          form.username = v.value
          break
        case 'password':
          form.password = v.value
          break
        default:
          break
      }
    })
  }
  changeAuthClassify(form.classify)
  dialogVisible.value = true
}

// 关闭弹窗
const handleClose = () => {
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

    const params = {
      classify: form.classify,
      apiParmaList: []
    }

    if (form.classify === 0) {

    } else if (form.classify === 1) {
      params.apiParmaList.push(
          {name: 'token', value: form.token},
      )
    } else {
      params.apiParmaList.push(
          {name: 'username', value: form.username},
          {name: 'password', value: form.password}
      )
    }

    await setConnectorAuthConfig(connectorId.value, params)
    Message.success('配置鉴权成功')
    emit('refresh')
    handleClose()
  } catch (error) {
    Message.error('配置失败')
  }
}

// 暴露方法给父组件
defineExpose({
  showModal
})
</script>

<style lang="scss" scoped>
@use "@/styles/textColor" as textColor;

.spec-item {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.auth-config-drawer {

  :deep(.arco-drawer-header) {
    border-bottom: 1px solid #e5e5e5;
    padding-top: 20px;
    padding-bottom: 20px;
  }

  :deep(.arco-drawer-body) {
    min-height: 0;
    overflow-y: auto;
  }

  :deep(.arco-drawer-footer) {
    flex-shrink: 0;
    border-top: 0 !important;
  }

  .title {

    .name {
      color: rgba(16, 16, 16, 1);
      font-size: 14px;
      text-align: left;
    }

    .des {
      color: rgba(153, 153, 153, 1);
      font-size: 14px;
      text-align: left;
    }
  }

  .dialog-content {

    .param-item {
      display: flex;
      align-items: center;
      width: 100%;

      .param-label {
        display: inline-block;
        width: 118px;
        margin-right: 10px;
        text-align: center;
        border-radius: 3px;
        background-color: rgba(247, 248, 250, 1);
        color: rgba(68, 68, 68, 1);
        font-family: "Alibaba PuHuiTi 2.0-55 Regular";
        border: 1px solid rgba(220, 224, 231, 1);
        padding: 4px 8px;
        font-size: 14px;
      }

      .param-input {
        flex: 1;
      }
    }

    :deep(.arco-form-item) {
      margin-bottom: 18px;
    }
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    background: #fff;

    :deep(.arco-btn) {
      border-radius: 3px;
    }
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
</style>
