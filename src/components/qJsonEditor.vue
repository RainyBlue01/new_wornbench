<template>
  <div class="q-json-editor">
    <div v-if="showSchemaHelp" class="q-json-editor__toolbar">
      <a-button type="text" size="mini" @click="helpVisible = true">配置说明</a-button>
    </div>
    <a-textarea
      v-model="jsonText"
      :auto-size="{ minRows: minRows, maxRows: maxRows }"
      :disabled="disabled"
      :placeholder="placeholder"
      @blur="commitJson"
    />
    <div v-if="errorMessage" class="q-json-editor__error">{{ errorMessage }}</div>

    <a-modal
      v-model:visible="helpVisible"
      title="JSON Schema业务组件配置说明"
      width="760px"
      :footer="false"
      :mask-closable="true"
    >
      <div class="q-json-editor__help">
        <a-alert type="info" show-icon>
          <template #title>配置关系</template>
          <template #default>
            schema 定义字段和基础校验，uiSchema 定义字段展示方式，validationConfig 定义整体验证策略，businessFunctionConfig 定义预约/请假等业务外观配置，defaultValue 定义初始值。无需依赖预设时，可通过 uiSchema.renderer 或 schema.xRenderer 指定 booking / leave 渲染器。
          </template>
        </a-alert>

        <a-collapse :default-active-key="activeHelpKeys" expand-icon-position="right">
          <a-collapse-item key="schema" header="表单Schema">
            <p>用于描述业务对象的数据结构。根节点通常是 type: object，properties 下每个 key 是一个业务字段，required 数组声明必填字段。</p>
            <ul>
              <li>type：字段类型，支持 string、number、integer、boolean、array、object。</li>
              <li>title：字段显示名称。</li>
              <li>description：字段说明，也会作为默认占位提示。</li>
              <li>default：字段默认值。</li>
              <li>enum：可选值数组，配置后默认渲染为下拉选择。</li>
              <li>xRenderer：可指定 booking、leave 等业务渲染器。</li>
            </ul>
            <pre>{{ schemaExample }}</pre>
          </a-collapse-item>

          <a-collapse-item key="uiSchema" header="表单UI配置">
            <p>用于补充每个字段的前端展示配置，不改变字段实际数据结构。</p>
            <ul>
              <li>renderer：根级渲染器标识，可配置 booking、leave。</li>
              <li>component：指定字段渲染组件，支持 input、textarea、number、switch、select、radio、date、dateRange。</li>
              <li>placeholder：输入提示文案。</li>
              <li>options：当字段不是 enum，但仍需要下拉选项时可配置 label/value 数组。</li>
            </ul>
            <pre>{{ uiSchemaExample }}</pre>
          </a-collapse-item>

          <a-collapse-item key="validationConfig" header="校验配置">
            <p>用于描述组件级校验策略。字段级基础校验优先放在 schema 中，组件级提示和自定义规则放在这里。</p>
            <pre>{{ validationExample }}</pre>
          </a-collapse-item>

          <a-collapse-item key="logicConfig" header="逻辑联动配置">
            <p>用于声明组件内部字段变化后的联动行为，可兼容本地组件的显隐、必填切换和自动赋值思路。</p>
            <pre>{{ logicExample }}</pre>
          </a-collapse-item>

          <a-collapse-item key="businessFunctionConfig" header="业务组件配置">
            <p>用于配置预约组件、请假组件等业务外观信息。即使不选择业务预设，只要 renderer + bookingConfig 配齐，也可以得到预约组件。</p>
            <pre>{{ businessFunctionExample }}</pre>
          </a-collapse-item>

          <a-collapse-item key="defaultValue" header="默认值">
            <p>默认值必须是对象，key 要和 schema.properties 中的字段 key 保持一致。</p>
            <pre>{{ defaultValueExample }}</pre>
          </a-collapse-item>
        </a-collapse>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, shallowRef, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: any
  disabled?: boolean
  placeholder?: string
  minRows?: number
  maxRows?: number
  comDes?: any
  formData?: any
}>(), {
  modelValue: undefined,
  disabled: false,
  placeholder: '请输入JSON配置',
  minRows: 6,
  maxRows: 16,
  comDes: undefined,
  formData: undefined,
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: any): void
}>()

const jsonText = ref('')
const errorMessage = ref('')
const helpVisible = shallowRef(false)

const helpFields = new Set(['schema', 'uiSchema', 'validationConfig', 'logicConfig', 'businessFunctionConfig', 'defaultValue'])
const showSchemaHelp = computed(() => props.comDes?.type === 'JSON_SCHEMA' && helpFields.has(props.formData?.field))
const activeHelpKeys = computed(() => props.formData?.field ? [props.formData.field] : ['schema'])

const schemaExample = `{
  "type": "object",
  "xRenderer": "booking",
  "required": ["bookingItemId", "bookingDate", "contactName"],
  "properties": {
    "bookingItemId": { "type": "string", "title": "预约项目" },
    "bookingDate": { "type": "string", "title": "预约日期", "format": "date" },
    "contactName": { "type": "string", "title": "联系人", "maxLength": 20 },
    "remark": { "type": "string", "title": "备注", "format": "textarea" }
  }
}`

const uiSchemaExample = `{
  "renderer": "booking",
  "contactName": {
    "component": "input",
    "placeholder": "请输入联系人"
  },
  "remark": {
    "component": "textarea",
    "placeholder": "请输入备注"
  }
}`

const validationExample = `{
  "enableJsonSchema": true,
  "requiredMessage": "该业务组件不能为空",
  "customRules": [
    { "field": "contactPhone", "pattern": "^1[3-9]\\\\d{9}$", "message": "联系电话格式不正确" }
  ]
}`

const logicExample = `{
  "rules": [
    {
      "when": { "field": "bookingItemId", "operator": "notEmpty" },
      "effects": [
        { "type": "show", "target": "remark" },
        { "type": "setRequired", "target": "remark", "value": true }
      ]
    }
  ]
}`

const businessFunctionExample = `{
  "bookingConfig": {
    "scopeType": "futureDays",
    "scopeDays": 7,
    "advanceDays": 1,
    "items": [
      {
        "id": "booking_item_1",
        "name": "预约项目1",
        "desc": "可步行预约（可多选）",
        "bookingType": "time",
        "maxPerSlot": 10,
        "timeSlots": ["09:00-10:00", "10:00-11:00"]
      }
    ]
  }
}`

const defaultValueExample = `{
  "bookingItemId": "",
  "bookingDate": "",
  "contactName": "",
  "remark": ""
}`

const stringifyValue = (value: any) => {
  if (value === undefined || value === '') return ''
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

watch(
  () => props.modelValue,
  (value) => {
    jsonText.value = stringifyValue(value)
    errorMessage.value = ''
  },
  { immediate: true, deep: true },
)

const commitJson = () => {
  const text = jsonText.value.trim()
  if (!text) {
    emit('update:modelValue', {})
    errorMessage.value = ''
    return
  }
  try {
    emit('update:modelValue', JSON.parse(text))
    errorMessage.value = ''
  } catch (error: any) {
    errorMessage.value = error?.message || 'JSON格式不正确'
  }
}
</script>

<style scoped lang="scss">
.q-json-editor {
  width: 100%;
}

.q-json-editor__toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 6px;
}

.q-json-editor__error {
  margin-top: 6px;
  color: #f53f3f;
  font-size: 12px;
  line-height: 18px;
}

.q-json-editor__help {
  display: grid;
  gap: 14px;

  p {
    color: #4e5969;
    font-size: 13px;
    line-height: 20px;
    margin: 0 0 8px;
  }

  ul {
    color: #4e5969;
    font-size: 13px;
    line-height: 22px;
    margin: 0 0 10px;
    padding-left: 18px;
  }

  pre {
    background: #f7f8fa;
    border: 1px solid #e5e6eb;
    border-radius: 4px;
    color: #1d2129;
    font-size: 12px;
    line-height: 18px;
    margin: 0;
    overflow: auto;
    padding: 10px 12px;
    white-space: pre-wrap;
  }
}
</style>
