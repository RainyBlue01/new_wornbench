<template>
  <div v-if="!embedded" class="output-center-page">
    <div class="dev-main">
      <div class="dev-card dev-download-card">
        <div class="dev-card-header">
          <h3 class="dev-download-title">
            <i class="fas fa-download dev-download-title__icon" aria-hidden="true" />
            下载中心
          </h3>
        </div>
        <div class="dev-download-notice">
          <i class="fas fa-info-circle" aria-hidden="true" />
          文件生成后会暂存在服务器上，3天后自动删除。
        </div>
        <div class="dev-card-body">
          <OutputSearchBar
            v-model:name="searchParams.name"
            v-model:states="searchParams.states"
            @search="handleSearch"
            @reset="handleReset"
          />
          <OutputTableSection
            :columns="columns"
            :table-data="tableData"
            :loading="loading"
            :scroll="scroll"
            :download-loading="downloadLoading"
            :pagination="pagination"
            :show-button="showButton"
            @download-item="handleDownloadItem"
            @preview="handlePreview"
            @download="handleDownload"
            @delete="handleDelete"
            @retry="handleRetry"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>

  <base-modal
    v-else
    ref="modalRef"
    modal-class="person-modal-wrap dev-download-modal"
    body-style="padding: 0 !important;max-height:none !important; overflow:hidden !important;"
    @handle-ok="handleModalOk"
    :footer="false"
    @handle-cancel="handleModalCancel"
  >
    <template #title>
      <h3 class="dev-download-title">
        <i class="fas fa-download dev-download-title__icon" aria-hidden="true" />
        下载中心
      </h3>
    </template>
    <div>
       <div class="dev-download-notice">
      <i class="fas fa-info-circle" aria-hidden="true" />
      文件生成后会暂存在服务器上，3天后自动删除。
    </div>
    <div class="dev-modal-body">
      <OutputSearchBar
        v-model:name="searchParams.name"
        v-model:states="searchParams.states"
        @search="handleSearch"
        @reset="handleReset"
      />
      <OutputTableSection
        :columns="columns"
        :table-data="tableData"
        :loading="loading"
        :scroll="scroll"
        :download-loading="downloadLoading"
        :pagination="pagination"
        :show-button="showButton"
        @download-item="handleDownloadItem"
        @preview="handlePreview"
        @download="handleDownload"
        @delete="handleDelete"
        @retry="handleRetry"
        @page-change="handlePageChange"
      />
    </div>
    </div>

  </base-modal>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { dowload } from '@/api/user'
import { getOutputRecordPage, deleteOutput } from '@/api/outputManageCenter'
import OutputSearchBar from './components/OutputSearchBar.vue'
import OutputTableSection from './components/OutputTableSection.vue'
import { openBlobForPrint, saveBlob } from '@/utils/export'

interface FileManageRecord {
  id: number
  states: 0 | 1
  error: string | null
  name: string | null
  fileIds: string | null
  downloadState: 0 | 1
  createUser: string | null
  createTime: string | null
  taskScene?: string | null
}

const props = withDefaults(
  defineProps<{
    embedded?: boolean
  }>(),
  {
    embedded: false,
  },
)

const router = useRouter()
const modalRef = ref()
const scroll = { maxHeight: 'calc(100vh - 420px)' }
const tableData = ref<FileManageRecord[]>([])
const loading = ref(false)
const downloadLoading = ref(false)

const searchParams = reactive({
  name: '',
  states: undefined as number | undefined,
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const columns = [
  { title: '序号', slotName: 'index', align: 'center', width: 65 },
  { title: '文件名称', dataIndex: 'name', align: 'left' },
  { title: '场景', dataIndex: 'taskScene', align: 'left', width: 75},
  { title: '状态', dataIndex: 'states', slotName: 'states', align: 'center', width: 75 },
  { title: '操作人', dataIndex: 'createUser', align: 'center', width: 90 },
  { title: '操作时间', dataIndex: 'createTime', align: 'center', width: 175 },
  { title: '操作', slotName: 'operations',  align: 'center',  width: 160 },
]

const showButton = (name: string | null) => {
  if (!name) return false
  return name.toLowerCase().endsWith('.pdf')
}

const buildQueryParams = () => {
  const params: Record<string, unknown> = {
    current: pagination.current,
    size: pagination.pageSize,
    name: searchParams.name || undefined,
  }
  if (searchParams.states === 0 || searchParams.states === 1) {
    params.states = searchParams.states
  }
  return params
}

const fetchTableData = async () => {
  loading.value = true
  try {
    const res = await getOutputRecordPage(buildQueryParams())
    let records: FileManageRecord[] = res.records || []
    if (searchParams.states === 2) {
      records = records.filter((item) => item.states === 0 && !item.fileIds)
    }
    tableData.value = records
    pagination.pageSize = res.size || 10
    pagination.total = searchParams.states === 2 ? records.length : res.total || 0
  } catch {
    Message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchTableData()
}

const handleReset = () => {
  searchParams.name = ''
  searchParams.states = undefined
  handleSearch()
}

const handlePreview = (record: FileManageRecord) => {
  if (!record.fileIds) {
    Message.warning('暂无文件可预览')
    return
  }
  const { href } = router.resolve({
    name: 'iframePreview',
    query: {
      fileId: record.fileIds,
      ...(record.name ? { fileName: record.name } : {}),
    },
  })
  window.open(href, '_blank', 'noopener,noreferrer')
}

const downloadBlob = (record: FileManageRecord, res: BlobPart) => {
  const fileName = record.name || 'download'
  const lowerName = fileName.toLowerCase()
  let type = 'application/msexcel'
  let downloadName = fileName

  if (lowerName.endsWith('.pdf')) {
    type = 'application/pdf'
  } else if (lowerName.endsWith('.xlsx')) {
    type = 'application/msexcel'
  } else if (lowerName.endsWith('.docx')) {
    type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  } else if (lowerName.endsWith('.zip')) {
    type = 'application/zip'
  } else {
    downloadName = `${fileName}.xlsx`
  }

  saveBlob(res, downloadName, type)
}

const handleDownload = (record: FileManageRecord) => {
  downloadLoading.value = true
  dowload({ fileId: record.fileIds })
    .then((res) => {
      openBlobForPrint(res)
    })
    .finally(() => {
      downloadLoading.value = false
    })
}

const handleDownloadItem = (record: FileManageRecord) => {
  downloadLoading.value = true
  dowload({ fileId: record.fileIds })
    .then((res) => {
      downloadBlob(record, res)
    })
    .finally(() => {
      downloadLoading.value = false
    })
}

const handleDelete = (record: FileManageRecord) => {
  Modal.confirm({
    title: '提示',
    simple: true,
    renderToBody: false,
    titleAlign: 'start',
    content: '此操作将删除输出记录，删除后不可恢复，是否继续?',
    hideCancel: false,
    okText: '确认',
    onOk: async () => {
      try {
        await deleteOutput(record.id)
        Message.success('删除成功')
        fetchTableData()
      } catch (error) {
        Message.error('删除失败')
      }
    },
  })
}

const handleRetry = () => {
  Message.info('功能开发中')
}

const handlePageChange = (page: number) => {
  pagination.current = page
  fetchTableData()
}

const handleModalOk = () => {}
const handleModalCancel = () => {}

const open = () => {
  modalRef.value?.handleClick({
    showBtn: true,
    showConfirm: false,
    cancelText: '关闭',
    width: '1000px',
  })
  fetchTableData()
}

onMounted(() => {
  if (!props.embedded) {
    fetchTableData()
  }
})

defineExpose({
  fetchTableData,
  open,
})
</script>

<style lang="scss">
@use '@/styles/developer-center.scss';
</style>

