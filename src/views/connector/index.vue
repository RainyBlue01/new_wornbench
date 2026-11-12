<template>
  <div class="developer-page">
    <UserBanner url="/homepage" title="开发者中心" active="2" />
    <div class="dev-main">
      <div class="conn-tip">
        <div class="conn-tip__icon">
          <icon-bulb />
        </div>
        <div>
          <p class="conn-tip__title">什么是连接器？</p>
          <p class="conn-tip__desc">
            连接器是一种开箱即用的数据交互桥梁，它将复杂的底层接口封装成了可视化界面，让用户无需写代码就能实现不同软件间的自动化联动。
          </p>
        </div>
      </div>

      <div class="dev-card">
        <div class="dev-card-header">
          <div class="conn-sub-tabs">
            <button
              type="button"
              :class="['conn-nav-btn', { 'conn-nav-btn--active': active === 1 }]"
              @click="setTopTabActive(1)"
            >
              公共连接器
            </button>
            <button
              type="button"
              :class="['conn-nav-btn', { 'conn-nav-btn--active': active === 2 }]"
              @click="setTopTabActive(2)"
            >
              我创建的
            </button>
          </div>
          <div class="dev-toolbar-actions">
            <a-input
              v-model="searchConnectorName"
              class="dev-search-input conn-search"
              placeholder="搜索连接器名称..."
              allow-clear
              @change="handleSearch"
            />
            <a-button class="dev-add-btn" @click="createConnector">
              <template #icon>
                <icon-plus />
              </template>
              创建连接器
            </a-button>
          </div>
        </div>
        <div class="dev-card-body dev-card-body-scroll">
          <div v-if="connectorList.length > 0" class="connector-list">
            <div
              v-for="item in connectorList"
              :key="item.id"
              class="connector-card"
            >
              <div
                class="connector-icon"
                :style="getIconStyle(item.name)"
              >
                <img src="@/assets/img_lianjieqi@2x.png" alt="" />
              </div>
              <div class="connector-info">
                <a-tooltip v-if="item.name && item.name.length > 20" :content="item.name">
                  <div class="connector-name">{{ item.name }}</div>
                </a-tooltip>
                <div v-else class="connector-name">{{ item.name }}</div>
                <div class="connector-desc">{{ getDescribe(item) }}</div>
                <div class="connector-tags">
                  <span v-if="active === 1" class="conn-tag">官方</span>
                  <span v-if="item.sceneNum != null" class="conn-tag">
                    动作 {{ item.sceneNum }}
                  </span>
                </div>
              </div>
              <div class="connector-actions">
                <a-button class="conn-config-btn" @click="goToDes(item)">
                  <template #icon>
                    <icon-settings />
                  </template>
                  配置
                </a-button>
              </div>
            </div>
          </div>
          <div v-else class="conn-empty">
            <icon-storage class="conn-empty__icon" />
            <p class="conn-empty__title">
              {{ active === 2 ? '暂无自定义连接器' : '暂无连接器' }}
            </p>
            <p v-if="active === 2" class="conn-empty__hint">
              点击右上角「创建连接器」开始创建
            </p>
          </div>
        </div>
      </div>
    </div>
    <CreateModal ref="refCreateModal" @refresh="handleSearch" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconBulb, IconPlus, IconSettings, IconStorage } from '@arco-design/web-vue/es/icon'
import UserBanner from '@/components/banner/userBanner.vue'
import { getConnectorList } from '@/api/connector'
import CreateModal from '@/views/connector/components/createModal.vue'

interface ConnectorItem {
  id: string | number
  name: string
  describe?: string
  sceneNum?: number
}

const ICON_PALETTES = [
  { bg: '#fff7ed', color: '#f97316' },
  { bg: '#f0fdf4', color: '#16a34a' },
  { bg: '#eff6ff', color: 'rgb(var(--primary-6))' },
  { bg: '#f5f3ff', color: '#8b5cf6' },
]

const CONNECTOR_TAB_STORAGE_KEY = 'connectorActiveTab'

const restoreActiveTab = (): number => {
  const saved = localStorage.getItem(CONNECTOR_TAB_STORAGE_KEY)
  const val = saved != null ? Number(saved) : 1
  return val === 1 || val === 2 ? val : 1
}

const router = useRouter()
const active = ref(restoreActiveTab())
const searchConnectorName = ref('')
const connectorList = ref<ConnectorItem[]>([])
const refCreateModal = ref<InstanceType<typeof CreateModal> | null>(null)

const hashName = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

const getIconStyle = (name: string) => {
  const palette = ICON_PALETTES[hashName(name || '') % ICON_PALETTES.length]
  return {
    background: palette.bg,
    color: palette.color,
  }
}

const getDescribe = (item: ConnectorItem) => {
  if (item.describe) return item.describe
  if (item.sceneNum != null) return `共 ${item.sceneNum} 个动作`
  return ''
}

const setTopTabActive = (val: number) => {
  active.value = val
  localStorage.setItem(CONNECTOR_TAB_STORAGE_KEY, String(val))
  getList()
}

const createConnector = () => {
  refCreateModal.value?.showModal(null)
}

const getList = async () => {
  try {
    const params = {
      name: searchConnectorName.value || '',
      type: active.value,
    }
    const res = await getConnectorList(params)
    connectorList.value = res && res.length > 0 ? res : []
  } catch {
    Message.error('获取连接器列表失败')
  }
}

const handleSearch = () => {
  getList()
}

const goToDes = (item: ConnectorItem) => {
  router.push({ path: '/connectorDes', query: { id: String(item.id), type: String(active.value) } })
}

onMounted(() => {
  handleSearch()
})

let timer: ReturnType<typeof setTimeout> | null = null
watch(() => searchConnectorName.value, () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    handleSearch()
  }, 300)
})
</script>

<style lang="scss" scoped>
@use '@/styles/developer-center.scss';
</style>
