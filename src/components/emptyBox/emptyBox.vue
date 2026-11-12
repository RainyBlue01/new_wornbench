<template>
  <div class="empty-box" :class="{ 'empty-box--embedded': embedded }">
    <div class="img">
      <img src="../../assets/zanwuneirong@2x.png" alt="" />
    </div>
    <div class="tit">{{ desc }}</div>
  </div>
</template>
<script setup lang="ts">
withDefaults(
  defineProps<{
    desc?: string;
    embedded?: boolean;
  }>(),
  {
    desc: "暂无内容",
    embedded: false,
  },
);
</script>
<style lang="scss" scoped>
.empty-box {
  width: 100%;
  background-color: #fff;
  border-radius: 10px;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .img {
    img {
      width: 148px;
    }
  }

  .tit {
    font-size: 16px;
    color: #999;
  }

  &--embedded {
    background-color: transparent;
    border-radius: 0;
    min-height: 200px;
  }
}
</style>
