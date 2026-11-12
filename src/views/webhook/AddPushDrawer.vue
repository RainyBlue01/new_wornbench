<template>
    <a-modal :visible="visible" title="修改 Webhook 配置" width="600px" @ok="handleOk" @cancel="handleCancel"
        @close="handleClose">
        <a-form ref="formRef" :model="formData" layout="vertical" :rules="formRules">
            <a-form-item label="推送服务器" field="serverUrl">
                <div class="input-with-btn">
                    <a-input v-model="formData.serverUrl" placeholder="请输入推送服务器地址" />
                    <a-button @click="handleConnectionTest">连接测试</a-button>
                </div>
            </a-form-item>

            <a-form-item label="秘钥" field="secretKey">
                <div class="input-with-btn">
                    <a-input v-model="formData.secretKey" placeholder="请输入秘钥" />
                    <a-button @click="handleGenerateSecret">生成</a-button>
                </div>
            </a-form-item>
        </a-form>
        <template #footer>
            <div class="modal-footer">
                <a-button @click="handleCancel">取消</a-button>
                <a-button type="primary" @click="handleConfirm">确认修改</a-button>
            </div>
        </template>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { developerConfig, secret } from "@/api/webHook/index";
import { Message } from '@arco-design/web-vue';
import type { FormInstance } from '@arco-design/web-vue/es/form';

// 定义 Props
interface Props {
    visible?: boolean;
    appId?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    appId: '',
});

// 定义 Emits
const emits = defineEmits(['update:visible', 'confirm']);

// 表单引用
const formRef = ref<FormInstance>();

// 选中的应用
const selectedAppId = ref<number | string>('');

// 选中的页面
const selectedPageIds = ref<string[]>([]);
// 表单验证规则
const formRules = {
    serverUrl: [
        {
            required: true,
            message: '请输入推送服务器地址',
            trigger: ['blur', 'change'],
        },
        {
            type: 'url',
            message: '请输入有效的 URL 地址',
            trigger: ['blur', 'change'],
        },
    ],
    secretKey: [
        {
            required: true,
            message: '请输入秘钥',
            trigger: ['blur', 'change'],
        },
    ],
};

// 表单数据
const formData = reactive({
    serverUrl: '',
    secretKey: '',
    appId: [],
    events: [],
    triggerEvents: [],
});

// 连接测试
const handleConnectionTest = () => {
    if (!formData.serverUrl) {
        Message.warning('请输入推送服务器地址');
        return;
    }
    console.log('连接测试', formData.serverUrl);
    Message.info('连接测试功能待实现');
};

// 生成秘钥
const handleGenerateSecret = async () => {
    try {
        const res: any = await secret();
        formData.secretKey = res;
        Message.success('秘钥生成成功');
    } catch (error) {
        console.error('生成秘钥失败:', error);
        Message.error('生成秘钥失败');
    }
};


// 确定按钮
const handleOk = () => {
    handleConfirm();
};

// 取消按钮
const handleCancel = () => {
    emits('update:visible', false);
};

// 关闭抽屉
const handleClose = () => {
    emits('update:visible', false);
};

// 确认添加
const handleConfirm = async () => {
    // 表单验证
    try {
        const valid = await formRef.value?.validate();
        if (!valid) {
            return;
        }
    } catch (error) {
        console.error('表单验证失败:', error);
        return;
    }

    // 提交数据
    const submitData = {
        appId: selectedAppId.value,
        pageIds: selectedPageIds.value,
        serverUrl: formData.serverUrl,
        secretKey: formData.secretKey,
        triggerEvents: formData.triggerEvents,
    };

    developerConfig(submitData, selectedAppId.value)
    emits('confirm', submitData);
    emits('update:visible', false);
};

// 监听 visible 变化
watch(
    () => props.visible,
    (newVal) => {
        if (!newVal) {
            formData.serverUrl = '';
            formData.secretKey = '';
            // 重置表单验证状态
            formRef.value?.resetFields();
        } else if (props.appId) {
            // 打开抽屉时加载当前配置
            loadCurrentConfig(props.appId);
        }
    }
);

// 加载当前配置
const loadCurrentConfig = (appId: string | number) => {
    // TODO: 调用接口获取当前应用的 webhook 配置
    // 这里先模拟数据，实际应该调用 API
    console.log('加载应用 ID:', appId, '的配置');
    // 假设从后端获取到配置数据后:
    // formData.serverUrl = config.serverAddress;
    // formData.secretKey = config.secretKey;
};
</script>

<style lang="scss" scoped>
.input-with-btn {
            display: flex;
            gap: 12px;
            width: 100%;

            .arco-input-wrapper {
                width: calc(100% - 112px);
            }

            .arco-btn {
                min-width: 100px;
            }
        }


.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .arco-btn {
        min-width: 100px;
    }
}
</style>
