<template>
    <div class="options" :key="renderKey">
        <draggable class="select-item" draggable=".box" chosenClass=".option-drag" :list="options" :animation="340"
            group="componentsGroup">
            <div class="box" v-for="(item, index) in options" :key="index + 'i'">
                <div class="select-line-icon option-drag">
                    <img src="../../../assets/icon_tuozhuai_1@2x.png" alt="">
                </div>
                <a-input-group class="input-group">
                    <a-input :style="{ width: pic ? '100px' : '210px' }" @input="$event => changeLabel($event, item)"
                        v-model="item.label" :max-length="100" placeholder="label" />
                    <div v-if="pic" class="upload-wrapper">
                        <a-upload :custom-request="(option) => customRequest(option, item, index)"
                            :show-file-list="false" accept="image/*" :limit="1">
                            <template #upload-button>
                                <div v-if="item.path" class="pic-preview">
                                    <img :src="win.api.dowUrl + item.path + '&token=' + token" alt="选项图片" />
                                    <div class="pic-mask">
                                        <icon-edit />
                                    </div>
                                </div>
                                <div v-else class="upload-placeholder">
                                    <icon-plus />
                                    上传图片
                                </div>
                            </template>

                        </a-upload>
                        <div v-if="item.picUrl" class="pic-delete" @click="deletePic(index)">
                            <icon-close />
                        </div>
                    </div>
                </a-input-group>
                <div class="close-btn select-line-icon" @click="handleDeleteOption(Number(index))">
                    <img class="delete" src="../../../assets/icon_shanchu_4@2x.png" alt="">
                </div>
            </div>
        </draggable>

    </div>
</template>
<script lang="ts" setup>
import { ref, watch, nextTick } from 'vue';
import { upload } from '@/api/user';
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import { Modal } from '@arco-design/web-vue'
const props = defineProps<{
    options: any,
    pic?: boolean,
}>()
const token = localStorage.getItem("wornbench_token");
const emit = defineEmits(['update:options'])
const win = window as any;
const renderKey = ref(0)
const forceUpdate = () => {
    renderKey.value++
}
const changeLabel = (val: string, item: any) => {

}
const customRequest = (option: any, item: any, index: number) => {
    const { fileItem } = option;
    const formData1 = new FormData();
    const a = {
        folder: "optionPic",
    };
    const json = JSON.stringify(a);
    const blob = new Blob([json], {
        type: "application/json",
    });
    formData1.append("fileProfile", blob);
    formData1.append("file", fileItem.file);
    upload(formData1).then((res) => {
        // const picUrl = win.api.dowUrl + res + "&token=" + localStorage.getItem("wornbench_token");
        props.options[index].path = res;
        // props.options[index].picUrl = picUrl;
        emit('update:options', [...props.options]);
        nextTick(() => forceUpdate());
    });
};
const deletePic = (index: number) => {
    // props.options[index].picUrl = '';
    props.options[index].path = '';
    emit('update:options', [...props.options]);
    nextTick(() => forceUpdate());
}

/** 删除选项 - 带确认弹窗 */
const handleDeleteOption = (index: number) => {
    Modal.confirm({
        title: '提示',
        simple: true,
        renderToBody: false,
        titleAlign: 'start',
        content: '删除选项后会影响已填写的原始数据，请谨慎操作！',
        hideCancel: false,
        okText: '确认删除',
        cancelText: '取消',
        onOk: () => {
            props.options.splice(index, 1)
            emit('update:options', [...props.options])
            nextTick(() => forceUpdate())
        },
    })
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

    .input-group {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .upload-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        gap: 6px;

        .pic-preview {
            position: relative;
            width: 32px;
            height: 32px;
            border-radius: 4px;
            overflow: hidden;
            border: 1px solid #e8e8e8;
            cursor: pointer;
            transition: all 0.3s;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .pic-mask {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                opacity: 0;
                transition: opacity 0.3s;
                font-size: 14px;
            }

            &:hover {
                border-color: textColor.$ThemeTextColor;

                .pic-mask {
                    opacity: 1;
                }
            }
        }

        .upload-placeholder {
            width: 96px;
            height: 32px;
            border: 1px dashed #d9d9d9;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            font-size: 12px;
            color: #8c8c8c;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
                border-color: textColor.$ThemeTextColor;
                color: textColor.$ThemeTextColor;
            }
        }

        .pic-delete {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #ff4d4f;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.3s;

            &:hover {
                background: #ff7875;
                transform: scale(1.1);
            }
        }
    }
}

.box+.box {
    margin-top: 8px;
}
</style>