<template>
    <a-drawer
        :visible="visible"
        :title="drawerTitle"
        :width="width"
        :footer="true"
        @ok="handleOk"
        @cancel="handleCancel"
        @close="handleClose"
    >
        <div class="fix-drawer-container">
            <a-table
                :columns="columns"
                :data="tableData"
                :pagination="false"
                :bordered="true"
                row-key="field"
            >
                <template #field="{ record }">
                    {{ record.label }}
                </template>
                <template #originalValue="{ record }">
                    <div class="original-value">{{ record.oldValue }}</div>
                </template>
                <template #correctValue="{ record }">
                    <div class="correct-value">{{ record.newValue }}</div>
                </template>
            </a-table>
        </div>

        <template #footer>
            <div class="drawer-footer">
                <a-button type="primary" status="success" @click="handleAdopt">
                    采用
                </a-button>
                <a-button status="warning" @click="handleReject">
                    不采用
                </a-button>
            </div>
        </template>
    </a-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';

// 定义 Props
interface Props {
    visible?: boolean;
    title?: string;
    width?: string;
    data?: any[];
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    title: '纠错处理',
    width: '800px',
    data: () => [],
});

// 定义 Emits
const emits = defineEmits(['update:visible', 'adopt', 'reject', 'close']);

const drawerTitle = ref(props.title);
const width = ref(props.width);

// 表格列配置
const columns = [
    { title: '字段', slotName: 'field', dataIndex: 'field', width: 150 },
    { title: '原值', slotName: 'originalValue', dataIndex: 'originalValue' },
    { title: '纠错值', slotName: 'correctValue', dataIndex: 'correctValue' },
];

// 表格数据
const tableData = ref<any[]>([]);

// 初始化数据
const initData = () => {
    tableData.value = props.data || [];
};

// 确定按钮
const handleOk = () => {
    emits('update:visible', false);
};

// 取消按钮
const handleCancel = () => {
    emits('update:visible', false);
};

// 关闭抽屉
const handleClose = () => {
    emits('update:visible', false);
};

// 采用按钮
const handleAdopt = () => {
    emits('adopt', tableData.value);
    emits('update:visible', false);
};

// 不采用按钮
const handleReject = () => {
    emits('reject', tableData.value);
    emits('update:visible', false);
};

// 监听 props 变化
watch(
    () => props.data,
    (newData) => {
        if (newData && newData.length > 0) {
            tableData.value = newData;
        }
    },
    { immediate: true }
);
</script>

<style lang="scss" scoped>
.fix-drawer-container {
    padding: 0;
    min-height: 300px;

    :deep(.arco-table) {
        font-size: 14px;

        .arco-table-th {
            background-color: #f7f8fa;
            color: #1d2129;
            font-weight: 600;
            text-align: center;
        }

    }

    .original-value,
    .correct-value {
        min-height: 32px;
        display: flex;
        align-items: center;
        color: #4e5969;
    }

    .correct-value {
        color: #165dff;
        font-weight: 500;
    }
}

.drawer-footer {
    display: flex;
    justify-content: center;
    gap: 16px;

    .arco-btn {
        min-width: 100px;
    }
}
</style>
