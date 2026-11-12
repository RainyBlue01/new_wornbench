<template>
    <a-row v-bind="comDes.props" id="other">
        <draggable class="drawing-board" v-if="showEdit" draggable=".qCol" :list="comDes.children" :animation="340" id="other">
            <qCol :activeForm="activeForm" :deptList="deptList" :showEdit="showEdit" :newIndex="index" :formConfs="formConfs" :list="comDes.children" :comDes="item"
                v-for="(item, index) in comDes.children" />
        </draggable>
        <qCol :activeForm="activeForm" :deptList="deptList" v-if="!showEdit" :showEdit="showEdit" :newIndex="index" :formConfs="formConfs" :list="comDes.children" :comDes="item"
        v-for="(item, index) in comDes.children" />
    </a-row>
</template>
  
<script lang="ts" setup>
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import { ref } from 'vue'
const props = defineProps<{
    comDes: any,
    newIndex: any,
    showEdit:any,
    deptList:any,
    list: any,
    formConfs: any,
    activeForm: any,
}>()
</script>
  
<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;
.drawing-board{
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    align-items: flex-start;
    align-items: flex-start;
}
</style>
  