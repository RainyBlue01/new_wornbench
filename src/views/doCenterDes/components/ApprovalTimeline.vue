<template>
  <div class="card-body" :class="{ 'handler-mode': flowInfo?.classify === 'notice' }">
    <div class="record-list">
      <timeLine :flowInfo="flowInfo" :commentList="commentList" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  flowInfo?: any
  commentList?: Array<any>
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.card-body {
  &.handler-mode {
    pointer-events: none;
    opacity: 0.7;
  }
.card-header{
  padding:0 !important;
}
  .record-list {
    padding: 0;
  }
}
</style>
