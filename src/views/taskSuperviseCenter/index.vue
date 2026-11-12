<template>
  <div class="flowCenter">
    <UserBanner url="/homepage" title="任务监督" />
    <div class="flowCenter-body" v-if="[1, 2].includes(userType)">
      <!--      侧边栏-->
      <div class="left-box">
        <div class="top-input">
          <div class="input-box">
            <div class="left">
              <a-select v-model="searchSelectVal" placeholder="请选择" @change="changeSearchSelect" style="width: 90px">
                <a-option :value="1">年份</a-option>
                <a-option :value="2">任务名称</a-option>
                <a-option :value="3">发布部门</a-option>
                <a-option :value="4">应用分类</a-option>
                <a-option :value="5">应用</a-option>
              </a-select>
            </div>
            <div class="right">
              <template v-if="searchSelectVal === 1">
                <a-date-picker v-model="searchVal" @change="handleSearch" mode="year" allow-clear placeholder="选择日期" />
              </template>
              <template v-if="searchSelectVal === 2">
                <a-input v-model="searchVal" placeholder="搜索" @change="handleSearch" />
              </template>
              <template v-if="searchSelectVal === 3">
                <a-cascader :options="deptOptions" v-model="searchVal" @change="handleSearch" :multiple="true"
                  :check-strictly="true" :field-names="{ value: 'id', label: 'label' }" allow-clear placeholder="请选择" />
              </template>
              <template v-if="searchSelectVal === 4">
                <a-select v-model="searchVal" placeholder="请选择" allow-clear @change="handleSearch">
                  <a-option v-for="(item, index) in appCategoryOptions" :key="index" :value="item.id">
                    {{ item.category }}
                  </a-option>
                </a-select>
              </template>
              <template v-if="searchSelectVal === 5">
                <a-select v-model="searchVal" placeholder="请选择应用" allow-clear @change="handleSearch">
                  <a-option v-for="(item, index) in appList" :key="index" :value="item.id">
                    {{ item.appName }}
                  </a-option>
                </a-select>
              </template>
            </div>
          </div>
        </div>
        <div class="bottoms">
          <div class="bottoms-title">
            <div @click="changeTaskState(item.id)"
              :class="taskState === item.id ? 'active bottoms-title-item' : 'bottoms-title-item'"
              v-for="item in stateList" :key="item.id">
              {{ item.name }}
            </div>
          </div>
        </div>
        <div class="nameList">
          <div v-if="taskList.length > 0">
            <a-list :bordered="false" :data="taskList" :bottom-offset="10" @reach-bottom="refreshTaskList">
              <template #item="{ item }">
                <div :class="activeTask?.id === item.id ? 'active nameList-item' : 'nameList-item'"
                  @click="setActiveTask(item)">
                  <div class="icon"></div>
                  {{ item.taskName }}
                </div>
              </template>
            </a-list>
            <p v-if="dataLoading" class="loading">加载中...</p>
            <p v-if="noMore" class="loading">没有更多了</p>
          </div>
          <div class="empty-box" v-else>
            <div class="img">
              <img src="@/assets/zanwuneirong@2x.png" alt="">
            </div>
            <div class="tit">
              当前无填报任务
            </div>
          </div>
        </div>
      </div>
      <div class="right-box" v-if="taskList.length > 0">
        <div class="center-title">
          <div class="title-name">
            {{ activeTask?.taskName }}（周期：{{
              activeTask?.startDate
            }} - {{ activeTask?.stopDate }}）
          </div>
          <div class="title-des">
            <a-tag :color="activeTask?.taskStatus === 1 ? 'arcoblue' : 'gray'" size="small">
              {{ activeTask?.taskStatus === 1 ? '进行中' : '已结束' }}
            </a-tag>
            <div class="right-title" v-show="activeTask?.category === 2">
              <div class="img">
                <img src="../../assets/icon_jiedian.svg" alt="">
              </div>
              审批流程
            </div>
            <div class="dept">
              发布部门：<span>{{(activeTask?.publisher || []).map(_ => _.deptName).join(",")}}</span>
            </div>
            <div class="manager">
              监督人员：<span>{{(activeTask?.supervisor || []).map(_ => _.nickname).join(",")}}</span>
            </div>
          </div>
        </div>
        <div class="batch-table" v-if="Object.keys(activeBatch).length > 0">
          <!--        批次详情-->
          <div class="batch">
            <div class="batch-left">
              <div class="left-top">
                <a-dropdown @select="setActiveBatch">
                  <a-button type="text">
                    {{ activeBatch?.batchDate }}批次填报清单
                    <icon-down />
                  </a-button>
                  <template #content>
                    <a-doption v-for="(item, index) in fillBatchList" :key="index" :value="item">{{
                      item.batchDate
                    }}批次填报清单
                    </a-doption>
                  </template>
                </a-dropdown>
              </div>
              <div class="left-bottom">
                <div class="reportTime">
                  填报时间： {{ activeBatch?.fillStartTime }} - {{ activeBatch?.fillStopTime }}
                </div>
                <div class="fillTotal">
                  应填报人数：{{ activeBatch?.fillTotal }}人
                </div>
              </div>
            </div>
            <div class="batch-right">
              <span>进度</span>
              <a-progress :percent="Number((activeBatch?.finishTotal / activeBatch?.fillTotal).toFixed(1))"
                :stroke-width="6" color="#366F36" />
              <div class="small" @click="copyFillLink">复制填报链接</div>
            </div>
          </div>
          <!--        表格数据-->
          <div class="table">
            <div class="table-title">
              <div class="input">
                <div class="input-search">
                  <span class="label">填报对象</span>
                  <a-input v-model="fillObjectName" placeholder="请输入填报对象姓名" @change="refreshFillBatchObjectList" />
                </div>
                <div class="input-search">
                  <span class="label">填报部门</span>
                  <a-cascader placeholder="请选择填报部门" :options="deptOptions" v-model="fillObjectDeptIds" :multiple="true"
                    :check-strictly="true" :field-names="{ value: 'id', label: 'label' }" allow-clear
                    @change="refreshFillBatchObjectList" />
                </div>
              </div>
              <div class="table-btn-boxs">
                <div class="table-btn">
                  <a-button :type="fillStateVal === '0' ? 'primary' : 'text'" @click="changeFillStateVal('0')">待填报
                  </a-button>
                  <a-button :type="fillStateVal === '1' ? 'primary' : 'text'" @click="changeFillStateVal('1')">已填报
                  </a-button>
                </div>
                <div class="table-right">
                  <div class="table-right-btn" @click="changeTableOrder">
                    <icon-sort-ascending />
                    {{ fillObjectOrder === 1 ? '最新' : '最旧' }}
                  </div>
                  <div class="table-right-btn" @click="changeFillStateVal(null)">
                    <icon-refresh />
                    刷新
                  </div>
                  <template v-if="fillStateVal === '1'">
                    <a-button size="small" @click="openFixModel">待处理纠错({{ fixRecordCountVal }})</a-button>
                    <a-dropdown @select="handDowload">
                      <a-button size="small" :loading="downloadLoading">
                        下载
                        <icon-down />
                      </a-button>
                      <template #content>
                        <a-doption :value="1">word</a-doption>
                        <a-doption :value="2">pdf</a-doption>
                        <a-doption :value="3">excel</a-doption>
                      </template>
                    </a-dropdown>
                    <a-button size="small" :loading="downloadLoading" @click="handPrint(2)">打印</a-button>
                  </template>
                  <template
                    v-if="fillStateVal === '0' && activeBatch?.batchState === 1 && fillBatchObjectList.length > 0">
                    <a-button size="small" @click="handleFillObjectOperate('urgeAll')">催办全部</a-button>
                  </template>
                </div>
              </div>
            </div>
            <div class="table-body">
              <template v-if="fillStateVal === '0'">
                <a-table :scroll="scroll" :data="fillBatchObjectList" :columns="tableColumns" :pagination="false"
                  style="width: 100%">
                  <template #operation="record">
                    <template v-if="fillStateVal === '0' && activeBatch?.batchState === 1">
                      <div class="center-text" @click="handleFillObjectOperate('urge', record)">
                        催一下
                      </div>
                    </template>
                  </template>
                </a-table>
              </template>
              <template v-if="fillStateVal === '1'">
                <a-table :scroll="scroll" :data="fillBatchObjectList" :columns="tableColumns" :pagination="false"
                  style="width: 100%">
                  <template #operation="record">
                    <template v-if="fillStateVal === '1'">
                      <div class="center-text" v-if="activeBatch?.batchState === 1"
                        @click="handleFillObjectOperate('refill', record)">
                        重填
                      </div>
                      <div class="center-text" @click="seeData(record)">
                        查看
                      </div>
                    </template>
                  </template>
                </a-table>
              </template>
            </div>
            <div class="table-bottom">
              <div class="left">
                共 {{ tablePage.total }} 项数据，每页显示
                <a-select v-model="tablePage.pageSize" @change="handleSizeChange" style="width: 80px; margin: 0 8px;">
                  <a-option v-for="item in tablePageOptions" :key="item.value" :value="item.value">{{
                    item.label
                  }}
                  </a-option>
                </a-select>
                条数据
              </div>
              <a-pagination :total="tablePage.total" :current="tablePage.pageNum" :page-size="tablePage.pageSize"
                @change="handleCurrentChange" show-total :show-jumper="false" />
            </div>
          </div>
        </div>
        <div class="right-emp" style="flex: 1; width: 100%" v-else>
          <!--        <div class="right-emp" style="width: 100%;height: 90%" v-else>-->
          <div class="empty-box">
            <div class="img">
              <img src="@/assets/zanwuneirong@2x.png" alt="">
            </div>
            <div class="tit">
              当前无填报任务批次
            </div>
          </div>
        </div>
      </div>
      <div class="right-emp" v-else>
        <div class="empty-box">
          <div class="img">
            <img src="@/assets/zanwuneirong@2x.png" alt="">
          </div>
          <div class="tit">
            当前无填报任务
          </div>
        </div>
      </div>
    </div>
    <div class="flowCenter-empty" v-else>
      <div class="msg">
        <div class="msg-title">
          温馨提示：
        </div>
        <div class="msg-des">
          填报任务与常规应用表单的区别，填报任务是通过常规应用表单发布而来；填报任务可设置任务监督员，来督促填报工作，它是一项任务；而常规应用表单是根据自身业务需要按需填写，并非任务性质。
        </div>
      </div>
      <div class="empty-box">
        <a-empty description="你当前不是任务监督员">
          <template #description>
            <div class="des-tit">你当前不是任务监督员</div>
            <div class="des">每个填报任务可以独立设置监督员，监督员可以通过该模块对填报进度进行监督</div>
          </template>
        </a-empty>
      </div>
    </div>
    <a-modal v-model:visible="templateModalVisible" title="选择模板" width="600px" @ok="handleTemplateConfirm"
      :confirm-loading="downloadLoading">
      <a-radio-group v-model="selectedTemplateId" direction="vertical" style="max-height: 400px; overflow-y: auto;">
        <a-radio :value="item.id" v-for="item in templateList" :key="item.id">
          {{ item.fileName }}
        </a-radio>
      </a-radio-group>
    </a-modal>
    <fixRecord style="position: absolute;" ref="fixRecordRef" />
    <upDateData ref="upDateDataRef" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import fixRecord from './fixRecord.vue'
import { getPrint } from '@/api/application/index'
import { IconDown, IconRefresh, IconSortAscending } from '@arco-design/web-vue/es/icon'
import upDateData from "../application/original/upDateData.vue";
import UserBanner from "@/components/banner/userBanner.vue";
import {
  fillObjectLaunchReset,
  fillObjectUrge,
  getCategoryList,
  getFillTaskList,
  getFixRecordCount,
  getTaskBatchList,
  getTaskBatchObjectList,
  printList,
  getFillBatchTask
} from "@/api/taskFillManager/index.js";
import { getDeptTree, getAppList } from "@/api/common";
import { convertToColumns, getFormById, setFormById } from "@/utils/form.ts";
import { getCreatorApp } from "@/api/form";

const router = useRouter()

// 状态变量
const userType = ref(1)
const upDateDataRef = ref()
const searchSelectVal = ref(2)
const searchVal = ref('')
const fixRecordRef = ref()
const appCategoryOptions = ref([])
const taskState = ref(1)
const dataLoading = ref(false)
const noMore = ref(false)

// 模板选择弹窗相关
const templateModalVisible = ref(false)
const selectedTemplateId = ref()
const templateList = ref([])
const downloadLoading = ref(false)

const taskList = ref([])
const activeTask = ref({})
const stateList = ref([
  { id: 1, name: '进行中的' },
  { id: 3, name: '已结束的' }
])
const page = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})
// ------------------------
const fixRecordCountVal = ref(0)
const fillStateVal = ref('0')
const deptOptions = ref([])
// 填报对象姓名搜索
const fillObjectName = ref('')
const fillObjectDeptIds = ref([])
const appList = ref([])
// 填报对象排序
const fillObjectOrder = ref(1)
const activeBatch = ref({})
const fillBatchList = ref([])
const fillBatchObjectList = ref([])
const tableColumns = ref([]);
//固定字段
const fixColumns = [
  {
    title: "填报对象",
    dataIndex: "nickname",
  },
  {
    title: "填报对象所在部门",
    dataIndex: "deptName",
  }
];
const tablePageOptions = ref([
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 30, label: '30' },
  { value: 40, label: '40' }
])
const scroll = { y: 'calc(-450px + 100vh)' };
const tablePage = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})
const seeData = (val: any) => {
  // console.log(val.record.formData)
  getFillBatchTask(val.record.id).then(res => {
    // let formConfig = JSON.parse(res.designInfo.formConfig)
    upDateDataRef.value.showItems({ dataValue: res.formData }, res.formId, true, activeBatch.value.appId)
  })

}
const disabled = computed(() => {
  return dataLoading.value || noMore.value
})
const openFixModel = () => {
  fixRecordRef.value.showItem(activeBatch.value)
}
const changeSearchSelect = () => {
  searchVal.value = ''
  page.pageNum = 1
  taskList.value = []
}

const handleSearch = () => {
  noMore.value = false
  page.pageNum = 1
  taskList.value = []
  getTaskList()
}

const setActiveTask = (val) => {
  activeTask.value = val
  const params = {}
  getTaskBatchList(val.id, params).then(res => {
    fillBatchList.value = res
    if (res.length > 0) {
      setActiveBatch(res[0])
    }
  })
}
const downloadData = ref<any>({})
const handDowload = (val: any) => {
  downloadLoading.value = true

  // 如果是 Excel 导出，直接调用导出接口，不需要选择模板
  if (val === 3) {
    let params = {
      batchId: (activeBatch.value as any).batchId,
      state: fillStateVal.value,
      fileType: '',
      fileId: '',
      zip: fillBatchObjectList.value.length > 1 ? true : false,
    }
    printList(params, 0).then(res => {
      Message.success('请前往任务中心下载任务')
      downloadLoading.value = false
    }).catch(() => {
      downloadLoading.value = false
    })
    return
  }

  getPrint((activeBatch.value as any).appId).then(res => {
    if (res.length == 0) {
      Message.error('暂无模版')
      downloadLoading.value = false
    } else if (res.length == 1) {
      let params = {
        batchId: (activeBatch.value as any).batchId,
        state: fillStateVal.value,
        fileType: res[0].fileType,
        fileId: res[0].fileId,
        zip: fillBatchObjectList.value.length > 1 ? true : false,
      }
      printList(params, val).then(res => {
        Message.success('请前往任务中心下载任务')
        downloadLoading.value = false
      }).catch(() => {
        downloadLoading.value = false
      })
    } else {
      templateList.value = res
      templateModalVisible.value = true
      selectedTemplateId.value = null
      downloadData.value = {
        batchId: (activeBatch.value as any).batchId,
        state: fillStateVal.value,
        fileType: '',
        val: val,
        fileId: '',
        zip: fillBatchObjectList.value.length > 1 ? true : false,
      }
      downloadLoading.value = false
    }
  }).catch(() => {
    downloadLoading.value = false
  })
}
const handPrint = (val: any) => {
  downloadLoading.value = true
  getPrint(activeBatch.value.appId).then(res => {
    if (res.length == 0) {
      Message.error('暂无模版')
      downloadLoading.value = false
    } else if (res.length == 1) {
      let params = {
        batchId: activeBatch.value.batchId,
        state: fillStateVal.value,
        fileType: res[0].fileType,
        fileId: res[0].fileId,
        zip: false,
      }
      printList(params, val).then(res => {
        Message.success('请前往文件输入/输出管理查看下载任务')
        downloadLoading.value = false
      }).catch(() => {
        downloadLoading.value = false
      })
    } else {
      templateList.value = res
      templateModalVisible.value = true
      selectedTemplateId.value = null
      downloadData.value = {
        batchId: activeBatch.value.batchId,
        state: fillStateVal.value,
        fileType: '',
        val: val,
        fileId: '',
        zip: false,
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

    printList(downloadData.value, downloadData.value.val).then(res => {
      Message.success('请前往文件输入/输出管理查看下载任务')
      downloadLoading.value = false
    }).catch(() => {
      downloadLoading.value = false
    })
  }
}
const changeTaskState = (val) => {
  taskState.value = val
  activeTask.value = {}
  noMore.value = false
  page.pageNum = 1
  taskList.value = []
  getTaskList()
}

const getTaskList = () => {

  // 如果正在加载或没有更多数据，直接返回
  if (disabled.value) return;

  dataLoading.value = true;

  try {
    let params = {
      current: page.pageNum,
      size: page.pageSize,
      status: taskState.value,
      keyword: "",
      type: searchSelectVal.value
    }
    if (searchSelectVal.value === 3) {
      if (Array.isArray(searchVal.value) && searchVal.value.length > 0) {
        params.keyword = searchVal.value.map(v => v[v.length - 1]).join(',')
      }
    } else {
      params.keyword = searchVal.value
    }
    getFillTaskList(params).then((res: any) => {
      page.total = res?.total ? res?.total : 0
      if (page.pageNum * page.pageSize >= page.total) {
        noMore.value = true
      }
      taskList.value = taskList.value.concat(res.records)

      if (!activeTask.value.id && taskList.value.length > 0) {
        setActiveTask(taskList.value[0])
      }
    })
  } finally {
    dataLoading.value = false
  }
}

const refreshTaskList = () => {
  page.pageNum = page.pageNum + 1
  getTaskList()
}

// ------------------------

// 降级复制方法（兼容旧版浏览器）
const fallbackCopyToClipboard = (text: string) => {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (successful) {
      Message.success('复制成功');
    } else {
      Message.error('由于浏览器安全设置，不支持复制功能！！!');
    }
  } catch (err) {
    console.error('复制失败:', err);
    Message.error('由于浏览器安全设置，不支持复制功能！！!');
  }
};

const copyFillLink = async () => {
  const link = window.location.origin + '/wornbench/taskUserCenter?taskId=' + activeTask.value.moduleId + '&batchId=' + activeBatch.value.batchId + '&moduleId=' + activeTask.value.moduleId
  const text = window.api.apiURL + '&redirect_uri=' + encodeURIComponent(link)

  // 尝试使用现代 Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      Message.success('复制成功');
    } catch {
      fallbackCopyToClipboard(text);
    }
  } else {
    // 降级方案：使用 execCommand
    fallbackCopyToClipboard(text);
  }
};

const getDeptOptions = () => {
  getDeptTree().then(res => {
    deptOptions.value = res ? res : []
    // setData(deptOptions.value)
  })
  getAppList().then(res => {
    appList.value = res ? res : []
    // setData(deptOptions.value)
  })
}

const getCategoryOptions = () => {
  getCategoryList().then(res => {
    appCategoryOptions.value = res
  })
}

// 获取填报批次对象分页
const getFillBatchTaskPage = () => {
  const params = {
    current: tablePage.pageNum,
    size: tablePage.pageSize,
    state: fillStateVal.value,
    batchId: activeBatch.value.batchId,
    nickname: fillObjectName.value,
    depts: fillObjectDeptIds.value.map(v => v[v.length - 1]).join(','),
    order: fillObjectOrder.value,
  }
  getTaskBatchObjectList(params).then(res => {
    fillBatchObjectList.value = (res.records || []).map(i => {
      return { ...i, ...i.formData }
    })
    tablePage.total = res.total
  })
}

const refreshFillBatchObjectList = () => {
  tablePage.pageNum = 1
  getFillBatchTaskPage()
}

const changeFillStateVal = (val: any) => {
  if (val) {
    fillStateVal.value = val
    // 渲染表单
    buildColumns()
  }
  // fillObjectName.value = ''
  refreshFillBatchObjectList()
}

// 待纠错数量
const getFixCount = () => {
  getFixRecordCount(activeBatch.value.batchId).then(res => {
    fixRecordCountVal.value = res
  })
}

const setActiveBatch = (val: any) => {
  activeBatch.value = val
  changeFillStateVal('0')
  getFixCount()
}

const changeTableOrder = () => {
  fillObjectOrder.value = fillObjectOrder.value === 1 ? 0 : 1
  refreshFillBatchObjectList()
}

const handleFillObjectOperate = (val, item) => {
  // 催办
  if (val === 'urge') {
    Modal.confirm({
      title: "提示",
      simple: true,
      renderToBody: false,
      titleAlign: "start",
      content: '是否发起填报催办?',
      hideCancel: false,
      okText: "确认",
      onOk: () => {
        const params = {
          batchId: activeBatch.value.batchId,
          urgingType: 2,
          userIds: [item.userId]
        }
        fillObjectUrge(params).then(() => {
          Message.success('催办成功')
        })
      }
    })
  } else if (val === 'refill') {
    Modal.confirm({
      title: "提示",
      simple: true,
      renderToBody: false,
      titleAlign: "start",
      content: '是否发起重新填报?',
      hideCancel: false,
      okText: "确认",
      onOk: () => {
        console.log(item)
        const params = {
          batchId: activeBatch.value.batchId,
          objectId: item.record.id
        }
        fillObjectLaunchReset(params).then(() => {
          changeFillStateVal(null)
          Message.success('发起重新填报成功')
        })
      }
    })
  } else if (val === 'urgeAll') {
    // 全部催办
    Modal.confirm({
      title: "提示",
      simple: true,
      renderToBody: false,
      titleAlign: "start",
      content: '是否催全部待填报对象?',
      hideCancel: false,
      okText: "确认",
      onOk: () => {
        const params = {
          batchId: activeBatch.value.batchId,
          urgingType: 1
        }
        fillObjectUrge(params).then(() => {
          Message.success('催办成功')
        })
      }
    })
  }
}

const handleSizeChange = (val) => {
  tablePage.pageSize = val
  getFillBatchTaskPage()
}

const handleCurrentChange = (val) => {
  tablePage.pageNum = val
  getFillBatchTaskPage()
}

const buildColumns = async () => {
  tableColumns.value = [];
  //序号字段
  tableColumns.value.push({
    title: "序号",
    key: "index",
    render: (record) => {
      return record.rowIndex + 1;
    },
    fixed: "left",
    width: 60,
  });

  //追加固定字段
  fixColumns.map((fixColumn) => {
    tableColumns.value.push(fixColumn);
  });

  if (fillStateVal.value === '1') {
    let formConfig = getFormById(activeBatch.value.appId);
    if (!!formConfig) {
      const res = await getCreatorApp(activeBatch.value.appId)
      formConfig = res.formConfig ? JSON.parse(res.formConfig) : {}
      setFormById(formConfig, activeBatch.value.appId)
    }
    const formFields = formConfig.formList;
    const formColumn = convertToColumns(formFields);

    //表单字段
    formColumn.map((column) => {
      tableColumns.value.push(column);
    });
  }

  //操作字段
  tableColumns.value.push({
    title: "操作",
    width: 120,
    fixed: "right",
    slotName: "operation",
  });
  // console.log({tableColumns})
};

onMounted(() => {
  getDeptOptions()
  getCategoryOptions()
  getTaskList()
})

</script>

<style lang="scss" scoped>
@use "@/styles/textColor.scss" as textColor;

.item {
  img {
    width: 100%;
  }
}

.flowCenter {
  &-body {
    display: flex;

    .left-box {
      display: flex;
      flex-direction: column;
      width: 320px;
      height: calc(100vh - 60px);
      background-color: #fff;
      overflow: hidden;

      .top-input {
        padding: 16px 20px;

        .input-box {
          display: flex;
          align-items: center;

          .left {

            :deep(.arco-select-view-single) {
              width: 120px !important;
              border-right: 0;
              border-radius: 3px 0 0 3px;
            }
          }

          .right {
            flex: 1;

            :deep(.arco-select, .arco-picker) {
              width: 100%;
              border-left: 0;
              border-radius: 0 3px 3px 0;
            }
          }
        }
      }

      .bottoms {
        width: 280px;
        padding: 8px 20px 16px;

        .bottoms-title {
          box-sizing: border-box;
          width: 100%;
          padding: 2px;
          display: flex;
          background: #F2F2F2;
          border-radius: 3px 3px 3px 3px;
          justify-content: space-between;

          .bottoms-title-item+.bottoms-title-item {
            margin-left: 4px;
          }

          .bottoms-title-item {
            box-sizing: border-box;
            flex: 1;
            padding: 5px 0;
            cursor: pointer;
            font-size: 14px;
            border-radius: 2px 2px 2px 2px;
            color: rgba(0, 0, 0, 0.6);
            text-align: center;
          }

          .active {
            background: #fff;
            color: rgba(0, 0, 0, 0.9);
          }
        }
      }

      .nameList {
        flex: 1;
        overflow: auto;
        padding: 0 20px;

        .loading {
          margin: 10px 0;
          font-size: 14px;
          text-align: center;
        }

        &-item {
          padding: 9px 16px;
          color: rgba(0, 0, 0, 0.9);
          font-size: 14px;
          text-align: left;
          border-radius: 3px 3px 3px 3px;
          cursor: pointer;
          display: flex;
          align-items: center;

          .icon {
            margin-right: 8px;
            width: 16px;
            height: 16px;
            background: url(@/assets/icon_renwu.svg);
          }
        }

        .active {
          color: textColor.$ThemeTextColor;
          background: textColor.$ThemeBgColor;

          .icon {
            background: url(@/assets/icon_renwus.svg);
          }
        }
      }
    }

    .right-box {
      margin-left: 1px;
      width: calc(100% - 321px);

      .center-title {
        box-sizing: border-box;
        width: 100%;
        display: flex;
        flex-direction: column;
        padding: 16px;
        background-color: rgba(255, 255, 255, 1);

        .title-name {
          color: rgba(0, 0, 0, 0.9);
          font-size: 16px;
        }

        .title-des {
          display: flex;
          align-items: center;
          margin-top: 8px;
          color: rgba(0, 0, 0, 0.6);
          font-size: 14px;
        }

        .right-title {
          display: flex;
          align-items: center;
          color: textColor.$ThemeTextColor;
          font-size: 14px;
          cursor: pointer;
          margin: 0 16px;

          .img {
            margin-right: 8px;
            width: 16px;
            height: 16px;

            img {
              width: 16px;
              height: 16px;
            }
          }
        }

        .dept {
          margin-right: 16px;
        }

      }

      .batch-table {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        padding: 16px;
      }

      .batch {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2px;
        padding: 16px;
        background-color: rgba(255, 255, 255, 1);

        &-left {
          .left-top {
            .arco-btn-text {
              color: rgba(16, 16, 16, 1);
              font-size: 16px;
              padding: 0;
            }
          }

          .left-bottom {
            margin-top: 4px;
            display: flex;
            align-items: center;
            color: rgba(0, 0, 0, 0.6);
            font-size: 14px;

            .reportTime {
              margin-right: 16px;
            }
          }
        }

        &-right {
          display: flex;
          align-items: center;

          .arco-progress {
            width: 300px;
            margin-right: 24px;
            margin-left: 8px;
          }
        }
      }

      .table {
        display: flex;
        flex-direction: column;
        background-color: #fff;

        .table-right {
          display: flex;
          gap: 8px;

          &-btn {
            display: flex;
            align-items: center;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.9);
            margin-right: 24px;
            cursor: pointer;

            .arco-icon {
              margin-right: 8px;
            }
          }
        }

        &-title {
          box-sizing: border-box;
          padding: 16px 16px 0;
          width: 100%;

          .input {
            display: flex;
            align-items: center;
            justify-content: flex-start;

            .input-search {
              display: flex;
              align-items: center;
              justify-content: flex-start;
              width: 380px;

              span.label {
                width: 80px;
                margin-right: 8px;
              }

              &:first-of-type {
                margin-right: 16px;
              }
            }
          }

          .table-btn-boxs {
            margin-top: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .table-btn {
            display: flex;
            align-items: center;
            gap: 8px;
          }
        }

        &-body {
          box-sizing: border-box;
          height: calc(100vh - 417px);
          padding: 16px 16px 0;
        }

        &-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-top: 1px solid #E7E7E7;

          .left {
            color: rgba(0, 0, 0, 0.4);
            display: flex;
            align-items: center;
          }
        }
      }
    }
  }
}

.center-text {
  font-size: 14px;
  cursor: pointer;
  display: inline-block;
  color: rgba(0, 0, 0, 0.4);

  &+.center-text {
    margin-left: 6px;
  }

  &:hover {
    color: #ED2F2F;
  }
}

.flowCenter-empty {
  height: calc(100vh - 60px);
  background-color: #fff;

  .msg {
    padding: 37px 23px;
    color: rgba(16, 16, 16, 1);
    font-size: 14px;
    text-align: left;
    margin-bottom: 170px;
  }
}

.empty-box {
  width: 100%;
  background-color: #fff;
  min-height: 200px;
  display: flex;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .img {
    img {
      width: 148px;
    }
  }

  .tit {
    font-size: 16px;
    color: #999;
  }

  .des-tit {
    font-size: 16px;
    color: rgba(16, 16, 16, 1);
  }

  .des {
    font-size: 14px;
    color: #999;
  }
}

.right-emp {
  box-sizing: border-box;
  padding: 15px;
  width: calc(100% - 360px);

  .empty-box {
    height: 100%;
  }
}
</style>
