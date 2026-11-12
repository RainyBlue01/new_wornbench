<template>
    <div class="qSignature">

        <div class="img" v-if="comDes.props.value" @click="inputItem">
            <img :src="comDes.props.value ? (win.api.dowUrl + comDes.props.value + '&token=' + token) : '' " alt="">
        </div>
        <div class="text" v-else @click="inputItem">
            点击签名
        </div>
        <signature ref="signatureRef" :showEdit="showEdit" :comDes="comDes" />
    </div>
</template>

<script lang="ts" setup>
import { ref, defineExpose, } from 'vue'
const props = defineProps<{
    comDes: any,
    formConfs: any,
    showEdit: any,
}>()
const signatureRef = ref()
const win = window as any;
let token = localStorage.getItem("wornbench_token");
const inputItem = () => {
    if (!props.comDes.props.disabled) {
        signatureRef.value.showItem()
    }


}
</script>

<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

.qSignature {
    width: 100%;

    .text {
        width:calc(100% - 2px); 
        text-align: center;
        height: 53px;
        line-height: 53px;
        border-radius: 4px;
        border: 1px solid #dcdfe6;
        color: #c1c2c5;
    }

    .img {
       width:calc(100% - 2px); 
        height: 164px;
        margin-top: 2px;
        border: 1px solid #dcdfe6;

        img {
           // width: 100%;
            height: 100%;
        }
    }
}
</style>