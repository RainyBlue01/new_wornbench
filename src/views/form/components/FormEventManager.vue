<script setup lang="ts">
import { computed, nextTick, reactive, shallowRef, useTemplateRef } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import type { FormEventConfig as RuntimeFormEventConfig } from '@/composables/useFormEvents'
import {
  flattenPluginFormFields,
  type PluginFormFieldOption,
} from '@/utils/pluginParameterMapping'
import SeeModel from './seeModel.vue'
import FormEventFieldPanel from './FormEventFieldPanel.vue'

type TriggerType = 'submit' | 'change'

interface CodeFormEventConfig extends RuntimeFormEventConfig {
  description?: string
  trigger: TriggerType
  enabled: boolean
  status?: 'on' | 'off'
  code: string
  eventType?: 'code'
}

const props = defineProps<{
  formConfs: Record<string, any>
  formList: any[]
}>()

const drawerVisible = shallowRef(false)
const editorVisible = shallowRef(false)
const debugging = shallowRef(false)
const editingId = shallowRef('')
const fieldPanelVisible = shallowRef(true)
const codeEditorRef = useTemplateRef<HTMLTextAreaElement>('codeEditor')
const previewRef = useTemplateRef<InstanceType<typeof SeeModel>>('preview')

const draft = reactive<CodeFormEventConfig>({
  id: '',
  name: '',
  description: '',
  trigger: 'submit',
  triggerField: '',
  enabled: true,
  status: 'on',
  code: '',
  eventType: 'code',
})

const eventList = computed<CodeFormEventConfig[]>(() => {
  if (!Array.isArray(props.formConfs.formEvents)) props.formConfs.formEvents = []
  return props.formConfs.formEvents
})

const formFields = computed<PluginFormFieldOption[]>(() => {
  const source = Array.isArray(props.formList) && props.formList.length
    ? props.formList
    : props.formConfs.formList
  return flattenPluginFormFields(Array.isArray(source) ? source : [])
})

const editorTitle = computed(() => editingId.value ? '编辑表单事件' : '新建表单事件')

function buildCodeTemplate() {
  const sourceField = formFields.value[0]
  const targetField = formFields.value[1] || sourceField
  const sourceId = sourceField?.id || 'sourceFieldId'
  const targetId = targetField?.id || 'targetFieldId'
  const sourceName = sourceField?.label || '来源字段'
  return `// ============================================================
// 表单事件 API 示例
// 可用变量：formData（表单数据）、fields（字段列表）、rules（校验规则）、formApi（表单控制 API）
// 以下 API 示例默认已注释，按需取消注释即可使用，不会在调试时意外修改表单配置。
// ============================================================

const sourceFieldId = '${sourceId}';
const targetFieldId = '${targetId}';

// 1. 获取字段配置，找不到时返回 undefined
// const field = formApi.getField(sourceFieldId);

// 2. 显示字段
// formApi.showField(targetFieldId);

// 3. 隐藏字段（只隐藏，不清空字段值）
// formApi.hideField(targetFieldId);

// 4. 按条件设置字段显示状态，第二个参数 true 为显示、false 为隐藏
// formApi.setFieldVisible(targetFieldId, Boolean(formData[sourceFieldId]));

// 5. 获取字段当前校验规则，返回规则数组
// const currentRules = formApi.getFieldRules(targetFieldId);

// 6. 覆盖字段全部校验规则，可传单个规则对象或规则数组
// formApi.setFieldRules(targetFieldId, [
//   { required: true, message: '请填写${targetField?.label || '目标字段'}' },
//   { minLength: 2, message: '至少输入两个字符' },
// ]);

// 7. 在字段现有规则后追加一条规则
// formApi.addFieldRule(targetFieldId, {
//   match: /^[a-zA-Z0-9]+$/,
//   message: '只能输入字母和数字',
// });

// 8. 清空字段全部校验规则
// formApi.clearFieldRules(targetFieldId);

// 9. 修改字段必填状态，同时同步组件必填标识和 rules
// formApi.setFieldRequired(targetFieldId, true, '请填写${targetField?.label || '目标字段'}');
// formApi.setFieldRequired(targetFieldId, false);

// 10. 也可以直接读取或修改表单数据
// const sourceValue = formData[sourceFieldId];
// formData[targetFieldId] = sourceValue;

// 11. fields 和 rules 是原始响应式数据，也支持直接访问
// const fieldFromList = fields.find(item => String(item.id) === sourceFieldId);
// rules[targetFieldId] = [{ required: true, message: '该字段不能为空' }];

// 12. 返回错误会中止当前操作并显示错误信息
// return { error: '业务校验未通过' };

// ----------------------- 可直接运行的示例 -----------------------
const value = formData[sourceFieldId] || '';

if (!value) {
  return { error: '请填写${sourceName}' };
}

formData[targetFieldId] = value;

return { result: 'ok' };`
}

function resetDraft() {
  Object.assign(draft, {
    id: '',
    name: '',
    description: '',
    trigger: 'submit',
    triggerField: '',
    enabled: true,
    status: 'on',
    code: buildCodeTemplate(),
    eventType: 'code',
  })
  editingId.value = ''
}

function open() {
  drawerVisible.value = true
}

function createEvent() {
  resetDraft()
  fieldPanelVisible.value = true
  editorVisible.value = true
}

function editEvent(item: CodeFormEventConfig) {
  resetDraft()
  fieldPanelVisible.value = true
  editingId.value = String(item.id)
  Object.assign(draft, {
    ...item,
    trigger: item.trigger || 'submit',
    triggerField: item.triggerField || '',
    enabled: item.enabled !== false && item.status !== 'off',
    code: item.code || buildCodeTemplate(),
    eventType: 'code',
  })
  editorVisible.value = true
}

function closeEditor() {
  editorVisible.value = false
}

function updateEventSummary() {
  props.formConfs.formEvent = `当前表单${eventList.value.length}个事件`
}

function validateDraft() {
  if (!draft.name.trim()) {
    Message.warning('请输入事件描述')
    return false
  }
  if (draft.trigger === 'change' && !draft.triggerField) {
    Message.warning('请选择触发事件的表单字段')
    return false
  }
  if (!draft.code.trim()) {
    Message.warning('请输入事件代码')
    return false
  }
  return true
}

function saveEvent() {
  if (!validateDraft()) return
  const payload: CodeFormEventConfig = JSON.parse(JSON.stringify({
    id: editingId.value || String(Date.now()),
    name: draft.name.trim(),
    description: draft.name.trim(),
    trigger: draft.trigger,
    triggerField: draft.trigger === 'change' ? draft.triggerField : '',
    enabled: draft.enabled,
    status: draft.enabled ? 'on' : 'off',
    code: draft.code,
    eventType: 'code',
  }))
  const index = eventList.value.findIndex(item => String(item.id) === editingId.value)
  if (index >= 0) eventList.value.splice(index, 1, payload)
  else eventList.value.push(payload)
  updateEventSummary()
  editorVisible.value = false
  Message.success(editingId.value ? '事件已更新' : '事件已创建')
}

function toggleEvent(item: CodeFormEventConfig, value: boolean) {
  item.enabled = value
  item.status = value ? 'on' : 'off'
}

function removeEvent(item: CodeFormEventConfig) {
  Modal.confirm({
    title: '删除表单事件',
    content: `确定删除事件“${item.name}”吗？`,
    titleAlign: 'start',
    okText: '删除',
    cancelText: '取消',
    modalClass: 'form-event-delete-confirm',
    okButtonProps: { status: 'danger' },
    onBeforeOk: () => {
      const index = eventList.value.findIndex(event => String(event.id) === String(item.id))
      if (index >= 0) eventList.value.splice(index, 1)
      updateEventSummary()
      Message.success('事件已删除')
      return true
    },
  })
}

async function runPreview() {
  if (!validateDraft()) return
  debugging.value = true
  try {
    await previewRef.value?.openPreviewDrawer(draft)
    Message.success(
      draft.trigger === 'change'
        ? '请修改所选字段触发事件'
        : '请点击预览底部提交按钮触发事件',
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    Message.error(`代码执行异常：${message}`)
  } finally {
    debugging.value = false
  }
}

function insertTab() {
  const editor = codeEditorRef.value
  if (!editor) return
  const start = editor.selectionStart
  const end = editor.selectionEnd
  draft.code = `${draft.code.slice(0, start)}  ${draft.code.slice(end)}`
  void nextTick(() => {
    editor.selectionStart = editor.selectionEnd = start + 2
  })
}

function insertFieldId(fieldId: string) {
  const editor = codeEditorRef.value
  if (!editor) return
  const start = editor.selectionStart
  const end = editor.selectionEnd
  const content = `'${fieldId}'`
  draft.code = `${draft.code.slice(0, start)}${content}${draft.code.slice(end)}`
  void nextTick(() => {
    editor.focus()
    editor.selectionStart = editor.selectionEnd = start + content.length
  })
}

function triggerLabel(item: CodeFormEventConfig) {
  if (item.trigger === 'submit') return '表单提交'
  const field = formFields.value.find(option => option.id === String(item.triggerField || ''))
  return field ? `字段变化 · ${field.label}` : '字段变化'
}

defineExpose({ open })
</script>

<template>
  <Teleport to="body">
    <Transition name="event-drawer">
      <div v-if="drawerVisible" class="event-overlay" @click.self="drawerVisible = false">
        <section class="event-drawer" role="dialog" aria-modal="true" aria-label="表单事件">
          <header class="event-drawer__header">
            <h2>表单事件</h2>
            <button type="button" class="event-close" aria-label="关闭" @click="drawerVisible = false">
              <icon-close />
            </button>
          </header>

          <main class="event-drawer__body">
            <p class="event-intro">表单事件可在提交时触发插件逻辑，实现数据联动、自动填充等功能</p>
            <div v-if="eventList.length === 0" class="event-empty">
              <icon-thunderbolt class="event-empty__icon" />
              <p>暂无表单事件</p>
              <small>点击底部按钮新建</small>
            </div>
            <div v-else class="event-list">
              <article v-for="item in eventList" :key="item.id" class="event-list__item" @click="editEvent(item)">
                <div class="event-list__icon" aria-hidden="true">
                  <icon-code />
                </div>
                <div class="event-list__content">
                  <div class="event-list__title">
                    {{ item.name }}
                    <span class="event-status-tag" :class="{ 'event-status-tag--off': item.enabled === false }">
                      {{ item.enabled === false ? '停用' : '启用' }}
                    </span>
                  </div>
                  <div class="event-list__summary">代码事件 · {{ triggerLabel(item) }}</div>
                </div>
                <div class="event-list__actions" @click.stop>
                  <a-switch :model-value="item.enabled !== false" size="small"
                    @change="toggleEvent(item, Boolean($event))" />
                  <button type="button" class="event-text-button event-text-button--edit" @click="editEvent(item)">
                    编辑调试
                  </button>
                  <button type="button" class="event-text-button event-text-button--danger" @click="removeEvent(item)">
                    删除
                  </button>
                </div>
              </article>
            </div>
          </main>

          <footer class="event-drawer__footer">
            <button type="button" class="event-button event-button--ghost" @click="drawerVisible = false">取消</button>
            <button type="button" class="event-button event-button--primary" @click="createEvent">
              <icon-plus /> 新建事件
            </button>
          </footer>
        </section>
      </div>
    </Transition>

    <Transition name="event-drawer">
      <div v-if="editorVisible" class="event-overlay event-overlay--editor" @click.self="closeEditor">
        <section id="form-event-code-drawer" class="code-drawer" role="dialog" aria-modal="true"
          :aria-label="editorTitle">
          <header class="code-drawer__header">
            <h2><icon-code /> {{ editorTitle }}</h2>
            <button type="button" class="field-panel-toggle"
              :class="{ 'field-panel-toggle--active': fieldPanelVisible }"
              :aria-expanded="fieldPanelVisible" @click="fieldPanelVisible = !fieldPanelVisible">
              <icon-list /> 字段 ID
              <span>{{ formFields.length }}</span>
            </button>
            <button type="button" class="event-close" aria-label="关闭" @click="closeEditor">
              <icon-close />
            </button>
          </header>

          <div class="code-drawer__topbar">
            <div class="code-field-row">
              <label for="event-description">描述</label>
              <a-input id="event-description" v-model="draft.name" placeholder="例如：自动填充学生信息" />
            </div>
            <div class="code-field-row">
              <label for="event-trigger">触发</label>
              <a-select id="event-trigger" v-model="draft.trigger" class="code-trigger-select"
                popup-container="#form-event-code-drawer"
                :trigger-props="{ autoFitPosition: true, popupStyle: { zIndex: 30 } }">
                <a-option value="submit">表单提交</a-option>
                <a-option value="change">字段变化</a-option>
              </a-select>
              <a-select v-if="draft.trigger === 'change'" v-model="draft.triggerField" allow-search
                class="code-field-select" placeholder="选择字段" popup-container="#form-event-code-drawer"
                :trigger-props="{ autoFitPosition: true, popupStyle: { zIndex: 30 } }">
                <a-option v-for="field in formFields" :key="field.id" :value="field.id">
                  {{ field.label }}
                </a-option>
              </a-select>
            </div>
          </div>

          <div class="code-drawer__body">
            <div class="code-editor">
              <textarea ref="codeEditor" v-model="draft.code" spellcheck="false"
                aria-label="表单事件代码" @keydown.tab.prevent="insertTab" />
            </div>
            <FormEventFieldPanel v-if="fieldPanelVisible" :fields="formFields"
              @close="fieldPanelVisible = false" @insert="insertFieldId" />
          </div>

          <footer class="code-drawer__footer">
            <button type="button" class="event-button event-button--ghost" @click="closeEditor">取消</button>
            <button type="button" class="event-button event-button--success" :disabled="debugging"
              @click="runPreview">
              <icon-play-arrow /> {{ debugging ? '执行中' : '调试预览' }}
            </button>
            <button type="button" class="event-button event-button--primary" @click="saveEvent">
              <icon-save /> 保存事件
            </button>
          </footer>
        </section>
      </div>
    </Transition>

    <SeeModel ref="preview" :form-confs="formConfs" modal-class="form-event-preview-modal" />
  </Teleport>
</template>

<style scoped lang="scss">
:global(.arco-modal-container:has(.form-event-delete-confirm)),
:global(.arco-modal-container:has(.form-event-preview-modal)) {
  z-index: 100003 !important;
}

// The debug preview sits above the code drawer. Keep overlays opened from fields
// (date panels and personnel modals) one layer above the preview itself.
:global(body:has(.form-event-preview-modal) .arco-trigger-popup) {
  z-index: 100004 !important;
}

:global(body:has(.form-event-preview-modal) .arco-modal-container:has(.person-modal-wrap)) {
  z-index: 100004 !important;
}

.event-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  background: rgb(0 0 0 / 45%);
  backdrop-filter: blur(4px);
}

.event-overlay--editor {
  z-index: 100000;
}

.event-drawer-enter-active,
.event-drawer-leave-active {
  transition: opacity 0.3s;
}

.event-drawer-enter-active .event-drawer,
.event-drawer-leave-active .event-drawer,
.event-drawer-enter-active .code-drawer,
.event-drawer-leave-active .code-drawer {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.event-drawer-enter-from,
.event-drawer-leave-to {
  opacity: 0;
}

.event-drawer-enter-from .event-drawer,
.event-drawer-leave-to .event-drawer,
.event-drawer-enter-from .code-drawer,
.event-drawer-leave-to .code-drawer {
  transform: translateY(100%);
}

.event-drawer,
.code-drawer {
  display: flex;
  width: 100%;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
  background: #fff;
  box-shadow: 0 -8px 40px rgb(0 0 0 / 15%);
}

.event-drawer {
  height: 95vh;
  max-height: 95vh;
}

.code-drawer {
  height: 92vh;
  max-height: 92vh;
}

.event-drawer__header,
.code-drawer__header {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.event-drawer__header h2,
.code-drawer__header h2 {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 600;
}

.code-drawer__header h2 svg {
  color: #3b82f6;
}

.field-panel-toggle {
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-left: auto;
  background: #fff;
  color: #64748b;
  font-size: 12px;
  cursor: pointer;
}

.field-panel-toggle:hover,
.field-panel-toggle--active {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #2563eb;
}

.field-panel-toggle span {
  min-width: 18px;
  padding: 1px 5px;
  border-radius: 10px;
  background: #e2e8f0;
  color: #64748b;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
}

.field-panel-toggle--active span {
  background: #dbeafe;
  color: #2563eb;
}

.code-drawer__header .event-close {
  margin-left: 8px;
}

.event-close {
  display: inline-grid;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  margin-left: auto;
  background: #f8fafc;
  color: #94a3b8;
  cursor: pointer;
  place-items: center;
}

.event-close:hover {
  background: #f1f5f9;
  color: #64748b;
}

.event-drawer__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
}

.event-intro {
  margin: 0 0 16px;
  color: #94a3b8;
  font-size: 13px;
}

.event-empty {
  padding: 48px 20px;
  color: #94a3b8;
  text-align: center;
}

.event-empty__icon {
  margin-bottom: 12px;
  color: #cbd5e1;
  font-size: 40px;
}

.event-empty p {
  margin: 0;
  font-size: 14px;
}

.event-empty small {
  display: block;
  margin-top: 4px;
  color: #cbd5e1;
  font-size: 12px;
}

.event-list {
  display: grid;
  gap: 8px;
}

.event-list__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

.event-list__item:hover {
  border-color: #e2e8f0;
  background: #f8fafc;
}

.event-list__icon {
  display: grid;
  width: 36px;
  height: 36px;
  flex: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff;
  place-items: center;
}

.event-list__content {
  min-width: 0;
  flex: 1;
}

.event-list__title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
}

.event-status-tag {
  padding: 1px 6px;
  border-radius: 4px;
  background: #dcfce7;
  color: #16a34a;
  font-size: 11px;
  font-weight: 500;
}

.event-status-tag--off {
  background: #f1f5f9;
  color: #94a3b8;
}

.event-list__summary {
  overflow: hidden;
  margin-top: 2px;
  color: #94a3b8;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-list__actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
}

.event-text-button {
  padding: 4px 8px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  font-size: 12px;
  cursor: pointer;
}

.event-text-button--edit {
  color: #f59e0b;
}

.event-text-button--edit:hover {
  background: #fffbeb;
}

.event-text-button--danger {
  color: #94a3b8;
}

.event-text-button--danger:hover {
  background: #fef2f2;
  color: #ef4444;
}

.event-drawer__footer,
.code-drawer__footer {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 24px 20px;
  border-top: 1px solid #f1f5f9;
}

.event-button {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 9px 18px;
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
}

.event-button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.event-button--ghost {
  border-color: #e2e8f0;
  background: #f8fafc;
  color: #64748b;
}

.event-button--ghost:hover {
  background: #f1f5f9;
}

.event-button--primary {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff;
  box-shadow: 0 4px 12px rgb(59 130 246 / 20%);
}

.event-button--primary:hover {
  box-shadow: 0 6px 16px rgb(59 130 246 / 30%);
  transform: translateY(-1px);
}

.event-button--success {
  background: #10b981;
  color: #fff;
}

.event-button--success:hover {
  background: #059669;
}

.code-drawer__topbar {
  flex: none;
  padding: 12px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.code-field-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.code-field-row:last-child {
  margin-bottom: 0;
}

.code-field-row label {
  width: 56px;
  flex: none;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
}

.code-trigger-select,
.code-field-select {
  width: 180px;
}

.code-drawer__body {
  display: flex;
  min-height: 0;
  flex: 1;
  padding: 0 24px;
}

.code-editor {
  flex: 1;
  overflow: hidden;
  margin: 16px 0;
  border: 1px solid #1e293b;
  border-radius: 10px;
  background: #0f172a;
}

.code-editor textarea {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 16px;
  border: 0;
  outline: none;
  background: #0f172a;
  color: #e2e8f0;
  font-family: "Cascadia Code", "SFMono-Regular", Consolas, monospace;
  font-size: 14px;
  line-height: 1.7;
  resize: none;
  tab-size: 2;
}

@media (max-width: 720px) {
  .event-list__item {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .event-list__actions {
    width: 100%;
    justify-content: flex-end;
    padding-left: 48px;
  }

  .code-field-row {
    align-items: stretch;
    flex-wrap: wrap;
  }

  .code-field-row label {
    width: 100%;
  }

  .code-trigger-select,
  .code-field-select {
    width: calc(50% - 6px);
  }
}
</style>
