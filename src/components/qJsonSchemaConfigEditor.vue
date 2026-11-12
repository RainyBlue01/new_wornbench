<template>
  <div class="q-json-schema-config-editor">
    <div class="q-json-schema-config-editor__trigger">
      <button
        type="button"
        class="q-json-schema-config-editor__trigger-button"
        :disabled="disabled"
        aria-label="配置业务组件"
        title="配置业务组件"
        @click="openEditor"
      >
        <IconSettings />
      </button>
      <a-input
        class="q-json-schema-config-editor__trigger-input"
        :model-value="summaryText"
        readonly
        :disabled="disabled"
        placeholder="点击配置业务组件"
        @click="openEditor"
      />
    </div>

    <a-modal
      v-model:visible="visible"
      title="业务组件配置"
      :width="1180"
      title-align="start"
      :ok-button-props="{ size: 'small' }"
      :cancel-button-props="{ size: 'small' }"
      @before-ok="handleConfirm"
    >
      <div v-if="visible" class="q-json-schema-config-editor__layout">
        <div class="q-json-schema-config-editor__header">
          <a-radio-group v-model="activeView" type="button" size="small">
            <a-radio value="common">常用配置</a-radio>
            <a-radio value="json">JSON 配置</a-radio>
            <a-radio value="guide">配置说明</a-radio>
          </a-radio-group>

          <a-button v-if="activeView !== 'guide'" type="text" size="small" @click="applyExample">
            填充示例
          </a-button>
        </div>

        <div v-if="activeView === 'common'" class="q-json-schema-config-editor__common-shell">
          <div class="q-json-schema-config-editor__common-menu">
            <button
              v-for="section in commonSections"
              :key="section.key"
              type="button"
              class="q-json-schema-config-editor__common-item"
              :class="{ 'is-active': activeCommonSectionKey === section.key }"
              @click="activeCommonSectionKey = section.key"
            >
              {{ section.label }}
            </button>
          </div>

          <div class="q-json-schema-config-editor__common">
          <section
            v-show="activeCommonSectionKey === 'basic'"
            class="q-json-schema-config-editor__group"
          >
            <div class="q-json-schema-config-editor__group-title">基础信息</div>
            <a-form layout="vertical">
              <a-form-item label="标题">
                <a-input v-model="schemaForm.title" placeholder="请输入业务组件标题" />
              </a-form-item>
              <a-form-item label="描述">
                <a-input v-model="schemaForm.description" placeholder="请输入描述" />
              </a-form-item>
              <a-form-item label="渲染器">
                <a-select v-model="uiSchemaForm.renderer" allow-clear :options="rendererOptions" />
              </a-form-item>
              <a-form-item label="默认值">
                <a-textarea
                  v-model="defaultValueForm.text"
                  :auto-size="{ minRows: 4, maxRows: 8 }"
                  placeholder="请输入默认值 JSON"
                />
              </a-form-item>
            </a-form>
          </section>

          <section
            v-show="activeCommonSectionKey === 'fields'"
            class="q-json-schema-config-editor__group"
          >
            <div class="q-json-schema-config-editor__group-title">字段与展示</div>
            <a-form layout="vertical">
              <a-form-item label="必填字段">
                <a-input v-model="schemaForm.requiredText" placeholder="多个字段用英文逗号分隔" />
              </a-form-item>
              <a-form-item label="字段结构 properties">
                <a-textarea
                  v-model="schemaForm.propertiesText"
                  :auto-size="{ minRows: 10, maxRows: 16 }"
                  placeholder="请输入 schema.properties JSON"
                />
              </a-form-item>
              <a-form-item label="字段 UI 配置">
                <a-textarea
                  v-model="uiSchemaForm.fieldsText"
                  :auto-size="{ minRows: 10, maxRows: 16 }"
                  placeholder="请输入 uiSchema 字段 JSON"
                />
              </a-form-item>
            </a-form>
          </section>

          <section
            v-show="activeCommonSectionKey === 'container'"
            class="q-json-schema-config-editor__group"
          >
            <div class="q-json-schema-config-editor__group-title">容器与模块</div>
            <a-form layout="vertical">
              <a-form-item label="承载方式">
                <a-select v-model="containerForm.type" :options="containerTypeOptions" />
              </a-form-item>
              <a-form-item label="容器标题">
                <a-input v-model="containerForm.title" placeholder="弹窗或抽屉标题" />
              </a-form-item>
              <a-form-item label="触发方式">
                <a-select v-model="containerForm.triggerMode" :options="triggerModeOptions" />
              </a-form-item>
              <a-form-item label="触发文案">
                <a-input v-model="containerForm.triggerText" placeholder="请输入触发按钮文案" />
              </a-form-item>
              <a-form-item label="宽度">
                <a-input-number v-model="containerForm.width" :min="360" :precision="0" />
              </a-form-item>
              <a-form-item label="提交后关闭">
                <a-switch v-model="containerForm.closeOnSubmit" />
              </a-form-item>
              <a-form-item label="关闭后销毁内容">
                <a-switch v-model="containerForm.destroyOnClose" />
              </a-form-item>
              <a-form-item label="模块模式">
                <a-select v-model="moduleForm.mode" :options="moduleModeOptions" />
              </a-form-item>
              <a-form-item label="模块列表">
                <a-textarea
                  v-model="moduleForm.modulesText"
                  :auto-size="{ minRows: 8, maxRows: 14 }"
                  placeholder="请输入 modules JSON 数组"
                />
              </a-form-item>
            </a-form>
          </section>

          <section
            v-show="activeCommonSectionKey === 'validation'"
            class="q-json-schema-config-editor__group"
          >
            <div class="q-json-schema-config-editor__group-title">校验与联动</div>
            <a-form layout="vertical">
              <a-form-item label="启用 JSON Schema 校验">
                <a-switch v-model="validationForm.enableJsonSchema" />
              </a-form-item>
              <a-form-item label="输入时校验">
                <a-switch v-model="validationForm.validateOnChange" />
              </a-form-item>
              <a-form-item label="提交时校验">
                <a-switch v-model="validationForm.validateOnSubmit" />
              </a-form-item>
              <a-form-item label="必填提示文案">
                <a-input v-model="validationForm.requiredMessage" placeholder="请输入必填提示文案" />
              </a-form-item>
              <a-form-item label="自定义校验规则">
                <a-textarea
                  v-model="validationForm.customRulesText"
                  :auto-size="{ minRows: 5, maxRows: 8 }"
                  placeholder="请输入 customRules JSON 数组"
                />
              </a-form-item>
              <a-form-item label="联动规则">
                <a-textarea
                  v-model="logicForm.rulesText"
                  :auto-size="{ minRows: 8, maxRows: 14 }"
                  placeholder="请输入 logicConfig.rules JSON 数组"
                />
              </a-form-item>
            </a-form>
          </section>

          <section
            v-show="activeCommonSectionKey === 'request'"
            class="q-json-schema-config-editor__group"
          >
            <div class="q-json-schema-config-editor__group-title">请求与桥接</div>
            <a-form layout="vertical">
              <a-form-item label="启用后台请求">
                <a-switch v-model="requestForm.enable" />
              </a-form-item>
              <a-form-item label="请求方式">
                <a-select v-model="requestForm.method" :options="requestMethodOptions" />
              </a-form-item>
              <a-form-item label="请求地址">
                <a-input v-model="requestForm.url" placeholder="请输入请求地址" />
              </a-form-item>
              <a-form-item label="触发事件">
                <a-checkbox-group v-model="requestForm.triggerEvents" :options="triggerEventOptions" />
              </a-form-item>
              <a-form-item label="监听字段">
                <a-input v-model="requestForm.watchFieldsText" placeholder="多个字段用英文逗号分隔" />
              </a-form-item>
              <a-form-item label="显示手动按钮">
                <a-switch v-model="requestForm.showManualButton" />
              </a-form-item>
              <a-form-item label="按钮文案">
                <a-input v-model="requestForm.buttonText" placeholder="请输入按钮文案" />
              </a-form-item>
              <a-form-item label="响应路径">
                <a-input v-model="requestForm.responsePath" placeholder="例如 data.records" />
              </a-form-item>
              <a-form-item label="请求参数 params">
                <a-textarea
                  v-model="requestForm.paramsText"
                  :auto-size="{ minRows: 4, maxRows: 8 }"
                  placeholder="请输入 params JSON"
                />
              </a-form-item>
              <a-form-item label="请求头 headers">
                <a-textarea
                  v-model="requestForm.headersText"
                  :auto-size="{ minRows: 4, maxRows: 8 }"
                  placeholder="请输入 headers JSON"
                />
              </a-form-item>
              <a-form-item label="请求体 body">
                <a-textarea
                  v-model="requestForm.bodyText"
                  :auto-size="{ minRows: 4, maxRows: 8 }"
                  placeholder="请输入 body JSON"
                />
              </a-form-item>
              <a-form-item label="输出映射">
                <a-textarea
                  v-model="requestForm.outputMappingsText"
                  :auto-size="{ minRows: 6, maxRows: 10 }"
                  placeholder="请输入 outputMappings JSON 数组"
                />
              </a-form-item>
              <a-form-item label="数据桥接规则">
                <a-textarea
                  v-model="bridgeForm.bridgesText"
                  :auto-size="{ minRows: 6, maxRows: 10 }"
                  placeholder="请输入 bridges JSON 数组"
                />
              </a-form-item>
            </a-form>
          </section>

          <section
            v-show="activeCommonSectionKey === 'business'"
            class="q-json-schema-config-editor__group"
          >
            <div class="q-json-schema-config-editor__group-title">业务扩展</div>
            <a-form layout="vertical">
              <a-form-item label="启用业务函数">
                <a-switch v-model="businessForm.enable" />
              </a-form-item>
              <a-form-item label="函数列表">
                <a-textarea
                  v-model="businessForm.functionsText"
                  :auto-size="{ minRows: 6, maxRows: 10 }"
                  placeholder="请输入 functions JSON 数组"
                />
              </a-form-item>
            </a-form>

            <template v-if="currentPreset === 'booking'">
              <a-divider orientation="left">预约预设</a-divider>
              <a-form layout="vertical">
                <a-form-item label="预约范围">
                  <a-select v-model="bookingForm.scopeType" :options="bookingScopeOptions" />
                </a-form-item>
                <a-form-item label="未来天数">
                  <a-input-number v-model="bookingForm.scopeDays" :min="0" :precision="0" />
                </a-form-item>
                <a-form-item label="固定日期">
                  <a-input v-model="bookingForm.fixedDate" placeholder="例如 2026-07-08" />
                </a-form-item>
                <a-form-item label="提前预约天数">
                  <a-input-number v-model="bookingForm.advanceDays" :min="0" :precision="0" />
                </a-form-item>
                <a-form-item label="预约项目">
                  <a-textarea
                    v-model="bookingForm.itemsText"
                    :auto-size="{ minRows: 8, maxRows: 14 }"
                    placeholder="请输入 items JSON 数组"
                  />
                </a-form-item>
              </a-form>
            </template>

            <template v-if="currentPreset === 'leave'">
              <a-divider orientation="left">请假预设</a-divider>
              <a-form layout="vertical">
                <a-form-item label="允许半天">
                  <a-switch v-model="leaveForm.allowHalfDay" />
                </a-form-item>
                <a-form-item label="最大天数">
                  <a-input-number v-model="leaveForm.maxDays" :min="0" :precision="0" />
                </a-form-item>
                <a-form-item label="提示文案">
                  <a-textarea
                    v-model="leaveForm.noticeText"
                    :auto-size="{ minRows: 4, maxRows: 8 }"
                    placeholder="请输入提示文案"
                  />
                </a-form-item>
              </a-form>
            </template>
          </section>
          </div>
        </div>

        <div v-else-if="activeView === 'json'" class="q-json-schema-config-editor__json">
          <div class="q-json-schema-config-editor__json-menu">
            <button
              v-for="section in jsonSections"
              :key="section.key"
              type="button"
              class="q-json-schema-config-editor__json-item"
              :class="{ 'is-active': activeJsonSectionKey === section.key }"
              @click="activeJsonSectionKey = section.key"
            >
              {{ section.label }}
            </button>
          </div>

          <div class="q-json-schema-config-editor__json-panel">
            <a-alert class="q-json-schema-config-editor__tips" type="info" show-icon>
              {{ activeJsonSection.tip }}
            </a-alert>
            <a-textarea
              v-model="draftMap[activeJsonSection.key]"
              class="q-json-schema-config-editor__textarea"
              :auto-size="{ minRows: 24, maxRows: 24 }"
              :placeholder="activeJsonSection.placeholder"
            />
          </div>
        </div>

        <div v-else class="q-json-schema-config-editor__guide">
          <section class="q-json-schema-config-editor__guide-card">
            <div class="q-json-schema-config-editor__group-title">推荐配置顺序</div>
            <div class="q-json-schema-config-editor__guide-text">
              1. 先配置 <strong>Schema</strong> 和 <strong>UI Schema</strong>，把字段结构、字段组件和展示方式定下来。
            </div>
            <div class="q-json-schema-config-editor__guide-text">
              2. 再配置 <strong>validationConfig</strong> 和 <strong>logicConfig</strong>，补上必填、格式校验和字段联动。
            </div>
            <div class="q-json-schema-config-editor__guide-text">
              3. 如果业务组件是弹窗、抽屉或多模块结构，再继续配置 <strong>containerConfig</strong>、<strong>moduleConfig</strong> 和 <strong>dataBridgeConfig</strong>。
            </div>
            <div class="q-json-schema-config-editor__guide-text">
              4. 如果需要和后台交互，再补充 <strong>requestConfig</strong>；如果是预约、请假这类预设，再配置 <strong>businessFunctionConfig</strong>。
            </div>
          </section>

          <section class="q-json-schema-config-editor__guide-card">
            <div class="q-json-schema-config-editor__group-title">配置项详细说明</div>
            <div class="q-json-schema-config-editor__guide-block">
              <div class="q-json-schema-config-editor__guide-subtitle">1. schema</div>
              <div class="q-json-schema-config-editor__guide-list">
                <div>作用：定义字段数据结构，是整个业务组件的数据基础。</div>
                <div>常用字段：`title`、`description`、`required`、`properties`。</div>
                <div>说明：`properties` 里每个 key 对应一个字段，字段的 `type`、`title`、默认规则都在这里定义。</div>
                <div>建议：表单字段新增或删除时，优先维护这里，再去调 UI Schema。</div>
              </div>
            </div>
            <div class="q-json-schema-config-editor__guide-block">
              <div class="q-json-schema-config-editor__guide-subtitle">2. uiSchema</div>
              <div class="q-json-schema-config-editor__guide-list">
                <div>作用：定义字段怎么渲染，不改数据结构，只改展示方式。</div>
                <div>常用字段：`renderer`、字段下的 `component`、`placeholder`、`disabled`、`options`。</div>
                <div>说明：同一个 schema 可以配不同的 uiSchema，实现普通表单、业务预设、弹窗子表单等不同展示。</div>
                <div>建议：本地已有组件配置优先沿用现有字段格式，保持兼容。</div>
              </div>
            </div>
            <div class="q-json-schema-config-editor__guide-block">
              <div class="q-json-schema-config-editor__guide-subtitle">3. validationConfig</div>
              <div class="q-json-schema-config-editor__guide-list">
                <div>作用：控制何时校验、校验失败提示什么，以及是否叠加自定义规则。</div>
                <div>常用字段：`enableJsonSchema`、`validateOnChange`、`validateOnSubmit`、`requiredMessage`、`customRules`。</div>
                <div>说明：`customRules` 适合补充 JSON Schema 不方便表达的业务校验，比如开始时间不能晚于结束时间。</div>
              </div>
            </div>
            <div class="q-json-schema-config-editor__guide-block">
              <div class="q-json-schema-config-editor__guide-subtitle">4. logicConfig.rules</div>
              <div class="q-json-schema-config-editor__guide-list">
                <div>作用：定义字段联动、模块联动、弹窗联动等行为。</div>
                <div>常见效果：显示隐藏、启用禁用、赋值清空、打开模块、关闭模块、提交模块。</div>
                <div>说明：新增业务组件如果模块之间存在联动，优先统一落到这里，避免散在 renderer 代码里写死。</div>
              </div>
            </div>
            <div class="q-json-schema-config-editor__guide-block">
              <div class="q-json-schema-config-editor__guide-subtitle">5. containerConfig</div>
              <div class="q-json-schema-config-editor__guide-list">
                <div>作用：决定业务组件是直接内嵌展示，还是通过弹窗、抽屉承载。</div>
                <div>常用字段：`type`、`title`、`width`、`triggerMode`、`triggerText`、`closeOnSubmit`、`destroyOnClose`。</div>
                <div>说明：如果新增组件本身是一个“弹窗中的表单”，这里就是主入口配置。</div>
              </div>
            </div>
            <div class="q-json-schema-config-editor__guide-block">
              <div class="q-json-schema-config-editor__guide-subtitle">6. moduleConfig</div>
              <div class="q-json-schema-config-editor__guide-list">
                <div>作用：定义业务组件内部有哪些模块，以及模块怎么组织。</div>
                <div>常用字段：`mode`、`modules`，其中 `modules` 里的 `id`、`type`、`title`、`container` 最常用。</div>
                <div>说明：适合一个业务组件里拆多个区域，比如主表单、预约弹窗、结果列表、确认区。</div>
              </div>
            </div>
            <div class="q-json-schema-config-editor__guide-block">
              <div class="q-json-schema-config-editor__guide-subtitle">7. requestConfig</div>
              <div class="q-json-schema-config-editor__guide-list">
                <div>作用：统一配置接口请求，不把请求逻辑写死在业务组件里。</div>
                <div>常用字段：`url`、`method`、`triggerEvents`、`watchFields`、`params`、`headers`、`body`、`responsePath`、`outputMappings`。</div>
                <div>说明：`watchFields` 适合字段变化自动请求，`outputMappings` 适合把接口返回值映射回表单字段。</div>
              </div>
            </div>
            <div class="q-json-schema-config-editor__guide-block">
              <div class="q-json-schema-config-editor__guide-subtitle">8. dataBridgeConfig</div>
              <div class="q-json-schema-config-editor__guide-list">
                <div>作用：解决模块之间、弹窗和主表单之间的数据回填问题。</div>
                <div>常用字段：`bridges`、`sourceId`、`triggerEvents`、`mappings`。</div>
                <div>说明：如果一个预约弹窗确认后要把预约时间、预约项目回填到主表单，这里就是核心配置。</div>
              </div>
            </div>
            <div class="q-json-schema-config-editor__guide-block">
              <div class="q-json-schema-config-editor__guide-subtitle">9. businessFunctionConfig</div>
              <div class="q-json-schema-config-editor__guide-list">
                <div>作用：挂业务函数和业务预设，承载预约、请假这类可复用能力。</div>
                <div>常用字段：`enable`、`functions`，以及 `bookingConfig`、`leaveConfig` 这类预设参数。</div>
                <div>说明：如果后续有新业务预设，建议沿用这个结构继续扩展，保持和本地组件配置兼容。</div>
              </div>
            </div>
          </section>

          <section class="q-json-schema-config-editor__guide-card">
            <div class="q-json-schema-config-editor__group-title">典型示例</div>
            <a-textarea
              :model-value="guideExamples.modal"
              readonly
              class="q-json-schema-config-editor__textarea"
              :auto-size="{ minRows: 10, maxRows: 10 }"
            />
            <a-textarea
              :model-value="guideExamples.bridge"
              readonly
              class="q-json-schema-config-editor__textarea"
              :auto-size="{ minRows: 10, maxRows: 10 }"
            />
          </section>
        </div>

        <div v-if="errorMessage" class="q-json-schema-config-editor__error">
          {{ errorMessage }}
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSettings } from '@arco-design/web-vue/es/icon'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  comDes: {
    type: Object,
    default: undefined,
  },
})

const SECTION_KEYS = [
  'schema',
  'uiSchema',
  'validationConfig',
  'logicConfig',
  'requestConfig',
  'businessFunctionConfig',
  'containerConfig',
  'moduleConfig',
  'dataBridgeConfig',
  'defaultValue',
]

const commonSections = [
  { key: 'basic', label: '基础信息' },
  { key: 'fields', label: '字段与展示' },
  { key: 'container', label: '容器与模块' },
  { key: 'validation', label: '校验与联动' },
  { key: 'request', label: '请求与桥接' },
  { key: 'business', label: '业务扩展' },
]

const jsonSections = [
  {
    key: 'schema',
    label: 'Schema',
    tip: '定义字段结构、标题、必填项和字段属性。',
    placeholder: '请输入 schema JSON',
    example: `{
  "type": "object",
  "title": "预约组件",
  "required": ["bookingItemId", "bookingDate"],
  "properties": {
    "bookingItemId": {
      "type": "string",
      "title": "预约项目"
    },
    "bookingDate": {
      "type": "string",
      "title": "预约时间"
    }
  }
}`,
  },
  {
    key: 'uiSchema',
    label: 'UI Schema',
    tip: '定义字段展示方式、组件类型和渲染器。',
    placeholder: '请输入 uiSchema JSON',
    example: `{
  "renderer": "booking",
  "bookingItemId": {
    "component": "select",
    "placeholder": "请选择预约项目"
  },
  "bookingDate": {
    "component": "date",
    "placeholder": "请选择预约时间"
  }
}`,
  },
  {
    key: 'validationConfig',
    label: '校验',
    tip: '定义校验开关、校验时机和自定义校验规则。',
    placeholder: '请输入 validationConfig JSON',
    example: `{
  "enableJsonSchema": true,
  "validateOnChange": true,
  "validateOnSubmit": true,
  "requiredMessage": "请完善业务组件信息",
  "customRules": []
}`,
  },
  {
    key: 'logicConfig',
    label: '联动',
    tip: '统一配置字段级和模块级联动规则。',
    placeholder: '请输入 logicConfig JSON',
    example: `{
  "rules": [
    {
      "when": {
        "field": "leaveType",
        "operator": "eq",
        "value": "other"
      },
      "effects": [
        {
          "type": "show",
          "target": "leaveReason"
        }
      ]
    }
  ]
}`,
  },
  {
    key: 'requestConfig',
    label: '请求',
    tip: '定义请求地址、触发时机、参数和输出映射。',
    placeholder: '请输入 requestConfig JSON',
    example: `{
  "enable": false,
  "method": "post",
  "url": "",
  "triggerEvents": ["manual"],
  "watchFields": [],
  "showManualButton": false,
  "buttonText": "请求后台",
  "params": {},
  "headers": {},
  "body": {},
  "responsePath": "",
  "outputMappings": []
}`,
  },
  {
    key: 'businessFunctionConfig',
    label: '业务函数',
    tip: '定义业务函数和业务预设扩展配置。',
    placeholder: '请输入 businessFunctionConfig JSON',
    example: `{
  "enable": false,
  "functions": [],
  "bookingConfig": {
    "scopeType": "future",
    "scopeDays": 7,
    "items": []
  }
}`,
  },
  {
    key: 'containerConfig',
    label: '容器',
    tip: '决定业务组件以内嵌、弹窗或抽屉方式展示。',
    placeholder: '请输入 containerConfig JSON',
    example: `{
  "type": "modal",
  "title": "新增预约",
  "width": 720,
  "triggerMode": "button",
  "triggerText": "新增预约",
  "closeOnSubmit": true,
  "destroyOnClose": false
}`,
  },
  {
    key: 'moduleConfig',
    label: '模块',
    tip: '定义业务组件内部模块，可用于弹窗中的表单模块。',
    placeholder: '请输入 moduleConfig JSON',
    example: `{
  "mode": "single",
  "modules": [
    {
      "id": "editor",
      "type": "form",
      "title": "编辑表单",
      "container": "modal"
    }
  ]
}`,
  },
  {
    key: 'dataBridgeConfig',
    label: '桥接',
    tip: '定义弹窗模块和主表单之间的数据回填规则。',
    placeholder: '请输入 dataBridgeConfig JSON',
    example: `{
  "bridges": [
    {
      "sourceId": "editor",
      "triggerEvents": ["confirm"],
      "mappings": [
        {
          "source": "bookingItemName",
          "target": "summaryName"
        },
        {
          "source": "bookingDate",
          "target": "summaryDate"
        }
      ]
    }
  ]
}`,
  },
  {
    key: 'defaultValue',
    label: '默认值',
    tip: '定义组件初始化默认值。',
    placeholder: '请输入 defaultValue JSON',
    example: `{
  "bookingItemId": "",
  "bookingDate": ""
}`,
  },
]

const rendererOptions = [
  { label: '自定义', value: 'custom' },
  { label: '预约', value: 'booking' },
  { label: '请假', value: 'leave' },
]

const containerTypeOptions = [
  { label: '内嵌', value: 'inline' },
  { label: '弹窗', value: 'modal' },
  { label: '抽屉', value: 'drawer' },
]

const triggerModeOptions = [
  { label: '按钮触发', value: 'button' },
  { label: '自动打开', value: 'auto' },
  { label: '手动触发', value: 'manual' },
]

const moduleModeOptions = [
  { label: '单模块', value: 'single' },
  { label: '多模块', value: 'multiple' },
]

const requestMethodOptions = [
  { label: 'GET', value: 'get' },
  { label: 'POST', value: 'post' },
  { label: 'PUT', value: 'put' },
]

const triggerEventOptions = [
  { label: '手动', value: 'manual' },
  { label: '初始化', value: 'init' },
  { label: '字段变化', value: 'change' },
  { label: '提交前', value: 'submit' },
]

const bookingScopeOptions = [
  { label: '未来所有时间', value: 'future' },
  { label: '未来 N 天', value: 'futureDays' },
  { label: '固定日期', value: 'fixedDate' },
]

const guideExamples = {
  modal: `弹窗表单示例
{
  "containerConfig": {
    "type": "modal",
    "title": "新增预约",
    "width": 720,
    "triggerMode": "button",
    "triggerText": "新增预约",
    "closeOnSubmit": true
  },
  "moduleConfig": {
    "mode": "single",
    "modules": [
      {
        "id": "editor",
        "type": "form",
        "title": "预约信息",
        "container": "modal"
      }
    ]
  }
}`,
  bridge: `桥接回填示例
{
  "dataBridgeConfig": {
    "bridges": [
      {
        "sourceId": "editor",
        "triggerEvents": ["confirm"],
        "mappings": [
          { "source": "bookingItemName", "target": "summaryName" },
          { "source": "bookingDate", "target": "summaryDate" }
        ]
      }
    ]
  }
}`,
}

const visible = ref(false)
const activeView = ref('common')
const activeJsonSectionKey = ref('schema')
const activeCommonSectionKey = ref('basic')
const errorMessage = ref('')
const isSyncingView = ref(false)

const draftMap = reactive({
  schema: '',
  uiSchema: '',
  validationConfig: '',
  logicConfig: '',
  requestConfig: '',
  businessFunctionConfig: '',
  containerConfig: '',
  moduleConfig: '',
  dataBridgeConfig: '',
  defaultValue: '',
})

const schemaForm = reactive({
  title: '',
  description: '',
  requiredText: '',
  propertiesText: '{}',
})

const uiSchemaForm = reactive({
  renderer: '',
  fieldsText: '{}',
})

const validationForm = reactive({
  enableJsonSchema: true,
  validateOnChange: true,
  validateOnSubmit: true,
  requiredMessage: '',
  customRulesText: '[]',
})

const logicForm = reactive({
  rulesText: '[]',
})

const requestForm = reactive({
  enable: false,
  method: 'post',
  url: '',
  triggerEvents: ['manual'],
  watchFieldsText: '',
  showManualButton: false,
  buttonText: '',
  paramsText: '{}',
  headersText: '{}',
  bodyText: '{}',
  responsePath: '',
  outputMappingsText: '[]',
  successMessage: '',
  errorMessage: '',
})

const businessForm = reactive({
  enable: false,
  functionsText: '[]',
})

const bookingForm = reactive({
  scopeType: 'future',
  scopeDays: 7,
  fixedDate: '',
  advanceDays: 0,
  itemsText: '[]',
})

const leaveForm = reactive({
  allowHalfDay: false,
  maxDays: 30,
  noticeText: '',
})

const containerForm = reactive({
  type: 'inline',
  title: '',
  width: 720,
  triggerMode: 'button',
  triggerText: '打开表单',
  closeOnSubmit: true,
  destroyOnClose: false,
})

const moduleForm = reactive({
  mode: 'single',
  modulesText: '[]',
})

const bridgeForm = reactive({
  bridgesText: '[]',
})

const defaultValueForm = reactive({
  text: '{}',
})

const currentPreset = computed(() => props.comDes?.props?.businessPreset || 'custom')

const activeJsonSection = computed(() => {
  return jsonSections.find((section) => section.key === activeJsonSectionKey.value) || jsonSections[0]
})

const summaryText = computed(() => {
  const presetMap = {
    booking: '预约组件',
    leave: '请假组件',
    custom: '自定义组件',
  }
  const containerMap = {
    inline: '内嵌',
    modal: '弹窗',
    drawer: '抽屉',
  }

  return `${presetMap[currentPreset.value] || '自定义组件'} / ${containerMap[containerForm.type] || '内嵌'} / 常用配置`
})

const cloneValue = (value, fallback = {}) => {
  try {
    return JSON.parse(JSON.stringify(value ?? fallback))
  } catch {
    return JSON.parse(JSON.stringify(fallback))
  }
}

const safeStringify = (value, fallback = '{}') => {
  try {
    return JSON.stringify(value ?? JSON.parse(fallback), null, 2)
  } catch {
    return fallback
  }
}

const parseJsonText = (text, label, fallback) => {
  const trimmed = String(text || '').trim()
  if (!trimmed) return fallback
  try {
    return JSON.parse(trimmed)
  } catch (error) {
    errorMessage.value = `${label} 格式错误：${error?.message || 'JSON 解析失败'}`
    throw error
  }
}

const toCommaText = (value) => {
  return Array.isArray(value) ? value.join(',') : ''
}

const fromCommaText = (value) => {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const getPropsBucket = () => {
  return props.comDes?.props || {}
}

const ensurePropsBucket = () => {
  if (!props.comDes) return null
  if (!props.comDes.props) {
    props.comDes.props = {}
  }
  return props.comDes.props
}

const setFormState = () => {
  const config = getPropsBucket()
  const schema = cloneValue(config.schema)
  const uiSchema = cloneValue(config.uiSchema)
  const validationConfig = cloneValue(config.validationConfig)
  const logicConfig = cloneValue(config.logicConfig)
  const requestConfig = cloneValue(config.requestConfig)
  const businessFunctionConfig = cloneValue(config.businessFunctionConfig)
  const containerConfig = cloneValue(config.containerConfig)
  const moduleConfig = cloneValue(config.moduleConfig)
  const dataBridgeConfig = cloneValue(config.dataBridgeConfig)
  const defaultValue = cloneValue(config.defaultValue)

  schemaForm.title = schema.title || ''
  schemaForm.description = schema.description || ''
  schemaForm.requiredText = toCommaText(schema.required)
  schemaForm.propertiesText = safeStringify(schema.properties || {})

  uiSchemaForm.renderer = uiSchema.renderer || ''
  const uiFields = cloneValue(uiSchema)
  delete uiFields.renderer
  uiSchemaForm.fieldsText = safeStringify(uiFields)

  validationForm.enableJsonSchema = validationConfig.enableJsonSchema !== false
  validationForm.validateOnChange = validationConfig.validateOnChange !== false
  validationForm.validateOnSubmit = validationConfig.validateOnSubmit !== false
  validationForm.requiredMessage = validationConfig.requiredMessage || ''
  validationForm.customRulesText = safeStringify(validationConfig.customRules || [], '[]')

  logicForm.rulesText = safeStringify(logicConfig.rules || [], '[]')

  requestForm.enable = Boolean(requestConfig.enable)
  requestForm.method = requestConfig.method || 'post'
  requestForm.url = requestConfig.url || ''
  requestForm.triggerEvents = Array.isArray(requestConfig.triggerEvents) && requestConfig.triggerEvents.length
    ? [...requestConfig.triggerEvents]
    : ['manual']
  requestForm.watchFieldsText = toCommaText(requestConfig.watchFields)
  requestForm.showManualButton = Boolean(requestConfig.showManualButton)
  requestForm.buttonText = requestConfig.buttonText || ''
  requestForm.paramsText = safeStringify(requestConfig.params || {})
  requestForm.headersText = safeStringify(requestConfig.headers || {})
  requestForm.bodyText = safeStringify(requestConfig.body || {})
  requestForm.responsePath = requestConfig.responsePath || ''
  requestForm.outputMappingsText = safeStringify(requestConfig.outputMappings || [], '[]')
  requestForm.successMessage = requestConfig.successMessage || ''
  requestForm.errorMessage = requestConfig.errorMessage || ''

  businessForm.enable = Boolean(businessFunctionConfig.enable)
  businessForm.functionsText = safeStringify(businessFunctionConfig.functions || [], '[]')

  const bookingConfig = businessFunctionConfig.bookingConfig || {}
  bookingForm.scopeType = bookingConfig.scopeType || 'future'
  bookingForm.scopeDays = bookingConfig.scopeDays ?? 7
  bookingForm.fixedDate = bookingConfig.fixedDate || ''
  bookingForm.advanceDays = bookingConfig.advanceDays ?? 0
  bookingForm.itemsText = safeStringify(bookingConfig.items || [], '[]')

  const leaveConfig = businessFunctionConfig.leaveConfig || {}
  leaveForm.allowHalfDay = Boolean(leaveConfig.allowHalfDay)
  leaveForm.maxDays = leaveConfig.maxDays ?? 30
  leaveForm.noticeText = leaveConfig.noticeText || ''

  containerForm.type = containerConfig.type || 'inline'
  containerForm.title = containerConfig.title || ''
  containerForm.width = containerConfig.width ?? 720
  containerForm.triggerMode = containerConfig.triggerMode || 'button'
  containerForm.triggerText = containerConfig.triggerText || '打开表单'
  containerForm.closeOnSubmit = containerConfig.closeOnSubmit !== false
  containerForm.destroyOnClose = Boolean(containerConfig.destroyOnClose)

  moduleForm.mode = moduleConfig.mode || 'single'
  moduleForm.modulesText = safeStringify(moduleConfig.modules || [], '[]')

  bridgeForm.bridgesText = safeStringify(dataBridgeConfig.bridges || [], '[]')
  defaultValueForm.text = safeStringify(defaultValue || {})
}

const buildSectionMapFromForms = () => {
  const baseSchema = cloneValue(getPropsBucket().schema, {})
  const properties = parseJsonText(schemaForm.propertiesText, 'Schema properties', {})
  const uiFields = parseJsonText(uiSchemaForm.fieldsText, '字段 UI 配置', {})
  const customRules = parseJsonText(validationForm.customRulesText, '自定义校验规则', [])
  const logicRules = parseJsonText(logicForm.rulesText, '联动规则', [])
  const params = parseJsonText(requestForm.paramsText, '请求参数 params', {})
  const headers = parseJsonText(requestForm.headersText, '请求头 headers', {})
  const body = parseJsonText(requestForm.bodyText, '请求体 body', {})
  const outputMappings = parseJsonText(requestForm.outputMappingsText, '输出映射 outputMappings', [])
  const functions = parseJsonText(businessForm.functionsText, '业务函数 functions', [])
  const modules = parseJsonText(moduleForm.modulesText, '模块列表 modules', [])
  const bridges = parseJsonText(bridgeForm.bridgesText, '数据桥接 bridges', [])
  const defaultValue = parseJsonText(defaultValueForm.text, '默认值 defaultValue', {})

  const schema = {
    ...baseSchema,
    type: 'object',
    title: schemaForm.title || undefined,
    description: schemaForm.description || undefined,
    required: fromCommaText(schemaForm.requiredText),
    properties,
  }

  const uiSchema = {
    ...uiFields,
  }
  if (uiSchemaForm.renderer) {
    uiSchema.renderer = uiSchemaForm.renderer
  }

  const validationConfig = {
    enableJsonSchema: validationForm.enableJsonSchema,
    validateOnChange: validationForm.validateOnChange,
    validateOnSubmit: validationForm.validateOnSubmit,
    requiredMessage: validationForm.requiredMessage || '',
    customRules,
  }

  const logicConfig = {
    rules: logicRules,
  }

  const requestConfig = {
    enable: requestForm.enable,
    method: requestForm.method || 'post',
    url: requestForm.url || '',
    triggerEvents: requestForm.triggerEvents.length ? [...requestForm.triggerEvents] : ['manual'],
    watchFields: fromCommaText(requestForm.watchFieldsText),
    showManualButton: requestForm.showManualButton,
    buttonText: requestForm.buttonText || '',
    params,
    headers,
    body,
    responsePath: requestForm.responsePath || '',
    outputMappings,
    successMessage: requestForm.successMessage || '',
    errorMessage: requestForm.errorMessage || '',
  }

  const businessFunctionConfig = {
    enable: businessForm.enable,
    functions,
  }

  if (currentPreset.value === 'booking') {
    businessFunctionConfig.bookingConfig = {
      scopeType: bookingForm.scopeType || 'future',
      scopeDays: Number(bookingForm.scopeDays ?? 0),
      fixedDate: bookingForm.fixedDate || '',
      advanceDays: Number(bookingForm.advanceDays ?? 0),
      items: parseJsonText(bookingForm.itemsText, '预约项目 items', []),
    }
  }

  if (currentPreset.value === 'leave') {
    businessFunctionConfig.leaveConfig = {
      allowHalfDay: leaveForm.allowHalfDay,
      maxDays: Number(leaveForm.maxDays ?? 0),
      noticeText: leaveForm.noticeText || '',
    }
  }

  const containerConfig = {
    type: containerForm.type || 'inline',
    title: containerForm.title || '',
    width: Number(containerForm.width ?? 720),
    triggerMode: containerForm.triggerMode || 'button',
    triggerText: containerForm.triggerText || '打开表单',
    closeOnSubmit: containerForm.closeOnSubmit,
    destroyOnClose: containerForm.destroyOnClose,
    openEvents: ['manual'],
  }

  const moduleConfig = {
    mode: moduleForm.mode || 'single',
    modules,
  }

  const dataBridgeConfig = {
    bridges,
  }

  return {
    schema,
    uiSchema,
    validationConfig,
    logicConfig,
    requestConfig,
    businessFunctionConfig,
    containerConfig,
    moduleConfig,
    dataBridgeConfig,
    defaultValue,
  }
}

const syncDraftMapFromForms = () => {
  const sectionMap = buildSectionMapFromForms()
  SECTION_KEYS.forEach((key) => {
    draftMap[key] = safeStringify(sectionMap[key], '{}')
  })
}

const syncFormsFromJson = () => {
  const parsedMap = {}
  jsonSections.forEach((section) => {
    parsedMap[section.key] = parseJsonText(draftMap[section.key], section.label, {})
  })

  const snapshot = cloneValue(getPropsBucket(), {})
  Object.assign(snapshot, parsedMap)

  schemaForm.title = snapshot.schema?.title || ''
  schemaForm.description = snapshot.schema?.description || ''
  schemaForm.requiredText = toCommaText(snapshot.schema?.required)
  schemaForm.propertiesText = safeStringify(snapshot.schema?.properties || {})

  uiSchemaForm.renderer = snapshot.uiSchema?.renderer || ''
  const uiFields = cloneValue(snapshot.uiSchema || {})
  delete uiFields.renderer
  uiSchemaForm.fieldsText = safeStringify(uiFields)

  validationForm.enableJsonSchema = snapshot.validationConfig?.enableJsonSchema !== false
  validationForm.validateOnChange = snapshot.validationConfig?.validateOnChange !== false
  validationForm.validateOnSubmit = snapshot.validationConfig?.validateOnSubmit !== false
  validationForm.requiredMessage = snapshot.validationConfig?.requiredMessage || ''
  validationForm.customRulesText = safeStringify(snapshot.validationConfig?.customRules || [], '[]')

  logicForm.rulesText = safeStringify(snapshot.logicConfig?.rules || [], '[]')

  requestForm.enable = Boolean(snapshot.requestConfig?.enable)
  requestForm.method = snapshot.requestConfig?.method || 'post'
  requestForm.url = snapshot.requestConfig?.url || ''
  requestForm.triggerEvents = Array.isArray(snapshot.requestConfig?.triggerEvents) && snapshot.requestConfig.triggerEvents.length
    ? [...snapshot.requestConfig.triggerEvents]
    : ['manual']
  requestForm.watchFieldsText = toCommaText(snapshot.requestConfig?.watchFields)
  requestForm.showManualButton = Boolean(snapshot.requestConfig?.showManualButton)
  requestForm.buttonText = snapshot.requestConfig?.buttonText || ''
  requestForm.paramsText = safeStringify(snapshot.requestConfig?.params || {})
  requestForm.headersText = safeStringify(snapshot.requestConfig?.headers || {})
  requestForm.bodyText = safeStringify(snapshot.requestConfig?.body || {})
  requestForm.responsePath = snapshot.requestConfig?.responsePath || ''
  requestForm.outputMappingsText = safeStringify(snapshot.requestConfig?.outputMappings || [], '[]')
  requestForm.successMessage = snapshot.requestConfig?.successMessage || ''
  requestForm.errorMessage = snapshot.requestConfig?.errorMessage || ''

  businessForm.enable = Boolean(snapshot.businessFunctionConfig?.enable)
  businessForm.functionsText = safeStringify(snapshot.businessFunctionConfig?.functions || [], '[]')

  const bookingConfig = snapshot.businessFunctionConfig?.bookingConfig || {}
  bookingForm.scopeType = bookingConfig.scopeType || 'future'
  bookingForm.scopeDays = bookingConfig.scopeDays ?? 7
  bookingForm.fixedDate = bookingConfig.fixedDate || ''
  bookingForm.advanceDays = bookingConfig.advanceDays ?? 0
  bookingForm.itemsText = safeStringify(bookingConfig.items || [], '[]')

  const leaveConfig = snapshot.businessFunctionConfig?.leaveConfig || {}
  leaveForm.allowHalfDay = Boolean(leaveConfig.allowHalfDay)
  leaveForm.maxDays = leaveConfig.maxDays ?? 30
  leaveForm.noticeText = leaveConfig.noticeText || ''

  containerForm.type = snapshot.containerConfig?.type || 'inline'
  containerForm.title = snapshot.containerConfig?.title || ''
  containerForm.width = snapshot.containerConfig?.width ?? 720
  containerForm.triggerMode = snapshot.containerConfig?.triggerMode || 'button'
  containerForm.triggerText = snapshot.containerConfig?.triggerText || '打开表单'
  containerForm.closeOnSubmit = snapshot.containerConfig?.closeOnSubmit !== false
  containerForm.destroyOnClose = Boolean(snapshot.containerConfig?.destroyOnClose)

  moduleForm.mode = snapshot.moduleConfig?.mode || 'single'
  moduleForm.modulesText = safeStringify(snapshot.moduleConfig?.modules || [], '[]')

  bridgeForm.bridgesText = safeStringify(snapshot.dataBridgeConfig?.bridges || [], '[]')
  defaultValueForm.text = safeStringify(snapshot.defaultValue || {})
}

const openEditor = () => {
  if (props.disabled) return
  errorMessage.value = ''
  activeView.value = 'common'
  activeJsonSectionKey.value = 'schema'
  activeCommonSectionKey.value = 'basic'
  setFormState()
  syncDraftMapFromForms()
  visible.value = true
}

watch(activeView, (nextView, prevView) => {
  if (!visible.value || nextView === prevView || isSyncingView.value) {
    return
  }

  try {
    if (nextView === 'json') {
      syncDraftMapFromForms()
      return
    }

    if (prevView === 'json' && nextView === 'common') {
      syncFormsFromJson()
    }
  } catch {
    isSyncingView.value = true
    activeView.value = 'json'
    isSyncingView.value = false
    Message.error(errorMessage.value || 'JSON 配置格式不正确，无法切回常用配置')
  }
})

const applyExample = () => {
  draftMap[activeJsonSection.value.key] = activeJsonSection.value.example
  try {
    syncFormsFromJson()
    errorMessage.value = ''
  } catch {
    Message.error(errorMessage.value || '示例 JSON 格式错误')
  }
}

const handleConfirm = (done) => {
  try {
    const mergedConfig = activeView.value === 'json'
      ? jsonSections.reduce((result, section) => {
          result[section.key] = parseJsonText(draftMap[section.key], section.label, {})
          return result
        }, {})
      : buildSectionMapFromForms()

    const target = ensurePropsBucket()
    if (!target) {
      throw new Error('缺少组件配置上下文')
    }
    Object.assign(target, mergedConfig)
    errorMessage.value = ''
    done(true)
  } catch {
    Message.error(errorMessage.value || '配置格式不正确')
    done(false)
  }
}
</script>

<style scoped lang="scss">
.q-json-schema-config-editor {
  width: 100%;
}

.q-json-schema-config-editor__trigger {
  display: flex;
  gap: 4px;
  width: 100%;
}

.q-json-schema-config-editor__trigger-button {
  display: inline-flex;
  flex: 0 0 32px;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: rgb(var(--primary-6));
  color: #fff;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background: rgb(var(--primary-5));
  }

  &:focus-visible {
    outline: 2px solid rgb(var(--primary-3));
    outline-offset: 2px;
  }

  &:disabled {
    background: var(--color-fill-3);
    color: var(--color-text-4);
    cursor: not-allowed;
  }
}

.q-json-schema-config-editor__trigger-input {
  flex: 1;
  min-width: 0;
  cursor: pointer;

  :deep(.arco-input) {
    cursor: pointer;
  }
}

.q-json-schema-config-editor__layout {
  display: grid;
  gap: 12px;
  min-height: 620px;
}

.q-json-schema-config-editor__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.q-json-schema-config-editor__common-shell {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 12px;
  min-height: 560px;
}

.q-json-schema-config-editor__common-menu,
.q-json-schema-config-editor__common {
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: #fff;
}

.q-json-schema-config-editor__common-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

.q-json-schema-config-editor__common-item {
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: #fff;
  color: #1d2129;
  cursor: pointer;
  padding: 10px 12px;
  text-align: left;
  transition: all 0.2s ease;
}

.q-json-schema-config-editor__common-item:hover {
  border-color: rgb(var(--primary-4));
  background: rgb(var(--primary-1));
}

.q-json-schema-config-editor__common-item.is-active {
  border-color: rgb(var(--primary-6));
  background: rgb(var(--primary-1));
  color: rgb(var(--primary-6));
}

.q-json-schema-config-editor__common {
  display: grid;
  max-height: 560px;
  overflow: auto;
  padding: 12px;
}

.q-json-schema-config-editor__group,
.q-json-schema-config-editor__guide-card,
.q-json-schema-config-editor__json-menu,
.q-json-schema-config-editor__json-panel {
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: #fff;
}

.q-json-schema-config-editor__group,
.q-json-schema-config-editor__guide-card {
  padding: 12px;
}

.q-json-schema-config-editor__group-title {
  margin-bottom: 12px;
  color: #1d2129;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}

.q-json-schema-config-editor__json {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 12px;
  min-height: 560px;
}

.q-json-schema-config-editor__json-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

.q-json-schema-config-editor__json-item {
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: #fff;
  color: #1d2129;
  cursor: pointer;
  padding: 10px 12px;
  text-align: left;
  transition: all 0.2s ease;
}

.q-json-schema-config-editor__json-item:hover {
  border-color: rgb(var(--primary-4));
  background: rgb(var(--primary-1));
}

.q-json-schema-config-editor__json-item.is-active {
  border-color: rgb(var(--primary-6));
  background: rgb(var(--primary-1));
  color: rgb(var(--primary-6));
}

.q-json-schema-config-editor__json-panel {
  display: grid;
  gap: 12px;
  padding: 12px;
}

.q-json-schema-config-editor__guide {
  display: grid;
  gap: 12px;
}

.q-json-schema-config-editor__guide-block + .q-json-schema-config-editor__guide-block {
  margin-top: 16px;
}

.q-json-schema-config-editor__guide-subtitle {
  margin-bottom: 8px;
  color: #1d2129;
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.q-json-schema-config-editor__guide-text,
.q-json-schema-config-editor__guide-list {
  color: #4e5969;
  font-size: 13px;
  line-height: 22px;
}

.q-json-schema-config-editor__tips {
  margin: 0;
}

.q-json-schema-config-editor__textarea {
  :deep(.arco-textarea-wrapper) {
    font-family: Consolas, Monaco, monospace;
  }
}

.q-json-schema-config-editor__error {
  color: #f53f3f;
  font-size: 12px;
  line-height: 18px;
}

@media (max-width: 1200px) {
  .q-json-schema-config-editor__common-shell,
  .q-json-schema-config-editor__json {
    grid-template-columns: minmax(0, 1fr);
  }

  .q-json-schema-config-editor__common-menu,
  .q-json-schema-config-editor__json-menu {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
