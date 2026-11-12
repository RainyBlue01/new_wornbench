<template>
    <a-modal v-model:visible="visible" @cancel="handleCancel" @ok="handleOk" :mask-closable="false" :title="title"
        width="600px">
        <div class="app-template-form">
            <!-- 文件类型选择 -->
            <a-form :model="formData" layout="vertical">
                <a-form-item>
                    <div class="file-type-selector">
                        <div class="file-type-item" :class="{ active: formData.type === 0 }" @click="selectFileType(0)">
                            <div class="file-type-icon">
                                <icon-folder />
                            </div>
                            <div class="file-type-label">上传文件</div>
                        </div>

                        <div class="file-type-item disable">
                            <div class="file-type-icon">
                                <icon-apps />
                            </div>
                            <div class="file-type-label">在线配置</div>
                        </div>

                    </div>
                </a-form-item>

                <a-form-item label="模板" required>
                    <a-upload v-model:file-list="fileList" :show-file-list="true" :limit="1" accept=".doc,.docx"
                        :custom-request="customRequest">
                        <template #upload-button>
                            <div class="upload-button">
                                <a-button>
                                    <template #icon>
                                        <icon-upload />
                                    </template>
                                    选择文件
                                </a-button>
                                <div class="upload-tips">请使用 word 模板按照业务场景制作打印模板，打印参数请参考模板参数使用，如存在相同字段名称，请使用字段表 ID
                                    作为打印字段（仅支持 .doc/.docx 格式）</div>
                            </div>
                        </template>
                    </a-upload>
                </a-form-item>
            </a-form>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Message } from '@arco-design/web-vue';
import { upload } from '@/api/user';


// 定义 Request 接口类型
interface Request {
    fileId: number;
    /**
     * 模板名称
     */
    fileName: string;
    /**
     * 0-文件夹 1-普通表单 2-流程表单 3-报表
     */
    type: number;
    /**
     * 文件类型 0-上传文件 1-在线配置 (拓展)
     */
    fileType: number;
    [property: string]: any;
}
const title = ref('新增应用模板')
const visible = ref(false);
const fileList = ref<any[]>([]);
const formData = reactive<Request>({
    fileId: 0,
    fileName: '',
    type: 0,
    fileType: 0,
});

// 打开弹窗
const showItem = (record: any) => {
    visible.value = true;
    // 重置表单
    if (record.id) {
        formData.fileId = record.fileId;
        formData.fileName = record.fileName;
        formData.type = record.type;
        formData.fileType = record.fileType;
title.value = '修改应用模板'
    } else {
        formData.fileId = 0;
        formData.fileName = '';
        formData.type = 0;
        formData.fileType = 0;
    }

    fileList.value = [];
};
const win = window as any
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
        formData.fileId = res;
        formData.fileName = fileItem.name;
        fileList.value = [{
            uid: '-1',
            name: fileItem.name,
            url: win.api.dowUrl +
                res +
                "&token=" +
                localStorage.getItem("wornbench_token")
        },]

    });
};
// 处理文件变化
const handleFileChange = async (newFileList: any[]) => {
    if (newFileList.length === 0) {
        // 文件被删除
        formData.fileId = 0;
        formData.fileName = '';
        return;
    }

    const file = newFileList[0].originFile;
    if (!file) return;

    // 验证文件类型
    const fileName = file.name;
    const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    const allowedExtensions = ['.doc', '.docx'];

    if (!allowedExtensions.includes(fileExtension)) {
        Message.error('只能上传 Word 格式的文件（.doc 或 .docx）');
        fileList.value = []; // 清空文件列表
        return;
    }

    try {
        // 创建 FormData 对象
        const uploadData = new FormData();
        uploadData.append('file', file);

        // 调用上传接口
        const res = await upload(uploadData);

        if (res && res.data) {
            // 上传成功，设置文件信息
            const uploadRes = res.data as any;
            formData.fileId = uploadRes.id || uploadRes.fileId;
            formData.fileName = uploadRes.fileName || file.name;
            Message.success('上传成功');
        }
    } catch (error) {
        console.error('上传失败:', error);
        Message.error('上传失败，请重试');
        fileList.value = []; // 清空文件列表
    }
};

// 选择文件类型
const selectFileType = (type: number) => {
    formData.type = type;
};

// 取消
const handleCancel = () => {
    visible.value = false;
};

// 确认
const handleOk = () => {
    if (!formData.fileId || !formData.fileName) {
        Message.warning('请先上传文件');
        return;
    }

    // 触发确认事件，将数据传递给父组件
    emit('confirm', { ...formData });
    visible.value = false;
};

const emit = defineEmits<{
    (e: 'confirm', data: Request): void;
}>();

// 暴露方法给父组件
defineExpose({
    showItem,
});
</script>

<style lang="scss" scoped>
@use "@/styles/textColor.scss" as textColor;

.app-template-form {
    padding: 10px 0;
}

.file-type-selector {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
}

.file-type-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    border: 2px solid #e5e6eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        border-color: textColor.$ThemeTextColor;
        background-color: #f2f3f5;
    }

    &.active {
        border-color: textColor.$ThemeTextColor;
        background-color: #e8f3ff;

        .file-type-icon {
            color: textColor.$ThemeTextColor;
        }

        .file-type-label {
            color: textColor.$ThemeTextColor;
            font-weight: 500;
        }
    }
}

.file-type-icon {
    font-size: 32px;
    color: #86909c;
    margin-bottom: 8px;
    transition: all 0.3s;
}

.file-type-label {
    font-size: 14px;
    color: #4e5969;
    text-align: center;
    transition: all 0.3s;
}

.upload-button {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.upload-tips {
    font-size: 12px;
    color: #86909c;
}

.disable {
    cursor: not-allowed;
    opacity: 0.6;

    &:hover {
        border-color: #e5e6eb;
        background-color: transparent;
    }
}
</style>
