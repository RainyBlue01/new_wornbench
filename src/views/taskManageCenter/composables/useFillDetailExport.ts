import { ref } from "vue"
import { Message } from "@arco-design/web-vue"
import { printList } from "@/api/taskFillManager/index.js"
import { getPrint } from "@/api/application/index"
import { exportData } from "@/api/taskFillCenter/index"
import { blobDownload, openBlobForPrint } from "@/utils/export"
import type { Ref } from 'vue'

export function useFillDetailExport({ batchInfo, fillStateVal, selectedKeys, stats, pagination, tableData, viewData, resolveAppId }: {
  batchInfo: Ref<any>
  fillStateVal: Ref<string>
  selectedKeys: Ref<(string | number)[]>
  stats: { filledCount: number }
  pagination: { total: number }
  tableData: Ref<any[]>
  viewData: Ref<any>
  resolveAppId: () => string | number
}) {


const downloadLoading = ref(false);
const templateModalVisible = ref(false);
const selectedTemplateId = ref<string | number>();
const templateList = ref<any[]>([]);
const pendingExport = ref<{
    apiType: number;
    params: Record<string, any>;
    mode: 'batch' | 'viewDownload' | 'viewPrint';
    fileName?: string;
} | null>(null);

const EXPORT_TYPE_MAP: Record<string, number> = {
    word: 1,
    pdf: 2,
    excel: 0,
    form: 2,
    row: 0,
};

const getExportCount = (selectedOnly: boolean) =>
    selectedOnly ? selectedKeys.value.length : (stats.filledCount || pagination.total || tableData.value.length);

const buildBatchExportParams = (selectedOnly: boolean, needZip: boolean) => {
    const params: Record<string, any> = {
        batchId: batchInfo.value?.batchId,
        state: fillStateVal.value,
        fileType: '',
        fileId: '',
        zip: needZip,
    };

    if (selectedOnly) {
        params.objectIds = selectedKeys.value;
    }

    return params;
};

const submitBatchPrintList = async (params: Record<string, any>, apiType: number) => {
    downloadLoading.value = true;
    try {
        await printList(params, apiType);
        Message.success('请前往任务中心下载任务');
    } catch {
        Message.error('操作失败');
    } finally {
        downloadLoading.value = false;
    }
};

const runBatchExport = async (fileKey: string, selectedOnly: boolean, isPrint = false) => {
    if (selectedOnly && selectedKeys.value.length === 0) {
        Message.warning(`请先选择要${isPrint ? '打印' : '下载'}的记录`);
        return;
    }

    const apiType = EXPORT_TYPE_MAP[fileKey];
    const count = getExportCount(selectedOnly);
    const needZip = !isPrint && count > 1;
    const params = buildBatchExportParams(selectedOnly, needZip);

    if (apiType === 0) {
        await submitBatchPrintList(params, 0);
        return;
    }

    downloadLoading.value = true;
    try {
        const templates = await getPrint(resolveAppId());
        if (!templates?.length) {
            Message.error('暂无模版');
            return;
        }

        if (templates.length === 1) {
            params.fileType = templates[0].fileType;
            params.fileId = templates[0].fileId;
            await submitBatchPrintList(params, apiType);
            return;
        }

        templateList.value = templates;
        pendingExport.value = {
            apiType,
            params,
            mode: 'batch',
        };
        selectedTemplateId.value = undefined;
        templateModalVisible.value = true;
    } catch {
        Message.error('获取模板失败');
    } finally {
        downloadLoading.value = false;
    }
};

const handleDownloadCommand = (key: string) => {
    const [type, scope] = key.split('-');
    runBatchExport(type, scope === 'selected', false);
};

const handlePrintCommand = (key: string) => {
    const [type, scope] = key.split('-');
    runBatchExport(type, scope === 'selected', true);
};

const handleTemplateConfirm = async () => {
    if (!selectedTemplateId.value) {
        Message.warning('请选择一个模板');
        return;
    }

    const selectedTemplate = templateList.value.find((item) => item.id === selectedTemplateId.value);
    if (!selectedTemplate || !pendingExport.value) {
        return;
    }

    const { apiType, params, mode, fileName } = pendingExport.value;
    const exportParams = {
        ...params,
        fileType: selectedTemplate.fileType,
        fileId: selectedTemplate.fileId,
    };

    templateModalVisible.value = false;
    pendingExport.value = null;
    downloadLoading.value = true;

    try {
        if (mode === 'batch') {
            await printList(exportParams, apiType);
            Message.success('请前往任务中心下载任务');
        } else if (mode === 'viewDownload') {
            const res = await exportData(exportParams, apiType);
            blobDownload(res, apiType === 1 ? `${fileName}.docx` : `${fileName}.pdf`);
        } else if (mode === 'viewPrint') {
            const res = await exportData(exportParams, apiType);
            openBlobForPrint(res as BlobPart);
        }
    } catch {
        Message.error('操作失败');
    } finally {
        downloadLoading.value = false;
    }
};

const runViewExport = async (fileKey: string, isPrint = false) => {
    if (!viewData.value) {
        return;
    }

    const apiType = EXPORT_TYPE_MAP[fileKey];
    const params = {
        batchId: batchInfo.value?.batchId,
        dataId: viewData.value.dataId || viewData.value.id,
        fileType: '',
        fileId: '',
    };
    const fileName = viewData.value.nickname || '填报详情';

    if (apiType === 0) {
        downloadLoading.value = true;
        try {
            await printList({
                batchId: batchInfo.value?.batchId,
                state: fillStateVal.value,
                fileType: '',
                fileId: '',
                zip: false,
                objectIds: [viewData.value.id],
            }, 0);
            Message.success('请前往任务中心下载任务');
        } catch {
            Message.error('操作失败');
        } finally {
            downloadLoading.value = false;
        }
        return;
    }

    downloadLoading.value = true;
    try {
        const templates = await getPrint(resolveAppId());
        if (!templates?.length) {
            Message.error('暂无模版');
            return;
        }

        if (templates.length === 1) {
            params.fileType = templates[0].fileType;
            params.fileId = templates[0].fileId;
            const res = await exportData(params, apiType);
            if (isPrint) {
                openBlobForPrint(res as BlobPart);
            } else {
                blobDownload(res, apiType === 1 ? `${fileName}.docx` : `${fileName}.pdf`);
            }
            return;
        }

        templateList.value = templates;
        pendingExport.value = {
            apiType,
            params,
            mode: isPrint ? 'viewPrint' : 'viewDownload',
            fileName,
        };
        selectedTemplateId.value = undefined;
        templateModalVisible.value = true;
    } catch {
        Message.error('获取模板失败');
    } finally {
        downloadLoading.value = false;
    }
};

const handleViewDownloadCommand = (type: string) => {
    runViewExport(type, false);
};

const handleViewPrintCommand = (type: string) => {
    runViewExport(type, true);
};
  return { downloadLoading, templateModalVisible, selectedTemplateId, templateList, handleDownloadCommand, handlePrintCommand, handleTemplateConfirm, handleViewDownloadCommand, handleViewPrintCommand }
}
