<template>
  <div class="sys-settings-page person-page dictionary-page">
    <userBanner url="/homepage" :title="'基础资源'" :active="3" />
    <div class="sys-settings-main config-layout person-layout">
      <DictionaryCatalogueSidebar
        :catalogues="catalogueList"
        :active-id="activeCatalogueId"
        @select="selectCatalogue"
        @add-catalogue="addDict(1)"
        @edit-catalogue="editDict"
      />

      <div class="config-main">
        <div class="sys-card person-main-card">
          <div class="card-header">
            <h3>{{ pageTitle }}</h3>
            <div class="header-actions">
              <a-button
                type="primary"
                class="btn-primary-sm"
                :disabled="!activeCatalogueId"
                @click="addDict(2)"
              >
                <template #icon><icon-plus /></template>
                新增字典项
              </a-button>
            </div>
          </div>
          <div class="card-body person-card-body">
            <DictionaryItemPanel
              :records="pageRecords"
              :loading="loading"
              :pagination="pagination"
              @page-change="onPageChange"
              @page-size-change="onPageSizeChange"
              @edit="editDictValue"
              @toggle-active="onToggleActive"
            />
          </div>
        </div>
      </div>
    </div>
    <create ref="createRef" @init="init" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getCatalogue, getDict, changeItemActive } from '@/api/dictionaryList/index'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import create from './create.vue'
import DictionaryCatalogueSidebar, {
  type DictionaryCatalogue,
} from './components/DictionaryCatalogueSidebar.vue'
import DictionaryItemPanel, {
  type DictionaryItem,
} from './components/DictionaryItemPanel.vue'

const CATALOGUE_STORAGE_KEY = 'dictionaryActiveCatalogueId'

const catalogueList = ref<DictionaryCatalogue[]>([])
const activeCatalogueId = ref<string | number | undefined>()
const allItems = ref<DictionaryItem[]>([])
const loading = ref(false)
const createRef = ref<InstanceType<typeof create> | null>(null)

const pagination = ref({
  total: 0,
  pageNum: 1,
  pageSize: 10,
})

const pageTitle = computed(() => {
  const current = catalogueList.value.find((c) => c.id === activeCatalogueId.value)
  return current?.catalogue || '字典项列表'
})

const pageRecords = computed(() => {
  const start = (pagination.value.pageNum - 1) * pagination.value.pageSize
  return allItems.value.slice(start, start + pagination.value.pageSize)
})

const restoreCatalogueId = (list: DictionaryCatalogue[]) => {
  const saved = localStorage.getItem(CATALOGUE_STORAGE_KEY)
  if (saved != null) {
    const found = list.find((c) => String(c.id) === saved)
    if (found) return found.id
  }
  return list[0]?.id
}

const selectCatalogue = (id: string | number) => {
  activeCatalogueId.value = id
  localStorage.setItem(CATALOGUE_STORAGE_KEY, String(id))
  pagination.value.pageNum = 1
  getList()
}

const getCata = () => {
  getCatalogue({}).then((res) => {
    catalogueList.value = res || []
    if (!catalogueList.value.length) {
      activeCatalogueId.value = undefined
      allItems.value = []
      pagination.value.total = 0
      return
    }
    activeCatalogueId.value = restoreCatalogueId(catalogueList.value)
    if (activeCatalogueId.value != null) {
      localStorage.setItem(CATALOGUE_STORAGE_KEY, String(activeCatalogueId.value))
      getList()
    }
  })
}

getCata()

const getList = () => {
  if (activeCatalogueId.value == null) return
  loading.value = true
  getDict(activeCatalogueId.value)
    .then((res) => {
      allItems.value = res || []
      pagination.value.total = allItems.value.length
      const maxPage = Math.max(1, Math.ceil(pagination.value.total / pagination.value.pageSize) || 1)
      if (pagination.value.pageNum > maxPage) {
        pagination.value.pageNum = maxPage
      }
    })
    .finally(() => {
      loading.value = false
    })
}

const onPageChange = (page: number) => {
  pagination.value.pageNum = page
}

const onPageSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.pageNum = 1
}

const onToggleActive = (item: DictionaryItem) => {
  changeItemActive(item.id).then(() => {
    Message.success(`${item.active == 0 ? '启用' : '停用'}成功`)
    getList()
  })
}

const addDict = (val: number) => {
  if (val === 1) {
    createRef.value?.showItem(val, { id: '' })
  } else {
    createRef.value?.showItem(val, { id: '', catalogueId: activeCatalogueId.value })
  }
}

const editDict = (item: DictionaryCatalogue) => {
  createRef.value?.showItem(1, item)
}

const editDictValue = (item: DictionaryItem, rowIndex: number) => {
  const globalIndex =
    (pagination.value.pageNum - 1) * pagination.value.pageSize + rowIndex
  createRef.value?.showItem(2, {
    ...item,
    catalogueId: activeCatalogueId.value,
    sortOrder: globalIndex,
  })
}

const init = (val: number) => {
  if (val === 1) {
    getCata()
  } else {
    getList()
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/system-settings.scss';

.person-layout {
  width: 100%;
  max-width: 1200px;
  align-items: flex-start;
  min-height: 0;
  margin-bottom: 0;
  padding-bottom: 20px;
}

.config-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
  max-height: var(--person-layout-height);
}

.person-main-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 100%;

  .card-header {
    flex-shrink: 0;
  }
}

.person-card-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 16px 20px 16px;
}

.person-card-body :deep(.dictionary-item-panel) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.person-card-body :deep(.person-pagination) {
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-primary-sm {
  border-radius: 10px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  height: auto !important;
  padding: 7px 14px !important;
}
</style>

<style lang="scss">
@use '@/styles/person-modal.scss';
</style>

<style>
.arco-modal-simple .arco-modal-footer {
  text-align: right;
}
</style>
