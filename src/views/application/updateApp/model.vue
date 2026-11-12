<template>
    <div class="app-manage-page form-print">
        <h2 class="app-manage-page-title">表单打印</h2>

        <div class="form-print-body">
            <div class="search-box">
                <a-input v-model="searchFormName" allow-clear placeholder="请输入表单名称" style="width: 300px"
                    @change="handleSearch">
                    <template #prefix>
                        <icon-search />
                    </template>
                </a-input>
                <a-space>
                    <a-button class="template-param-btn" @click="openTemplateParams">模板参数</a-button>
                    <a-button type="primary" class="add-template-btn" @click="openAppTemplate">新增应用模板</a-button>
                </a-space>
            </div>

            <div class="table-container">
                <a-table :columns="columns" :data="tableData" :pagination="false"
                    :bordered="{ wrapper: true, cell: true }" row-key="id" @page-change="handlePageChange"
                    @page-size-change="handlePageSizeChange">
                    <template #serialNumber="{ rowIndex }">
                        {{ rowIndex + 1 }}
                    </template>

                    <template #template="{ record }">
                        <a-link @click="dowItem(record)">
                            {{ record.fileName }}
                        </a-link>
                    </template>

                    <template #action="{ record }">
                        <a-space>
                            <a-link @click="handleUpdate(record)">修改</a-link>
                        </a-space>
                    </template>
                </a-table>
            </div>

            <div class="footer-tips">
                请使用 word 模板按照业务场景制作打印模板，打印参数请参考模板参数使用，如存在相同字段名称，请使用字段表 ID 作为打印字段
            </div>
        </div>

        <!-- 模板参数弹窗 -->
        <templateParamsModal :appdes="appdes" ref="templateParamsRef" />

        <!-- 新增应用模板弹窗 -->
        <appTemplateModal ref="appTemplateRef" @confirm="handleAppTemplateConfirm" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { updatePrint, printData, getPrint } from '@/api/application/index';
import templateParamsModal from './templateParamsModal.vue';
import appTemplateModal from './appTemplateModal.vue';

// 导出 Request 接口类型
export interface Request {
    fileId: number;
    /**
     * 模板名称
     */
    fileName: string;
    /**
     * 0-表单 1-流程表单
     */
    fileType: number;
    /**
     * 文件类型 0-上传文件 1-在线配置 (拓展)
     */
    type: number;
    [property: string]: any;
}

const props = defineProps<{
    appdes: any;
}>();
// 弹窗引用
const templateParamsRef = ref();
const appTemplateRef = ref();
const allTableData = ref([])

// 搜索表单名称
const searchFormName = ref('');

// 表格列定义
const columns = [
    {
        title: '序号',
        slotName: 'serialNumber',
        width: 80,
        align: 'center',
    },
    {
        title: '模板名称',
        slotName: 'template',
    },
    {
        title: '管理',
        slotName: 'action',
        width: 150,
        align: 'center',
    },
];
const dowItem = (item: any) => {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.setAttribute('target', '_blank');
    a.setAttribute('download', item.fileName);
    a.href = win.api.dowUrl +
        item.fileId +
        "&token=" + token;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
// 表格数据
const tableData = ref([]);

// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true,
});

// 搜索处理
const handleSearch = () => {
    if (searchFormName.value) {
        console.log(searchFormName.value)
        tableData.value = allTableData.value.filter(app => {
            const formName = app.formName || app.fileName || '';
            return formName.toLowerCase().includes(searchFormName.value.toLowerCase()); // 不区分大小写的搜索匹配
        });
    } else {
        tableData.value = JSON.parse(JSON.stringify(allTableData.value))
    }
};

// 分页变化处理
const handlePageChange = (page: number) => {
    pagination.current = page;
    getDataList();
};

// 每页数量变化处理
const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    getDataList();
};
const win = window as any
const token = localStorage.getItem("wornbench_token")
// 获取数据列表
console.log(props.appdes)
const getDataList = async () => {
    try {
        if (!props.appdes?.id) {
            tableData.value = [];
            pagination.total = 0;
            return;
        }

        // 调用 API 获取表单打印模板列表
        const res = await getPrint(props.appdes.id);

        if (res) {

            tableData.value = res
            allTableData.value = JSON.parse(JSON.stringify(res))
            pagination.total = tableData.value.length;
        } else {
            tableData.value = [];
            pagination.total = 0;
        }
    } catch (error) {
        console.error('获取模板列表失败:', error);
        Message.error('获取模板列表失败');
        tableData.value = [];
        pagination.total = 0;
    }
};

// 上传处理
const handleUpload = async (record: any) => {
    if (!props.appdes?.id) {
        Message.warning('应用信息不完整');
        return;
    }

    try {
        // 准备上传数据
        const uploadData = {
            fileId: record.fileId,
            fileName: record.fileName,
            fileType: record.fileType,
            type: record.type,
        };

        // 调用配置应用模板接口
        const res = await printData(uploadData, props.appdes.id);

        if (res) {
            Message.success('模板上传成功');
            // 刷新列表
            getDataList();
        }
    } catch (error) {
        console.error('模板上传失败:', error);
        Message.error('模板上传失败');
    }
};
const activeRecord = ref({ id: '' })
// 修改处理
const handleUpdate = async (record: any) => {
    activeRecord.value = record
    appTemplateRef.value?.showItem(record);
};

// 打开模板参数弹窗
const openTemplateParams = () => {
    templateParamsRef.value?.showItem();
};

// 打开应用模板弹窗
const openAppTemplate = () => {
    activeRecord.value = { id: '' }
    appTemplateRef.value?.showItem({ id: '' });
};

// 处理应用模板确认
const handleAppTemplateConfirm = async (data: Request) => {
    console.log('新增应用模板数据:', data);
    let params = {
        ...data
    }
    params.fileType = props.appdes.category == 1 ? 0 : 1
    if (!props.appdes?.id) {
        Message.warning('应用信息不完整');
        return;
    }

    try {
        if (activeRecord.value.id) {
            // 调用配置应用模板接口
            params.appId = props.appdes.id
            const res = await updatePrint(params, activeRecord.value.id);
            Message.success('修改成功');
            // 刷新列表
            getDataList();
        } else {
            // 调用配置应用模板接口
            const res = await printData(params, props.appdes.id);
            Message.success('新增成功');
            // 刷新列表
            getDataList();
        }

    } catch (error) {
        console.error('新增应用模板失败:', error);
    }
};

// 初始化
onMounted(() => {
    getDataList();
});
</script>

<style lang="scss" scoped>
@use "@/styles/app-manage.scss" as appManage;

.form-print {
  .template-param-btn {
    background: #f8fafc;
    color: #64748b;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    transition: all 0.2s;

    &:hover {
      background: #f1f5f9;
      color: #475569;
    }
  }

  .add-template-btn {
    border-radius: 12px;
    background: linear-gradient(135deg, rgb(var(--primary-6)), #6366f1);
    border: none;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);

    &:hover {
      opacity: 0.92;
    }
  }

  &-body {
    flex: 1;

    .search-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      @include appManage.app-manage-input-only;
    }

    .table-container {
      margin-bottom: 16px;

      :deep(.arco-table) {
        // border-radius: 8px;
        // overflow: hidden;
        // border: 1px solid #e2e8f0;
      }
      :deep(.arco-table-container){
        // border: 0;
      }

      :deep(.arco-table-th) {
        background: #f8fafc;
        font-weight: 600;
        color: #475569;
      }
    }

    .footer-tips {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
      padding-top: 12px;
    }
  }
}
</style>