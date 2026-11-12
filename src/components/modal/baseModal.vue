<template>
  <div class="deleteModel">
    <a-modal :visible="visible" :modal-class="modalClass" @cancel="BeforeCancel" unmount-on-close
      :footer="deleteMsg.showBtn" title-align="start" :width="deleteMsg.width" :mask-closable="false" v-bind="$attrs">
      <template #title>
        <slot name="title">
          <div class="title">
            {{ deleteMsg.title }}
          </div>
        </slot>
      </template>
      <div v-if="deleteMsg.des" class="modal-des">{{ deleteMsg.des }}</div>
      <div v-if="showSlot">
        <slot></slot>
      </div>

      <template #footer>
        <a-button v-if="deleteMsg.showBtn" @click="BeforeCancel">{{
          deleteMsg.cancelText
        }}</a-button>
        <a-button v-if="deleteMsg.showBtn && deleteMsg.showConfirm" type="primary"
          :status="deleteMsg.okDanger ? 'danger' : undefined" :loading="loading" @click="handleOk">{{ deleteMsg.okText
          }}</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const visible = ref(false);
const emit = defineEmits(["handleOk", "handleCancel"]);

defineProps({
  showSlot: {
    type: Boolean,
    default() {
      return true;
    },
  },
  modalClass: {
    type: String,
    default: "person-modal-wrap",
  },
});

const deleteMsg = ref({
  title: "",
  des: "",
  okText: "",
  cancelText: "",
  showBtn: false,
  showConfirm: true,
  width: "500px",
  okDanger: false,
});

const loading = ref(false);

const handleClick = (item: any) => {
  deleteMsg.value.title = item.title ?? "";
  deleteMsg.value.des = item.des ?? "";
  deleteMsg.value.showBtn = item.showBtn ? true : false;
  deleteMsg.value.showConfirm = item.showConfirm ?? true;
  deleteMsg.value.width = item.width ? item.width : "500px";
  deleteMsg.value.okText = item.okText ? item.okText : "确认";
  deleteMsg.value.cancelText = item.cancelText ? item.cancelText : "取消";
  deleteMsg.value.okDanger = item.okDanger ?? false;
  visible.value = true;
};

const handleOk = () => {
  loading.value = true;
  emit("handleOk");
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const BeforeCancel = () => {
  emit("handleCancel");
  visible.value = false;
};

const handleClose = () => {
  visible.value = false;
};

defineExpose({
  handleClick,
  handleClose,
});
</script>

<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

.title {
  justify-content: flex-start;
}

.modal-des {
  margin-bottom: 12px;
  font-size: 13px;
  color: #64748b;
}
</style>
