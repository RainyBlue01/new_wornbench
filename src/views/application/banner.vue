<template>
  <div class="banners">
    <div class="left" @click="tohome">
      <div class="icon">
        <icon-arrow-left />
      </div>
      <!-- 
      <div class="img">
        <img v-if="appdes.showIcon" :src="appdes.showIcon" alt="" />
        <img v-else :src="zhu" alt="" />
      </div> -->
      {{ appdes.appName }}

    </div>
    <div class="right">
      <div v-if="draftId" class="draft-badge">草稿</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { clearFormById } from "@/utils/form";
import { clearFlowById } from "@/utils/flowPath";

const props = defineProps<{
  appdes: any;
  deptLists: any;
  draftId: any;
}>();
const updateAppRef = ref();
const win = window as any;
const router = useRouter();
const route = useRoute();
const tohome = () => {
  router.go(-1);
  clearFormById(route.query.id);
  clearFlowById(route.query.id);
};
const editForm = () => {
  router.push({
    path: "/designer",
    query: { type: props.appdes.category, id: route.query.id },
  });
};
const setTask = () => {
  // 跳转前需要预加载表单数据，这里简化处理，直接跳转
  // 实际使用时可能需要从 publishTask 组件中获取相关逻辑
};
const originalData = () => {
  router.push({
    path: '/originalData',
    query: {
      appId: props.appdes.id,
      formId: props.appdes.formId,
      processId: props.appdes.processId,
      appName: props.appdes.appName,
    }
  });
};
const setApp = () => {
  updateAppRef.value.showItem();
};
const linkToForm = () => {
  router.push({
    path: "/form",
    query: { type: props.appdes.category, id: route.query.id },
  });
};
</script>
<style lang="scss" scoped>
@use "../../styles/textColor.scss" as textColor;

.banners {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 100;

  .left {
    display: flex;
    align-items: center;
    font-size: 16px;
    line-height: 36px;
        font-weight: 700;
    color: rgba(0, 0, 0, 0.9);
    cursor: pointer;
    gap: 12px;

    .icon {
      font-size: 20px;
      padding: 0 8px;
      color: rgba(0, 0, 0, 0.7);
    }

    .img {
      width: 32px;
      height: 32px;
      margin-right: 10px;

      img {
        width: 32px;
        height: 32px;
      }
    }
  }

  .draft-badge {
    background: #fff7ed;
    color: #f97316;
    font-size: 12px;
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: 600;
    // border: 1px solid #ffedd5;
    line-height: 18px;
  }

  .right {
    display: flex;

    .btn-box-btn+.btn-box-btn {
      margin-left: 20px;
    }

    .btn-box-btn:hover {
      background: textColor.$ThemeTextColor;
      border: 1px solid textColor.$ThemeTextColor;

      .btn-icon {
        color: rgba(255, 255, 255, 1);
      }

      .btn-box-btn-title {
        color: rgba(255, 255, 255, 1);
      }
    }

    .btn-box-btn {
      background-color: #fff;
      padding: 9px 16px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 3px;
      display: flex;
      align-items: center;
      transition: all 0.2s;
      cursor: pointer;

      .btn-icon {
        font-size: 16px;
        margin-right: 8px;
        color: rgba(0, 0, 0, 0.7);
      }

      .btn-box-btn-title {
        height: 18px;
        line-height: 18px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.9);
      }
    }
  }
}
</style>
