<template>
  <div class="category-box">
    <a-badge text="表单" v-if="props.category == 1" class="form-category">
    </a-badge>
    <a-badge text="流程" v-if="props.category == 2" class="process-category">
    </a-badge>
    <a-badge text="报表" v-if="props.category == 3" class="report-category">
    </a-badge>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const props = defineProps(["category"]);
</script>

<style lang="scss" scoped>
.category-box {
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: rgba(0,0,0,0);
  color: green;

  .arco-badge-text {
    width: 20px;
  }
}
</style>
<style lang="scss">
.category-box {
  .form-category {
    .arco-badge-text {
      background-color: #4a90e2;
      border-radius: 0px 8px 0px 8px !important;
    }
  }
  .process-category {
    .arco-badge-text {
      background-color: #ff8c42;
      border-radius: 0px 8px 0px 8px !important;
    }
  }
  .report-category {
    .arco-badge-text {
      background-color: #35b779;
      border-radius: 0px 8px 0px 8px !important;
    }
  }
}
</style>
