<template>
    <div class="editors">
        <div class="table" v-show="!close" v-html="editorHtml">

        </div>
        <div class="show" @click="changeClose" v-show="!close && comDes.props.fold">收起</div>
        <div class="table" v-show="close && comDes.props.fold" v-html="foldHtml">

        </div>
        <div class="show" @click="changeClose" v-show="close && comDes.props.fold">展开</div>
    </div>
</template>
  
<script lang="ts" setup>
import { computed, ref } from 'vue'
import { sanitizeHtml } from '@/utils/sanitizeHtml'
const props = defineProps<{
    comDes: any,
    formConfs: any,
}>()
const close = ref(props.comDes.props.fold ? true : false)
const editorHtml = computed(() => sanitizeHtml(
    props.comDes.props.desc !== '<p><br></p>' ? props.comDes.props.desc : '',
))
const foldHtml = computed(() => sanitizeHtml(props.comDes.props.foldContext))
const changeClose = () => {
    close.value = !close.value
}
</script>
  
<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;
::v-deep{
    p {
        margin: 0;
        padding: 0;
        overflow-wrap: break-word;
    }
}
.editors {
    line-height: normal;
    display: flex;

   .table{
    max-width: calc(100% - 40px) ;
   }

    .show {
        cursor: pointer;
        margin-left: 5px;
        color: #3894FF;
    }
}
</style>
  
