<template>
    <a-upload v-bind="comDes.props" :custom-request="customRequest" :accept="accept"
        v-model:file-list="comDes.props.exampleFiles"></a-upload>
</template>
<script lang="ts" setup>
import { upload } from "@/api/user";
import { ref } from 'vue'
const props = defineProps<{
    comDes: any,
    formConfs: any,
}>()
const win = window as any;
const accept = ref('')
if (Array.isArray(props.comDes.props.attachment_type)) {
    props.comDes.props.attachment_type.map((v1, index) => {
        if (v1 == 'picture') {
            accept.value = accept.value + (index > 0 ? ',' : '') + 'image/*'
        }
        if (v1 == 'video') {
            accept.value = accept.value + (index > 0 ? ',' : '') + 'video/*'
        }
        if (v1 == 'audio') {
            accept.value = accept.value + (index > 0 ? ',' : '') + 'audio/*'
        }
        if (v1 == 'doc') {
            accept.value = accept.value + (index > 0 ? ',' : '') + ''
        }
        if (v1 == 'zip') {
            accept.value = accept.value + (index > 0 ? ',' : '') + '.zip,.7z'
        }
    })
} else {
    if (props.comDes.props.attachment_type == 'picture') {
        accept.value = 'image/*'
    }
    if (props.comDes.props.attachment_type == 'video') {
        accept.value = 'video/*'
    }
    if (props.comDes.props.attachment_type == 'audio') {
        accept.value = 'audio/*'
    }
    if (props.comDes.props.attachment_type == 'doc') {
        accept.value = ''
    }
    if (props.comDes.props.attachment_type == 'zip') {
        accept.value = '.zip,.7z'
    }
}
const customRequest = (option: any) => {
    const { fileItem } = option;
    const formData1 = new FormData();
    const a = {
        folder: "appIcon",
    };
    const json = JSON.stringify(a);
    // 将 json 字符串转化为 Blob 对象
    const blob = new Blob([json], {
        type: "application/json",
    });
    formData1.append("fileProfile", blob);
    formData1.append("file", fileItem.file);
    upload(formData1).then((res) => {
        let files = { ...fileItem, status: '' }
        files.path = res;
        files.url =
            win.api.dowUrl +
            res +
            "&token=" +
            localStorage.getItem("wornbench_token");
        props.comDes.props.exampleFiles.splice(props.comDes.props.value.length - 1, 1)
        props.comDes.props.exampleFiles.push(files);
    });
};
</script>
<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

:deep(.arco-upload-list-picture-card) {
    .arco-upload-trigger {
        border-radius: 6px;
    }
}

:deep(.arco-btn) {
    color: #fff;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: linear-gradient(135deg, rgb(var(--primary-6)) 0%, rgb(var(--primary-5)) 100%);
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    line-height: 1;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(var(--primary-6), 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.5s ease;
    }

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(var(--primary-6), 0.4);

        &::before {
            left: 100%;
        }
    }

    &:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(var(--primary-6), 0.25);
    }
}
</style>