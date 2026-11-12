<template>
  <div class="form-designer-page">
    <banner :active="1"  />
    <div class="form-designer-body">
      <left @append-component="handleAppendComponent" />
      <designer ref="designerRef" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import designer from './designer.vue'
import left from './left.vue'
import { ref } from 'vue'

const designerRef = ref<InstanceType<typeof designer> | null>(null)

const handleAppendComponent = (item: any) => {
  designerRef.value?.setForms(item)
}
</script>
<style lang="scss" scoped>
@use "@/styles/form-designer.scss";
</style>
