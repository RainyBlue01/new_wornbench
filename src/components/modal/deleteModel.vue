<template>
  <div class="deleteModel">
    <a-modal :visible="visible" @cancel="handleCancel" unmountOnClose :footer='deleteMsg.showBtn' title-align="start"
      :width="deleteMsg.width">
      <template #title>
        <div class="title">
          {{ deleteMsg.title }}
        </div>
      
      </template>
      <div>{{ deleteMsg.des }}</div>
      <div v-if="showSlot">
        <slot></slot>
      </div>
      <template #footer>
        <a-button v-if="deleteMsg.showBtn" @click="BeforeCancel">{{ deleteMsg.cancelText }}</a-button>
        <a-button v-if="deleteMsg.showBtn" class="btn" @click="handleOk">{{ deleteMsg.okText }}</a-button>
      </template>
    </a-modal>
  </div>
</template>
  
<script lang="ts" setup>
import { ref} from 'vue';
const visible = ref(false);
const emit = defineEmits(['handleOk', 'handleCancel']);
const deleteMsg = ref({ title: '', des: '', okText: '', cancelText: '', showBtn: false, width: '500px' });
defineProps({
  showSlot: {
    type: Boolean,
    default() {
      return true;
    },
  },
});

const handleClick = (item: any, v: any) => {
  deleteMsg.value.title = item.title
  deleteMsg.value.des = item.des
  deleteMsg.value.showBtn = item.showBtn ? false : true
  deleteMsg.value.width = item.width ? item.width : '500px'
  deleteMsg.value.okText = item.okText ? item.okText : '确认' + v
  deleteMsg.value.cancelText = item.cancelText ? item.cancelText : '取消'
  visible.value = true;
};
const handleOk = () => {
  visible.value = false;
  emit('handleOk');
};
const handleCancel = () => {
  visible.value = false;

}
const BeforeCancel = () => {
  emit('handleCancel');
  visible.value = false;
}
defineExpose({
  handleClick,
});
</script>
  
<style lang="scss" scoped>
.title{
  justify-content: flex-start;
}
.btn {
  background-color: #16A4A7;
  color: #fff;
}
</style>
  