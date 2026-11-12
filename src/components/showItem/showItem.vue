<template>
  <div v-if="showEdit"
    :id="comDes.type == 'ROW' || comDes.type == 'SUBFORM' || comDes.type == 'TITLE' || comDes.type == 'JSON_SCHEMA' || comDes.type == 'SPLIT_LINE' || comDes.type == 'HR' || comDes.type == 'BUTTON_CONNECTOR' ? 'other' : comDes.type == 'ROW' ? 'others' : ''">
    <div :class="['box', 'field-item', { active: activeForm.id == comDes.id }]"
      :style="comDes.type === 'SPLIT_LINE' ? 'padding: 0 ' : ''" @click.stop="handleClick"
      :id="comDes.type == 'ROW' || comDes.type == 'SUBFORM' || comDes.type == 'JSON_SCHEMA' || comDes.type == 'EDITORS' || comDes.type == 'TITLE' || comDes.type == 'SPLIT_LINE' || comDes.type == 'HR' || comDes.type == 'BUTTON_CONNECTOR' ? 'other' : comDes.type == 'ROW' ? 'others' : ''">
      <a-form-item :required="comDes.props.required" :hide-label="formConfs.titleStyle == 'hide'"
        validate-trigger="blur"
        v-if="comDes.type !== 'ROW' && comDes.type !== 'EDITORS' && comDes.type !== 'TITLE' && comDes.type !== 'JSON_SCHEMA' && comDes.type !== 'SPLIT_LINE' && comDes.type !== 'HR' && comDes.type !== 'BUTTON_CONNECTOR'"
        :label="comDes.title">
        <div class="form-item-body">
          <div v-if="safeFieldDesc" class="des field-hint" v-html="safeFieldDesc" />
          <component :is="comDes.component" v-bind="dynamicComponentProps" />
        </div>
      </a-form-item>
      <component
        :id="comDes.type == 'ROW' || comDes.type == 'SUBFORM' || comDes.type == 'JSON_SCHEMA' || comDes.type == 'EDITORS' || comDes.type == 'TITLE' || comDes.type == 'SPLIT_LINE' || comDes.type == 'HR' || comDes.type == 'BUTTON_CONNECTOR' ? 'other' : comDes.type == 'ROW' ? 'others' : ''"
        :is="comDes.component" v-else v-bind="dynamicComponentProps" />

      <div class="des field-hint" v-if="safeFieldDesc && isBlockField && comDes.type !== 'EDITORS'"
        v-html="safeFieldDesc" />
      <div class="box-btns field-actions">
        <button type="button" title='上移' class="field-action-btn move" v-if="newIndex !== 0" @click.stop="onItem">
          <i class="fas fa-arrow-up" aria-hidden="true" />
        </button>
        <button type="button" title="下移" class="field-action-btn move" v-if="newIndex + 1 !== list.length"
          @click.stop="upItem">
          <i class="fas fa-arrow-down" aria-hidden="true" />
        </button>
        <button type="button" title="复制" class="field-action-btn move" @click.stop="copyItem">
          <i class="fas fa-copy" aria-hidden="true" />
        </button>
        <button type="button" title="删除" class="field-action-btn" @click.stop="deleteItem">
          <i class="fas fa-trash-alt" aria-hidden="true" />
        </button>
      </div>

    </div>
  </div>
  <div v-if="!showEdit">
    <div :class="[comDes.type == 'ROW' ? '' : 'boxs box', { 'hide-field-prompt': shouldHideDisabledPrompt }]"
      :style="comDes.type === 'SPLIT_LINE' ? 'padding:0 ' : ''">
      <a-form-item :field="comDes.id" :required="comDes.props.required" :hide-label="formConfs.titleStyle == 'hide'"
        v-if="comDes.type !== 'ROW' && comDes.type !== 'EDITORS' && comDes.type !== 'TITLE' && comDes.type !== 'SPLIT_LINE' && comDes.type !== 'HR' && comDes.type !== 'BUTTON_CONNECTOR' && comDes.type !== 'JSON_SCHEMA'"
        :label="comDes.title">
        <div class="form-item-body">
          <div v-if="safeFieldDesc" class="des field-hint" v-html="safeFieldDesc" />
          <component :is="comDes.component" v-bind="dynamicComponentProps" />
        </div>
      </a-form-item>
      <component v-else :is="comDes.component" v-bind="dynamicComponentProps" />
      <div class="des field-hint" v-if="safeFieldDesc && isBlockField && comDes.type !== 'EDITORS'"
        v-html="safeFieldDesc" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, inject, watch, computed } from 'vue';
import { executeFieldScript } from '@/utils/fieldScriptExecutor';
import { sanitizeHtml } from '@/utils/sanitizeHtml';
const props = defineProps<{
  comDes: any,
  newIndex: any,
  list: any,
  showEdit: any,
  deptList: any,
  formConfs: any,
  activeForm: any,
}>()

const hideDisabledFieldPrompt = inject<boolean>('hideDisabledFieldPrompt', false)
const shouldHideDisabledPrompt = computed(() =>
  hideDisabledFieldPrompt && Boolean(props.comDes?.props?.disabled),
)

const fieldDesc = computed(() => {
  const desc = props.comDes?.props?.desc
  if (!desc) return ''
  const text = String(desc).replace(/<[^>]*>/g, '').trim()
  return text ? String(desc) : ''
})
const safeFieldDesc = computed(() => sanitizeHtml(fieldDesc.value))

const dynamicComponentProps = computed(() => {
  const commonProps = {
    comDes: props.comDes,
    showEdit: props.showEdit,
    formConfs: props.formConfs,
  }

  // qInput renders multiple root nodes and only declares the common props.
  // Do not forward unrelated designer context as fallthrough attributes.
  if (String(props.comDes?.component ?? '').toLowerCase() === 'qinput') {
    return commonProps
  }

  return {
    ...commonProps,
    deptList: props.deptList,
    newIndex: props.newIndex,
    list: props.list,
    activeForm: props.activeForm,
  }
})

const isBlockField = computed(() =>
  ['ROW', 'EDITORS', 'TITLE', 'SPLIT_LINE', 'HR', 'BUTTON_CONNECTOR'].includes(props.comDes?.type),
)

// 注入父组件的数据加载状态锁
// 如果父组件未提供，则使用本地 ref 作为降级方案
const providedLoading = inject<{ value: boolean }>('isDataLoading', undefined)
const localLoading = ref(false)
const isDataLoading = providedLoading || { value: false }

// 显式声明 inheritAttrs 为 false，防止属性自动继承到根节点
defineOptions({
  inheritAttrs: false
})

const provideState = inject<{
  handleClick: (...args: any) => void;
  copyItem: (...args: any) => void;
  deleteItem: (...args: any) => void;
  drawingItemon: (...args: any) => void;
  drawingItemup: (...args: any) => void;
  getPropsItem: (...args: any) => void;
  setPropsItem: (...args: any) => void;
  filterData: (...args: any) => void;
} | null>("provideDesigner", null);

const handleClick = () => {
  provideState?.handleClick(props.comDes)
}
const copyItem = () => {
  provideState?.copyItem(props.comDes, props.list)
}
const deleteItem = () => {
  provideState?.deleteItem(props.newIndex, props.list)
}
const onItem = () => {
  provideState?.drawingItemon(props.newIndex, props.list, props.comDes)
}
const upItem = () => {
  provideState?.drawingItemup(props.newIndex, props.list, props.comDes)
}

const inputItem = async (value: unknown, oldValue: unknown) => {
  const script = props.comDes?.method?.input
  if (script) {
    try {
      await executeFieldScript(script, {
        field: props.comDes,
        formConfs: props.formConfs,
        value,
        oldValue,
        provideState,
      })
    } catch {
      // 执行器已输出包含字段信息的错误日志，字段联动仍继续执行
    }
  }
  if (!props.showEdit && provideState?.filterData) {
    provideState.filterData(props.comDes)
  }
}

// 监听 comDes.props.value 变化
watch(() => props.comDes?.props?.value, (newValue, oldValue) => {
  // 只在值真正变化且不在数据初始化加载阶段时执行，避免重复请求
  const loadingState = isDataLoading?.value ?? false
  if (newValue !== oldValue && !loadingState) {
    void inputItem(newValue, oldValue)
  }
}, { deep: true })
</script>
<style lang="scss" scoped>
@use '@/styles/form-controls.scss' as formControls;

.box,
.boxs {
  @include formControls.unified-form-controls-deep;

  :deep(.arco-form-item) {
    margin-bottom: 0;

    .arco-input[disabled],
    .arco-picker-disabled input[disabled],
    .arco-picker-disabled:hover input[disabled],
    .arco-textarea[disabled],
    .arco-radio-disabled .arco-radio-label,
    .arco-checkbox-disabled .arco-checkbox-label {
      -webkit-text-fill-color: var(--color-text-1);
      ;
    }

    .is-disabled {
      -webkit-text-fill-color: var(--color-text-1);
      ;
      background: #f8fafc !important;
    }
  }

}

.box {
  padding: 16px 32px;
  border: none;
  border-bottom: 1px solid #f1f5f9;
  border-left: 3px solid transparent;
  border-radius: 0;
  position: relative;
  overflow: visible;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    background: #f8fafc;

    .box-btns {
      display: flex;
    }
  }

  .items {
    background-color: transparent;

    .box {
      border-color: transparent;
    }
  }

  :deep(.arco-form-item-label-col) {
    margin-bottom: 6px;
  }

  :deep(.arco-form-item-label) {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    line-height: 1.4;
  }

  :deep(.arco-form-item-label-required-symbol) {
    color: #ef4444;
  }

  :deep(.arco-form-item-content) {
    p {
      margin: 0 !important;
    }
  }

  .form-item-body {
    width: 100%;

    .des {}

  }

  .des.field-hint {
    font-size: 12px;
    color: #94a3b8;
    line-height: 1.5;
    margin: 0 0 6px;
  }

  .des.field-hint:empty {
    display: none;
  }

  .box-btns {
    position: absolute;
    top: 5px;
    right: 12px;
    z-index: 110;
    display: none;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    padding: 0;
    background: transparent;
    box-shadow: none;
  }

  .field-action-btn {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: #fff;
    color: #64748b;
    cursor: pointer;
    font-size: 11px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    padding: 0;
    transition: all 0.15s;

    &.move:hover {
      color: rgb(var(--primary-6));
      background: #eff6ff;
    }

    &:not(.move):hover {
      color: #ef4444;
      background: #fef2f2;
    }
  }
}

.active {
  background: #eff6ff !important;
  border-left-color: rgb(var(--primary-6)) !important;
  // padding-left: 29px !important;
}

.boxs {
  &:hover {
    background: rgba(0, 0, 0, 0);
  }
}

.hide-field-prompt {
  :deep(.arco-form-item-message) {
    display: none;
  }

  :deep(input::placeholder),
  :deep(textarea::placeholder) {
    color: transparent !important;
    -webkit-text-fill-color: transparent !important;
  }

  :deep(.arco-select-view-placeholder),
  :deep(.placeholder) {
    visibility: hidden;
  }
}
</style>
