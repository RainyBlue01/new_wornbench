<template>
    <a-upload v-bind="comDes.props" :accept="accept" :custom-request="customRequest"
        :tip='comDes.type == "PICTURE" ? "点击上传图片" : ""' :on-before-remove="beForeRemove" @preview="handlePreview"
        :show-link="false" :download='false' v-model:file-list="fileList">
        <!-- <template #upload-item="{ fileItem }">
            <div class="upload-item-wrapper">
                <div class="upload-item-content">
                    <div class="file-info">
                        <icon-file class="file-icon" />
                        <span class="file-name">{{ fileItem.name }}</span>
                    </div>
                    <div class="file-actions">
                        <icon-eye class="action-icon preview" @click.stop="handlePreview(fileItem)" title="预览" />
                        <icon-delete class="action-icon delete" @click.stop="removeFile(fileItem)" title="删除" />
                    </div>
                </div>
            </div>
        </template> -->
    </a-upload>
</template>
<script lang="ts" setup>
import { upload } from "@/api/user";
import { computed, ref, watch } from 'vue'
import { buildAttachmentPreviewUrl, resolveAttachmentUrl } from '@/utils/attachmentUrl'
const props = defineProps<{
    comDes: any,
    formConfs: any,
}>()
const normalizeFileList = (value: unknown): any[] => {
    if (Array.isArray(value)) return value
    if (typeof value !== 'string' || value.trim() === '') return []

    try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

if (!Array.isArray(props.comDes.props.value)) {
    props.comDes.props.value = normalizeFileList(props.comDes.props.value)
}

const fileList = computed<any[]>({
    get: () => normalizeFileList(props.comDes.props.value),
    set: (value) => {
        props.comDes.props.value = Array.isArray(value) ? value : []
    },
})
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
const beForeRemove = (file: any) => {
    if (file.example) {
        return false;
    } else {
        return true;
    }

};

// 删除文件
const removeFile = (file: any) => {
    if (file.example) {
        return;
    }
    const index = props.comDes.props.value.findIndex((f: any) => f.uid === file.uid);
    if (index > -1) {
        props.comDes.props.value.splice(index, 1);
    }
};

// 处理预览事件
const handlePreview = async (fileItem: any) => {
    console.log('预览文件:', fileItem, '文件列表:', props.comDes.props.value)

    if (!fileItem.path && !fileItem.url) {
        console.warn('无法获取 fileId');
        return;
    }

    try {
        const fileUrl = await resolveAttachmentUrl(fileItem)
        if (!fileUrl) return
        const fileName = fileItem.fileName || fileItem.name || 'file'
        const previewUrl = buildAttachmentPreviewUrl(
            fileUrl,
            fileName,
            fileItem.path || '',
        )
        window.open(
            `${window.location.origin}/wornbench/test/iframePreview?url=${encodeURIComponent(previewUrl)}&fileName=${encodeURIComponent(fileName)}`,
            '_blank',
        );
    } catch (error) {
        console.error('获取附件预览地址失败:', error)
    }
};

watch(
    () => props.comDes.props.value,
    (files) => {
        if (!Array.isArray(files)) return
        files.forEach(async (file) => {
            if (!file?.path || file.url) return
            try {
                file.url = await resolveAttachmentUrl(file)
            } catch (error) {
                console.error('获取附件回显地址失败:', error)
            }
        })
    },
    { immediate: true, deep: true },
)

const customRequest = (option: any) => {
    const { fileItem } = option;
    console.log(fileItem)
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
        let files = { ...fileItem, fileName: fileItem.name, size: fileItem.file.size, type: 1, status: '' }
        files.path = res;
        files.url =
            win.api.dowUrl +
            res +
            "&token=" +
            localStorage.getItem("wornbench_token");
        props.comDes.props.value.splice(props.comDes.props.value.length - 1)
        props.comDes.props.value.push(files);
    }).catch((err) => {
        props.comDes.props.value.splice(props.comDes.props.value.length - 1)
    });
};
</script>
<style lang="scss" scoped>
@use "../../styles/textColor.scss" as textColor;

:deep(.arco-upload-picture-card) {
    border-radius: 8px;
    border: 1px dashed #e2e8f0;
    background: #f8fafc;
    font-size: 18px;
    min-width: 88px;
    height: 88px;

    .arco-upload-tip {
        font-size: 12px;
        color: #94a3b8;
    }
}

:deep(.arco-upload-list-picture) {
    width: 88px;
    height: 88px;
}

.upload-item-wrapper {
    width: 100%;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
        border-bottom: none;
    }

    .upload-item-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;

        .file-info {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;

            .file-icon {
                font-size: 20px;
                color: #6366f1;
                flex-shrink: 0;
            }

            .file-name {
                font-size: 13px;
                color: #1e293b;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .file-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;

            .action-icon {
                font-size: 18px;
                cursor: pointer;
                transition: all 0.2s;
                padding: 4px;
                border-radius: 4px;

                &.preview {
                    color: #6366f1;

                    &:hover {
                        background: #eef2ff;
                        color: #4f46e5;
                    }
                }

                &.delete {
                    color: #ef4444;

                    &:hover {
                        background: #fef2f2;
                        color: #dc2626;
                    }
                }
            }
        }
    }
}

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
    background-color: #f8fafc !important;
    color: #64748b !important;
    border: 1px solid #e2e8f0 !important;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    line-height: 1;
    border-radius: 8px;

    position: relative;
    overflow: hidden;

    &:hover {
        background-color: #E5E6EB !important;
    }

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




}
</style>
