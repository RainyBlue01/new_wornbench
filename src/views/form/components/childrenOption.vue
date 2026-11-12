<template>
    <div class="options">
        <draggable class="select-item" draggable=".box" chosenClass=".option-drag" :list="options" :animation="340"
            group="componentsGroup">
            <div class="box" v-for="(item, index) in options">
                <div class="select-line-icon option-drag">
                    <img src="../../../assets/icon_tuozhuai_1@2x.png" alt="">
                </div>
                <a-input-group>
                    <a-input-number :style="{ width: '200px' }" v-model="item.props.span" :min="1" :max="24"
                        placeholder="请输入" />
                </a-input-group>
                <div class="close-btn select-line-icon" @click="options.splice(index, 1)">
                    <img class="delete" src="../../../assets/icon_shanchu_4@2x.png" alt="">
                </div>
            </div>
        </draggable>

    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { nanoid } from 'nanoid';
import { VueDraggableNext as draggable } from 'vue-draggable-next'
const props = defineProps<{
    options: any,
}>()
const changeLabel = (val: string, item: any) => {
    if (item.value == '') {
        item.value = nanoid(9)
    }
}
</script>
<style lang="scss" scoped>
@use "@/styles/textColor.scss" as textColor;

.box {
    display: flex;
    align-items: center;

    .option-drag {
        margin-right: 20px;
    }

    .select-line-icon {
        line-height: 32px;
        font-size: 22px;
        color: #777;

        img {
            height: 14px;
        }
    }

    .close-btn {
        margin-left: 10px;
    }
}

.box+.box {
    margin-top: 8px;
}
</style>