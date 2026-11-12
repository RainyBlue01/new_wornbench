<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import JsonSchemaFieldRenderer from './JsonSchemaFieldRenderer.vue'

const props = defineProps<{
  title?: string
  bookingScopeText?: string
  bookingItems: any[]
  selectedBookingItem?: any
  bookingResultItemName?: string
  bookingSlots: any[]
  bookingExtraFields: any[]
  model: Record<string, any>
  validationErrors: Record<string, string>
  isDisabled?: boolean
  isReadonly?: boolean
  bookingDateRequired?: boolean
  bookingSlotRequired?: boolean
}>()

const emit = defineEmits<{
  (event: 'update-field', key: string, value: any): void
  (event: 'confirm-booking', payload: { item: any; bookingDate: string; bookingSlot: string }): void
}>()

const pickerVisible = shallowRef(false)
const draftBookingItem = shallowRef<any | null>(null)
const draftBookingDate = shallowRef('')
const draftBookingSlot = shallowRef('')

const currentBookingItem = computed(() => draftBookingItem.value)
const currentBookingSlots = computed(() => {
  const bookingItem = currentBookingItem.value
  return (Array.isArray(bookingItem?.timeSlots) ? bookingItem.timeSlots : []).map((slot: any, index: number) => {
    if (typeof slot === 'string') {
      return {
        label: slot,
        value: slot,
        available: true,
        tip: bookingItem?.maxPerSlot ? `剩余${bookingItem.maxPerSlot}` : '',
      }
    }

    const current = Number(slot?.current ?? 0)
    const max = Number(slot?.max ?? bookingItem?.maxPerSlot ?? 0)
    const available = max ? current < max : slot?.available !== false
    return {
      label: slot?.label || slot?.name || slot?.value || `时段${index + 1}`,
      value: slot?.value || slot?.label || slot?.name || `slot_${index}`,
      available,
      tip: max ? `剩余${Math.max(max - current, 0)}` : '',
    }
  })
})

const openBookingPicker = (item: any) => {
  const currentItemId = props.model.bookingItemId || props.model.bookingItemName || ''
  const nextItemId = item?.id || item?.name || ''
  const isEditingConfirmedItem = currentItemId === nextItemId

  draftBookingItem.value = item || null
  draftBookingDate.value = isEditingConfirmedItem ? (props.model.bookingDate || '') : ''
  draftBookingSlot.value = isEditingConfirmedItem ? (props.model.bookingSlot || '') : ''

  if (item?.bookingType === 'date') {
    draftBookingSlot.value = ''
  }

  pickerVisible.value = true
}

const closeBookingPicker = () => {
  pickerVisible.value = false
}

const confirmBooking = () => {
  if (!draftBookingItem.value) return

  emit('confirm-booking', {
    item: draftBookingItem.value,
    bookingDate: draftBookingDate.value,
    bookingSlot: draftBookingSlot.value,
  })
  closeBookingPicker()
}
</script>

<template>
  <div class="q-json-schema__booking">
    <div v-if="props.bookingItems.length" class="q-json-schema__booking-list">
      <div
        v-for="item in props.bookingItems"
        :key="item.id || item.name"
        class="q-json-schema__booking-card"
      >
        <div class="q-json-schema__booking-cover">
          <img v-if="item.img" :src="item.img" :alt="item.name" />
          <span v-else>{{ item.name?.slice(0, 2) || '预约' }}</span>
        </div>
        <div class="q-json-schema__booking-content">
          <div class="q-json-schema__booking-name">{{ item.name || '预约项目' }}</div>
          <div v-if="item.desc" class="q-json-schema__booking-desc">{{ item.desc }}</div>
        </div>
        <a-button
          type="outline"
          size="small"
          :disabled="props.isDisabled || props.isReadonly"
          @click="openBookingPicker(item)"
        >
          预约
        </a-button>
      </div>
    </div>

    <div v-if="props.model.bookingDate || props.model.bookingSlot" class="q-json-schema__booking-result">
      <div class="q-json-schema__booking-result-title">已选择预约信息</div>
      <div v-if="props.bookingResultItemName" class="q-json-schema__booking-result-name">
        {{ props.bookingResultItemName }}
      </div>
      <div class="q-json-schema__booking-result-text">
        {{ props.model.bookingDate || '未选择日期' }}
        <template v-if="props.model.bookingSlot">
          / {{ props.model.bookingSlot }}
        </template>
      </div>
    </div>

    <JsonSchemaFieldRenderer
      v-for="field in props.bookingExtraFields"
      :key="field.key"
      :field="field"
      :model-value="props.model[field.key]"
      :error-message="props.validationErrors[field.key]"
      :is-disabled="props.isDisabled"
      :is-readonly="props.isReadonly"
      @update:model-value="emit('update-field', field.key, $event)"
    />

    <a-modal
      :visible="pickerVisible"
      :mask-closable="true"
      :footer="false"
      width="560px"
      class="q-json-schema__booking-modal"
      unmount-on-close
      @cancel="closeBookingPicker"
    >
      <template #title>
        选择预约时间 - {{ currentBookingItem?.name || '预约项目' }}
      </template>

      <div v-if="currentBookingItem" class="q-json-schema__booking-panel">
        <div class="q-json-schema__field">
          <div class="q-json-schema__label">
            <span>预约日期</span>
            <span v-if="props.bookingDateRequired" class="q-json-schema__required">*</span>
          </div>
          <a-date-picker
            :model-value="draftBookingDate"
            placeholder="请选择预约日期"
            :disabled="props.isDisabled || props.isReadonly"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @update:model-value="draftBookingDate = $event || ''"
          />
          <div v-if="props.validationErrors.bookingDate" class="q-json-schema__error">
            {{ props.validationErrors.bookingDate }}
          </div>
        </div>

        <div
          v-if="currentBookingItem.bookingType !== 'date' && currentBookingSlots.length"
          class="q-json-schema__field"
        >
          <div class="q-json-schema__label">
            <span>预约时段</span>
            <span v-if="props.bookingSlotRequired" class="q-json-schema__required">*</span>
          </div>
          <div class="q-json-schema__slot-list">
            <button
              v-for="slot in currentBookingSlots"
              :key="slot.value"
              type="button"
              class="q-json-schema__slot"
              :class="{ 'is-active': draftBookingSlot === slot.value, 'is-disabled': !slot.available }"
              :disabled="props.isDisabled || props.isReadonly || !slot.available"
              @click="draftBookingSlot = slot.value"
            >
              <span>{{ slot.label }}</span>
              <small v-if="slot.tip">{{ slot.tip }}</small>
            </button>
          </div>
          <div v-if="props.validationErrors.bookingSlot" class="q-json-schema__error">
            {{ props.validationErrors.bookingSlot }}
          </div>
        </div>

        <div class="condition-footer q-json-schema__booking-footer">
          <button type="button" class="modal-btn modal-btn-ghost" @click="closeBookingPicker">取消</button>
          <button type="button" class="modal-btn modal-btn-primary" @click="confirmBooking">确认预约</button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/condition-modal.scss' as conditionModal;

.q-json-schema__booking-modal {
  :deep(.arco-modal) {
    @include conditionModal.condition-modal-shell;
  }
}

.q-json-schema__booking {
  display: grid;
  gap: 12px;
}

.q-json-schema__booking-list {
  display: grid;
  gap: 10px;
}

.q-json-schema__booking-result {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
}

.q-json-schema__booking-result-title {
  color: #1d2129;
  font-size: 13px;
  font-weight: 600;
}

.q-json-schema__booking-result-name {
  color: #1d2129;
  font-size: 13px;
  line-height: 20px;
}

.q-json-schema__booking-result-text {
  color: #4e5969;
  font-size: 12px;
  line-height: 18px;
}

.q-json-schema__booking-card {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  background: #fff;
}

.q-json-schema__booking-cover {
  width: 72px;
  height: 56px;
  border-radius: 10px;
  background: #f2f3f5;
  color: #86909c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  overflow: hidden;
}

.q-json-schema__booking-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.q-json-schema__booking-content {
  min-width: 0;
}

.q-json-schema__booking-name {
  color: #1d2129;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
}

.q-json-schema__booking-desc {
  margin-top: 4px;
  color: #86909c;
  font-size: 12px;
  line-height: 18px;
}

.q-json-schema__booking-panel {
  display: grid;
  gap: 12px;
  padding: 4px 0;
}

.q-json-schema__field {
  display: grid;
  gap: 6px;
}

.q-json-schema__label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #4e5969;
  font-size: 13px;
  line-height: 20px;
}

.q-json-schema__required,
.q-json-schema__error {
  color: #f53f3f;
}

.q-json-schema__error {
  font-size: 12px;
  line-height: 18px;
}

.q-json-schema__slot-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.q-json-schema__slot {
  min-width: 120px;
  padding: 8px 12px;
  border: 1px solid #e5e6eb;
  border-radius: 10px;
  background: #fff;
  color: #4e5969;
  cursor: pointer;
  display: grid;
  gap: 2px;
  text-align: center;
  transition: all 0.2s ease;
}

.q-json-schema__slot small {
  color: #86909c;
  font-size: 11px;
}

.q-json-schema__slot.is-active {
  border-color: rgb(var(--primary-6));
  background: rgb(var(--primary-1));
  color: rgb(var(--primary-6));
}

.q-json-schema__slot.is-disabled {
  color: #c9cdd4;
  background: #f7f8fa;
  cursor: not-allowed;
}

.q-json-schema__booking-footer {
  margin-top: 4px;
}

@include conditionModal.condition-footer-styles;
</style>
