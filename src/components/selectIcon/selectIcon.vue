<template>
    <div class="selectIcon">
      
    </div>
</template>
  
<script lang="ts" setup>
import { ref, computed } from 'vue'
const props = defineProps({
    modelValue: { type: Array, default: [] },
    title:{type: String, default: '选择人员'}
});
const emit = defineEmits(["update:modelValue"]);
let userList = computed({
    get() {
        return props.modelValue;
    },
    set(val: any) {
        emit("update:modelValue", val);
    },
});
const changeItem = () => {
}
</script>
  
<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;
</style>
  