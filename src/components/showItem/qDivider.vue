<template>
    <a-divider v-bind="comDes.props">

    </a-divider>
</template>
  
<script lang="ts" setup>
import { ref, defineExpose } from 'vue'
const props = defineProps<{
    comDes: any,
    formConfs: any,
}>()
const inputItem = () => {
    let val = props.comDes.defaultValue
    if (props.comDes.method.input) {
        try {

            // eval(props.comDes.method.input);
        } catch (error) {
            console.error('代码执行出错:', error);
        }
    }

}
</script>
  
<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;
::v-deep{
    .arco-divider{
        margin: 0;
    }
}
.input {
    width: 100%;
}
</style>
  