<template>
  <div class="card-body" :class="{ 'handler-mode': flowInfo?.classify === 'notice' }">
    <a-form v-if="formConfs?.id && formConfs?.formList" :model="form" ref="refChangeForm" :rules="rules"
      :layout="formConfs.titleStyle !== 'hide' ? formConfs.titleStyle : 'vertical'" class="approval-form"
      v-bind="formConfs" :scroll-to-first-error="false">
      <div v-for="(item, index) in formConfs.formList" :key="index">
        <showItem :activeForm="{ id: '' }" :deptList="deptList" v-if="!item.showItem" :newIndex="index"
          :showEdit="false" :list="formConfs.formList" :comDes="item" :formConfs="formConfs" />
      </div>
    </a-form>
    <div v-show="!formConfs?.id || !formConfs?.formList" class="empty-state">
      <emptyBox />
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide, ref, watch } from 'vue'
import type { FormConfs } from '@/types/form'

interface Props {
  formConfs?: FormConfs
  form: Record<string, any>
  rules: Record<string, any>
  deptList: Array<any>
  dataLoading?: boolean
  flowInfo?: {
    classify?: string
  }
}

const props = defineProps<Props>()

const refChangeForm = ref()
const isDataLoading = ref(false)

watch(
  () => props.dataLoading,
  (val) => {
    isDataLoading.value = !!val
  },
  { immediate: true },
)

provide('isDataLoading', isDataLoading)
provide('hideDisabledFieldPrompt', true)

defineExpose({
  refChangeForm,
})
</script>

<style lang="scss" scoped>
.card-body {
  &.handler-mode {
    pointer-events: none;
    opacity: 0.7;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
  }
}
</style>
