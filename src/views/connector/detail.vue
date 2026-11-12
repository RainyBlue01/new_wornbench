<template>
  <div class="connector-des">
    <UserBanner url="/connector?menuCode=developerCenter" backLabel="返回连接器" title="连接器详情" />
    <div class="connector-des__body">
      <div class="des-content">
      <div class="top-box">
        <div class="msg-box">
          <div class="msg-item">
            <div class="msg-icon">
              <img src="@/assets/img_lianjieqi@2x.png" alt="" />
            </div>
            <div class="info">
              <div class="title">{{ cnDes.name }}</div>
              <div class="des">{{ cnDes.describe }}</div>
              <div class="des">连接器ID：{{ cnDes.id }}</div>
              <div class="des">上架时间：{{ cnDes.createTime }}</div>
              <div class="des">创建者：{{ cnDes.createUser }}</div>
            </div>
          </div>
          <template v-if="IsMyConnector">
            <a-dropdown @select="changeConnector">
              <icon-more size="24" style="cursor: pointer" />
              <template #content>
                <a-doption value="1">修改</a-doption>
                <a-doption value="2">删除</a-doption>
              </template>
            </a-dropdown>
          </template>
        </div>
        <div class="setUrl" style="margin-top: 24px">
          <div class="url-box">
            <div class="url-left">通信：</div>
            <div class="url-right">
              {{ FormatConnectStr }}
              <span v-if="IsMyConnector" @click="setConnectorConfig">配置</span>
            </div>
          </div>
        </div>
        <div class="setUrl">
          <div class="url-box">
            <div class="url-left">鉴权：</div>
            <div class="url-right" v-if="cnDes.authConfig">
              {{ formatAuthType(cnDes.authConfig.classify) }}
              <span v-if="IsMyConnector" @click="setConnectorAuthConfig">配置</span>
            </div>
            <div class="url-right" v-if="!cnDes.authConfig">请配置鉴权方案 <span v-if="IsMyConnector"
                @click="setConnectorAuthConfig">配置</span></div>
          </div>
        </div>
      </div>
      <div class="scene-box">
        <div class="scene-title">
          <div class="title-name">动作</div>
          <a-button v-if="IsMyConnector" class="scene-create-btn" @click="handleConnectorScene">
            <icon-plus />
            创建
          </a-button>
        </div>
        <div class="table">
          <a-table :data="tableData" :pagination="false" :bordered="false" row-key="id">
            <template #columns>
              <a-table-column title="序号" :width="70" align="center">
                <template #cell="{ rowIndex }">
                  {{ rowIndex + 1 }}
                </template>
              </a-table-column>
              <a-table-column title="动作名称" data-index="name" />
              <a-table-column title="动作Id" data-index="id" />
              <template v-if="IsMyConnector">
                <a-table-column title="当前流程" :width="100">
                  <template #cell="{ record }">
                    <a-dropdown>
                      <span class="arco-dropdown-link">
                        {{ record.processList?.length || 0 }}
                        <icon-down />
                      </span>
                      <template #content>
                        <a-doption v-for="item in record.processList" :key="item.processId" :value="item.processId">
                          {{ item.processName }}
                        </a-doption>
                      </template>
                    </a-dropdown>
                  </template>
                </a-table-column>
                <a-table-column title="鉴权" :width="100">
                  <template #cell="{ record }">
                    <a-switch v-model="record.auth" :disabled="!record.enableAuth"
                      @change="changeAuthSwitch($event, record)" />
                  </template>
                </a-table-column>
                <a-table-column title="回调" :width="100">
                  <template #cell="{ record }">
                    <a-switch v-model="record.callback" :disabled="!record.enableCallback"
                      @change="changeCallbackSwitch($event, record)" />
                  </template>
                </a-table-column>
                <a-table-column title="上架" :width="100">
                  <template #cell="{ record }">
                    <a-switch v-model="record.state" @change="changeStateSwitch($event, record)" />
                  </template>
                </a-table-column>
                <a-table-column title="请求类型" :width="200">
                  <template #cell="{ record }">
                    <a-radio-group v-model="record.syncType" direction="horizontal"
                      @change="changeSyncTypeSwitch($event, record)">
                      <a-radio :value="0">同步</a-radio>
                      <a-radio :value="1">异步</a-radio>
                    </a-radio-group>
                  </template>
                </a-table-column>
                <a-table-column title="操作" :width="100" fixed="right">
                  <template #cell="{ record }">
                    <a-dropdown @select="handleSceneOperate($event, record)">
                      <span class="arco-dropdown-link">
                        查看 <icon-down />
                      </span>
                      <template #content>
                        <a-doption value="1">配置</a-doption>
                        <a-doption value="2">运行日志</a-doption>
                        <a-doption value="3">调试</a-doption>
                        <a-doption value="4">删除</a-doption>
                      </template>
                    </a-dropdown>
                  </template>
                </a-table-column>
              </template>
              <template v-else>
                <a-table-column title="回调" :width="100">
                  <template #title>
                    <div class="header-item">
                      <a-tooltip content="根据回调内容可自行设计业务逻辑" position="top">
                        <img class="icon" src="@/assets/icon_weizhi.svg" alt="" />
                      </a-tooltip>
                      <span>回调</span>
                    </div>
                  </template>
                  <template #cell="{ record }">
                    <span :style="record.callback ? 'color:#4080ff;' : 'color:#F26161;'">
                      {{ record.callback ? '是' : '否' }}
                    </span>
                  </template>
                </a-table-column>
              </template>
            </template>
          </a-table>
          <div class="table-page">
            <div class="left">
              共 {{ page.total }} 项数据，每页显示
              <a-select class="select" :style="{ width: '70px' }" v-model="page.pageSize" @change="handleSizeChange">
                <a-option v-for="item in pageSizeOptions" :key="item" :value="item">
                  {{ item }}
                </a-option>
              </a-select>
              条数据
            </div>
            <a-pagination :total="page.total" :current="page.pageNum" :page-size="page.pageSize" show-jumper
              @change="handleCurrentChange" />
          </div>
        </div>
      </div>
      </div>
    </div>

    <CreateModal ref="refModifyConfigModal" @refresh="getDes(false)"></CreateModal>

    <ConfigModel ref="refConfigModal" @refresh="getDes(false)" />

    <AuthConfigDrawer ref="refAuthConfigDrawer" @refresh="getDes(false)" />

    <SceneConfigModal ref="refSceneConfigModal" @refresh="getDes(true)" />

    <SceneLogModal ref="refSceneLogModal" />

    <SceneDebugModal ref="refSceneDebugModal" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import UserBanner from "@/components/banner/userBanner.vue";
import {
  deleteConnector,
  deleteSceneConfig,
  getConnectorDes,
  getConnectorScenePage,
  setSceneCallback,
  setSceneEnableAuth,
  setSceneState,
  setSceneSyncType
} from "@/api/connector";
import ConfigModel from "@/views/connector/components/configModel.vue";
import AuthConfigDrawer from "@/views/connector/components/authConfigDrawer.vue";
import SceneConfigModal from "@/views/connector/components/SceneConfigModal.vue";
import SceneLogModal from "@/views/connector/components/sceneLogModal.vue";
import SceneDebugModal from "@/views/connector/components/sceneDebugModal.vue";
import CreateModal from "@/views/connector/components/createModal.vue";

const route = useRoute()
const router = useRouter()

const cnDes = ref({})
const tableData = ref([])
const desId = ref(null)
// 1:公共 2：我的
const desType = ref(null)
const page = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})
const pageSizeOptions = [10, 20, 30, 40]

const refModifyConfigModal = ref()
const refConfigModal = ref()
const refAuthConfigDrawer = ref()
const refSceneConfigModal = ref()
const refSceneLogModal = ref()
const refSceneDebugModal = ref()

const IsMyConnector = computed(() => {
  return desType.value == 2
})

const FormatConnectStr = computed(() => {
  return cnDes.value.config
    ? cnDes.value.config.protocol + '://' + cnDes.value.config.host + ':' + cnDes.value.config.port + cnDes.value.config.commonPath
    : '请配置业务域名及端口'
})

// 格式化鉴权类型
const formatAuthType = (val: any) => {
  switch (val) {
    case 0:
      return 'none'
    case 1:
      return 'token'
    case 2:
      return 'Basic Auth'
    default:
      return ''
  }
}

// 获取连接器详情
const getDes = async (isRefreshScene: boolean = true) => {
  try {
    cnDes.value = await getConnectorDes(desId.value)
    if (isRefreshScene) {
      await getScenePage()
    }
  } catch (error) {
    Message.error('获取详情失败')
  }
}

const changeConnector = (val: any) => {
  if (val === '1') {
    refModifyConfigModal.value.showModal(cnDes.value)
  } else if (val === '2') {
    // 删除连接器
    Modal.confirm({
      title: "提示",
      simple: true,
      renderToBody: false,
      titleAlign: "start",
      content: '此操作将删除连接器场景,删除后看不到以往相关运行日志,是否继续?',
      hideCancel: false,
      okText: "确认",
      onOk: () => {
        deleteConnector(cnDes.value.id).then(() => {
          Message.success('删除连接器成功')
          router.go(-1)
        })
      }
    })
  }
}

// 通信配置
const setConnectorConfig = () => {
  refConfigModal.value.showModal(desId.value, cnDes.value.config)
}

// 鉴权配置
const setConnectorAuthConfig = () => {
  refAuthConfigDrawer.value.showModal(desId.value, cnDes.value.authConfig)
}

const handleCurrentChange = (val: number) => {
  page.pageNum = val
  getScenePage()
}

const handleSizeChange = (val: number) => {
  page.pageSize = val
  page.pageNum = 1
  getScenePage()
}

const getScenePage = async () => {
  try {
    const params = {
      current: page.pageNum,
      size: page.pageSize,
      type: desType.value,
    }
    const res = await getConnectorScenePage(desId.value, params)
    page.total = res.total || 0

    if (res && res.records) {
      tableData.value = res.records.map(v => ({
        ...v,
        auth: v.auth === 1,
        state: v.state === 1,
        callback: v.callback === 1,
      }))
    } else {
      tableData.value = []
    }
  } catch (error) {
    Message.error('获取场景列表失败')
    tableData.value = []
  }
}

const changeAuthSwitch = async (val: any, record: any) => {
  try {
    const params = {
      enableAuth: val == true ? 1 : 0
    }
    await setSceneEnableAuth(record.id, params)
    Message.success(val ? '开启鉴权成功' : '关闭鉴权成功')
  } catch (error) {
    Message.error('操作失败')
    record.auth = !val
  }
}

const changeCallbackSwitch = async (val: any, record: any) => {
  try {
    const params = {
      callback: val == true ? 1 : 0
    }
    await setSceneCallback(record.id, params)
    Message.success(val == true ? '开启回调成功' : '关闭回调成功')
  } catch (error) {
    Message.error('操作失败')
    record.callback = !val
  }
}

const changeStateSwitch = async (val: any, record: any) => {
  try {
    const params = {
      state: val == true ? 1 : 0
    }
    await setSceneState(record.id, params)
    Message.success(val == true ? '上架成功' : '下架成功')
  } catch (error) {
    Message.error('操作失败')
    record.state = !val
  }
}

const changeSyncTypeSwitch = async (val: any, record: any) => {
  try {
    const params = {
      syncType: val
    }
    await setSceneSyncType(record.id, params)
    Message.success(val == 1 ? '更新请求类型异步成功' : '更新请求类型同步成功')
  } catch (error) {
    Message.error('操作失败')
    record.syncType = val == 1 ? 0 : 1
  }
}

const handleConnectorScene = () => {
  refSceneConfigModal.value.showModal(desId.value, null, false)
}

const handleSceneOperate = (val: any, record: any) => {
  if (val == 1) {
    // 配置
    refSceneConfigModal.value.showModal(desId.value, record, cnDes.value?.authConfig ? true : false)
  } else if (val == 2) {
    refSceneLogModal.value.showModal(record)
  } else if (val == 3) {
    refSceneDebugModal.value.showModal(record, cnDes.value)
  } else if (val == 4) {
    // 删除场景
    Modal.confirm({
      title: "提示",
      simple: true,
      renderToBody: false,
      titleAlign: "start",
      content: '此操作将删除连接器动作, 是否继续?',
      hideCancel: false,
      okText: "确认",
      onOk: () => {
        deleteSceneConfig(record.id).then(() => {
          Message.success('删除动作成功')
          getScenePage()
        })
      }
    })
  }
}

// 生命周期
onMounted(() => {
  desId.value = route.query.id
  desType.value = route.query.type
  if (desId.value) {
    getDes()
  }
})
</script>

<style lang="scss" scoped>
.connector-des {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 0;
  overflow: hidden;
}

.connector-des__body {
  flex: 1;
  min-height: 0;
  overflow-x: auto;
  overflow-y: auto;
}

.des-content {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 1200px;
  min-height: 100%;
  padding: 16px 0;
  margin: 0 auto;

  .top-box {
    background-color: #fff;
    padding: 24px 32px;

    .msg-box {
      display: flex;
      width: 100%;
      padding-bottom: 24px;
      border-bottom: 2px solid rgba(0, 0, 0, 0.1);
      justify-content: space-between;

      .msg-item {
        display: flex;

        .msg-icon {
          width: 83px;
          height: 98px;
          display: flex;
          align-items: center;
          justify-content: center;

          img {
            width: 83px;
            height: 98px;
          }
        }

        .info {
          margin-left: 32px;

          .title {
            color: rgba(0, 0, 0, 0.9);
            font-size: 16px;
            text-align: left;
            margin-bottom: 16px;
          }

          .des {
            color: rgba(0, 0, 0, 0.6);
            font-size: 14px;
            line-height: 22px;
            text-align: left;
          }
        }
      }
    }

    .setUrl {
      margin-top: 16px;
    }

    .url-box {
      display: flex;

      .url-right {
        span {
          margin-left: 16px;
          cursor: pointer;
          color: rgb(var(--primary-5));
        }
      }
    }
  }

  .scene-box {
    display: flex;
    flex-direction: column;
    flex: 1;
    background-color: #fff;
    padding: 16px;
    margin-top: 8px;

    .scene-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      .title-name {
        color: rgba(0, 0, 0, 0.9);
        font-size: 16px;
        text-align: left;
      }

      .scene-create-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 7px 14px;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        background: #f8fafc;
        color: #64748b;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s;

        &:hover {
          border-color: #e2e8f0;
          background: #f1f5f9;
          color: #334155;
        }
      }
    }

    .table {
      display: flex;
      flex-direction: column;
      flex: 1;

      :deep(.arco-table) {
        height: 100%;

        th {
          color: rgba(0, 0, 0, 0.4);
          background: #f7f7f7;
          font-size: 14px;
          font-weight: 400;
        }

        td {
          color: rgba(0, 0, 0, 0.9);
          background-color: #fff;
          font-size: 14px;
        }
      }

    }
  }
}

.table-page {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;

  .left {
    color: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.header-item {
  display: flex;
  align-items: center;
  gap: 4px;

  .icon {
    cursor: pointer;
    width: 16px;
    height: 16px;
  }
}
</style>
