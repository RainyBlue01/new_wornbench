<template>
  <a-modal
      class="scene-debug-modal"
      title="调试"
      :visible="dialogVisible"
      :width="600"
      :mask-closable="false"
      :esc-to-close="false"
      @cancel="handleClose"
      @ok="submit"
  >
    <div class="dialog-content">
      <div class="content-row">
        <div class="top">
          <div class="top-row">
            URL
          </div>
        </div>
        <a-row :gutter="8">
          <a-col :span="5">
            <a-input v-model="postType.requestMethod" readonly/>
          </a-col>
          <a-col :span="8">
            <a-input v-model="ip" readonly/>
          </a-col>
          <a-col :span="11">
            <a-input v-model="postType.url" readonly/>
          </a-col>
        </a-row>
      </div>

      <div class="content-row">
        <div class="top">
          <div class="top-row">
            URL参数
          </div>
        </div>
        <div class="input-item"
             v-for="(item, index) in postType.input"
             :key="index">
          <a-input
              class="key-input"
              readonly
              placeholder="KEY"
              v-model="item.name"
          />
          <span class="colon">:</span>
          <a-input
              class="value-input"
              placeholder="VALUE"
              v-model="item.defaultValue"
              @input="handleInputChange"
          />
        </div>
      </div>

      <div class="content-row">
        <div class="top">
          <div class="top-row">
            <div
                :class="['top-row-item', { active: showRequest === 0 }]"
                @click="changeRequest(0)"
            >
              URL参数
            </div>
            <div
                :class="['top-row-item', { active: showRequest === 1 }]"
                @click="changeRequest(1)"
            >
              请求头
            </div>
            <div
                :class="['top-row-item', { active: showRequest === 2 }]"
                @click="changeRequest(2)"
            >
              请求体
            </div>
          </div>
        </div>

        <!-- URL参数 -->
        <template v-if="showRequest === 0">
          <div
              class="input-item"
              v-for="(item, index) in postType.urlParam"
              :key="index"
          >
            <a-input class="key-input" readonly placeholder="KEY" v-model="item.name"/>
            <span class="colon">:</span>
            <a-input class="value-input" readonly placeholder="VALUE" v-model="item.value"/>
          </div>
        </template>

        <!-- 请求头 -->
        <template v-if="showRequest === 1">
          <div
              class="input-item"
              v-for="(item, index) in postType.requestHeader"
              :key="index"
          >
            <a-input class="key-input" readonly placeholder="KEY" v-model="item.name"/>
            <span class="colon">:</span>
            <a-input class="value-input" readonly placeholder="VALUE" v-model="item.value"/>
          </div>
        </template>

        <!-- 请求体 -->
        <template v-if="showRequest === 2">
          <Codemirror
              v-model:value="requestDes"
              :options="cmReadOnlyOptions"
              :border="true"
              :height="120"
          />
        </template>
      </div>

      <div class="content-row">
        <div class="top">
          <div class="top-row">
            <div
                :class="['top-row-item', { active: showResponse === 0 }]"
                @click="changeResponse(0)"
            >
              响应体
            </div>
          </div>
          <template v-if="responseDes">
            <div class="right-row">
              <div class="right-row-item" v-if="su.status">
                状态：{{ su.status }}
              </div>
              <div class="right-row-item" v-if="su.timeConsume">
                耗时：{{ su.timeConsume }}ms
              </div>
            </div>
          </template>
        </div>
        <Codemirror
            v-model:value="responseDes"
            :options="cmReadOnlyOptions"
            :border="true"
            :height="150"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <a-button @click="handleClose">取消</a-button>
        <a-button type="primary" @click="submit">调试</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import {reactive, ref} from 'vue'
import {Message} from '@arco-design/web-vue'
import Codemirror from 'codemirror-editor-vue3'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/idea.css'
import 'codemirror/mode/javascript/javascript.js'
import {getSceneConfig, sceneDebug} from "@/api/connector";

const dialogVisible = ref(false)
const ip = ref('')
const showRequest = ref(0)
const showResponse = ref(0)
const requestDes = ref('')
const responseDes = ref('')

// 调试数据
const postType = reactive({
  id: '',
  requestMethod: '',
  url: '',
  urlParam: [],
  requestBody: '',
  requestHeader: [],
  input: [],
  contentType: ''
})

// 响应数据
const su = reactive({
  responseHeader: '',
  responseBody: '',
  status: 200,
  timeConsume: 2200
})

// CodeMirror 只读配置
const cmReadOnlyOptions = {
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
  readOnly: true,
  showCursorWhenSelecting: true,
  firstLineNumber: 1
}

const changeRequest = (val) => {
  showRequest.value = val
  if (val === 2) {
    requestDes.value = postType.requestBody || ''
  }
}

// 切换响应选项卡
const changeResponse = (val) => {
  showResponse.value = val
  if (val === 0) {
    responseDes.value = su.responseBody ? JSON.stringify(su.responseBody, null, 2) : ''
  }
}

// 入参变量变化处理
const handleInputChange = () => {
  // 可以根据需要实时更新请求体
}

// 显示弹窗
const showModal = async (sceneObj: any, cnDes: any) => {
  // 重置状态
  showRequest.value = 0
  showResponse.value = 0
  responseDes.value = ''
  requestDes.value = ''

  // 重置响应数据
  su.responseHeader = ''
  su.responseBody = ''
  su.status = 200
  su.timeConsume = 2200

  if (sceneObj) {
    // 获取详情
    const scene = await getSceneConfig(sceneObj.id)

    // 设置调试数据
    const param = {
      id: scene.id,
      requestMethod: scene.execConfig.method,
      url: scene.execConfig.url,
      urlParam: scene.execConfig.query || [],
      requestBody: scene.execConfig.requestBody || '',
      requestHeader: scene.execConfig.header || [],
      input: scene.input || [],
      contentType: scene.execConfig.contentType
    }

    // 处理input
    if (!!scene.input || scene.input.length > 0) {
      scene.input.forEach(i => {
        if (i.classify === 'object') {
          let defaultValues = {}
          i.children.forEach(ic => {
            defaultValues[ic.name] = ic.defaultValue
          })
          i.defaultValue = JSON.stringify(defaultValues)
        } else if (i.classify === 'array') {
          let defaultValues = []
          i.children.forEach(ic => {
            let defaultVal = {}
            defaultVal[ic.name] = ic.defaultValue
            defaultValues.push(defaultVal)
          })
          i.defaultValue = JSON.stringify(defaultValues)
        }
      })
    }

    Object.assign(postType, param)
  }
  ip.value = cnDes.config ? cnDes.config.protocol + '://' + cnDes.config.host + ':' + cnDes.config.port + cnDes.config.commonPath : ''

  dialogVisible.value = true
}

const handleClose = () => {
  dialogVisible.value = false
}

const submit = async () => {
  try {
    // 构建调试参数
    const param = {
      data: {}
    }

    postType.input.forEach(item => {
      param.data[item.name] = item.defaultValue
    })

    const res = await sceneDebug(postType.id, param.data)

    if (res) {
      Object.assign(su, res)
      responseDes.value = su.responseBody ? JSON.stringify(su.responseBody, null, 2) : '{}'
    } else {
      su.status = 200
      su.timeConsume = ''
      su.responseBody = {}
      responseDes.value = '{}'
    }
    Message.success('调试成功')
  } catch (error) {
    Message.error('调试失败')
  }
}

defineExpose({
  showModal
})
</script>

<style lang="scss" scoped>

.scene-debug-modal {

  .dialog-content {

    .content-row {
      margin-bottom: 10px;

      .top {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;

        .top-row {
          display: flex;
          gap: 11px;

          &-item {
            font-size: 14px;
            text-align: left;
            cursor: pointer;
            color: rgba(0, 0, 0, 0.6);

            &.active {
              color: #4080ff;
              font-weight: 500;
            }
          }
        }

        .right-row {
          display: flex;
          gap: 16px;

          &-item {
            cursor: default;
            color: rgba(0, 0, 0, 0.4);
            font-size: 12px;
          }
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;

    :deep(.arco-btn) {
      border-radius: 3px;
    }
  }

  .input-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;

    .key-input {
      flex: 2;
    }

    .value-input {
      flex: 3;
    }

    .colon {
      color: rgba(0, 0, 0, 0.4);
      font-size: 14px;
    }
  }
}

:deep(.CodeMirror) {
  border: 1px solid #e5e5e5;
  border-radius: 3px;
  font-family: "Alibaba PuHuiTi 2.0-55 Regular";
  font-size: 13px;
}

:deep(.CodeMirror-gutters) {
  left: 0 !important;
}
</style>
