<template>
  <div class="empty-box">
    <div class="img">
      <img src="@/assets/zanwuneirong@2x.png" alt="" />
    </div>
    <div class="tit">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">

defineProps<{
  text?: string;
}>();
</script>

<style lang="scss" scoped>
.empty-box {
  width: 100%;
  background-color: #fff;
  min-height: 300px;
  display: flex;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
//   border: 1px solid #f1f5f9;
//   box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  .img {
    img {
      width: 148px;
      opacity: 0.6;
    }
  }

  .tit {
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
    margin-top: 16px;
    line-height: 1.5;
  }
}
</style>
