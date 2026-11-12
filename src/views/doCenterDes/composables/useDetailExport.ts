import { ref } from "vue"
import { exportWorkbench, printForm } from "@/api/workbench/index"
import { Message } from "@arco-design/web-vue"
import { blobDownload, openBlobForPrint } from "@/utils/export"
import type { Ref } from 'vue'
import type { FlowInfo } from '@/types/form'

export function useDetailExport({ flowInfo }: {
  flowInfo: Ref<FlowInfo>
}) {


const downloadData = ref<any>({})
const downloadLoading = ref(false)
// 模板选择弹窗相关
const templateModalVisible = ref(false)
const selectedTemplateId = ref()
const templateList = ref([])



const isPrint = ref(false)
// 打印
const downUp = () => {
    downloadLoading.value = true
    printForm(flowInfo.value.formId).then(res => {
        if (res.length == 0) {
            Message.error('暂无模版')
            downloadLoading.value = false
        } else if (res.length == 1) {
            let params = {
                dataId: flowInfo.value.dataId,
                formId: flowInfo.value.formId,
                fileType: res[0].fileType,
                fileId: res[0].fileId,
            }
            exportWorkbench(params, 2).then((res1: any) => {
                openBlobForPrint(res1 as unknown as BlobPart);
                downloadLoading.value = false
            }).catch(() => {
                downloadLoading.value = false
            })
        } else {
            templateList.value = res
            templateModalVisible.value = true
            selectedTemplateId.value = null
            isPrint.value = true
            downloadData.value = {
                val: 2,
                formId: flowInfo.value.formId,
                dataId: flowInfo.value.dataId,
                fileType: '',
                fileId: '',
            }
            downloadLoading.value = false
        }
    }).catch(() => {
        downloadLoading.value = false
    })
}

// 下载
const downLoad = (val: number) => {
    downloadLoading.value = true
    printForm(flowInfo.value.formId).then(res => {
        if (res.length == 0) {
            Message.error('暂无模版')
            downloadLoading.value = false
        } else if (res.length == 1) {
            let params = {
                dataId: flowInfo.value.dataId,
                formId: flowInfo.value.formId,
                fileType: res[0].fileType,
                fileId: res[0].fileId,
            }
            exportWorkbench(params, val).then(res1 => {
                blobDownload(res1, val == 1 ? flowInfo.value.flowTitle + '.docx' : flowInfo.value.flowTitle + '.pdf')
                downloadLoading.value = false
            }).catch(() => {
                downloadLoading.value = false
            })
        } else {
            templateList.value = res
            templateModalVisible.value = true
            selectedTemplateId.value = null
            downloadData.value = {
                val: val,
                formId: flowInfo.value.formId,
                dataId: flowInfo.value.dataId,
                fileType: '',
                fileId: '',
            }
            downloadLoading.value = false
        }
    }).catch(() => {
        downloadLoading.value = false
    })
}
// 处理模板选择确认
const handleTemplateConfirm = () => {
    if (!selectedTemplateId.value) {
        Message.warning('请选择一个模板')
        return
    }

    const selectedTemplate = templateList.value.find(item => item.id === selectedTemplateId.value)
    if (selectedTemplate) {
        downloadData.value.fileType = selectedTemplate.fileType
        downloadData.value.fileId = selectedTemplate.fileId
        downloadLoading.value = true
        templateModalVisible.value = false

        exportWorkbench(downloadData.value, downloadData.value.val).then((res: any) => {
            if (isPrint.value) {
                openBlobForPrint(res as BlobPart);
            } else {
                blobDownload(res, downloadData.value.val == 1 ? flowInfo.value.flowTitle + '.docx' : flowInfo.value.flowTitle + '.pdf')
            }
            isPrint.value = false
            downloadLoading.value = false
        }).catch(() => {
            downloadLoading.value = false
            isPrint.value = false
        })
    }
}
  return { downloadLoading, templateModalVisible, selectedTemplateId, templateList, downUp, downLoad, handleTemplateConfirm }
}
