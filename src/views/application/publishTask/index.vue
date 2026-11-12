<template>
  <div class="task">
    <a-modal v-model:visible="dialogVisible" class="publish-task-modal" :width="480" :mask-closable="false"
      unmount-on-close :footer="!showSu" @cancel="handleClose">
      <template #title>
        <span class="publish-task-modal__title">把 {{ appdes.appName }} 发布为填报任务</span>
      </template>

      <div class="form-box" v-if="!showSu">
        <a-form ref="formRef" :model="form" layout="vertical" :rules="rules">
          <a-form-item label="设置任务名称" field="taskName" required>
            <a-input v-model="form.taskName" placeholder="请输入任务名称" class="inputs" :bordered="false">
              <template #prepend>
                {{ appdes.appName }}
              </template>
            </a-input>
          </a-form-item>
          <a-form-item label="选择任务发布部门" field="publisher" required>
            <div class="publish-field tip-box" @click="openModal(1)">
              <div class="tip-box-item tags-wrapper" v-if="form.publisher && form.publisher.length > 0">
                <a-tag v-for="(tag, index) in form.publisher" :key="tag.id">
                  <div class="tag">
                    <div class="tag-name">{{ tag.label }}</div>
                    <div class="close" @click.stop="handlePublisher(index)">
                      <icon-close />
                    </div>
                  </div>
                </a-tag>
              </div>
              <div class="tip-box-item" v-else>
                <div class="setTip">选择任务发布部门</div>
              </div>
            </div>
          </a-form-item>
          <a-form-item label="请设置任务生成周期" field="dates" required>
            <a-range-picker :disabled-date="disabledDate" v-model="form.dates" @change="getTime"
              value-format="YYYY-MM-DD" :style="{ width: '100%' }" :placeholder="['开始日期', '结束日期']" separator="-"
              allow-clear :bordered="false" />
          </a-form-item>
          <a-form-item label="请设置任务频次" field="cycleType" required>
            <a-select style="width:100%" @change="getTimeS" v-model="form.cycleType" placeholder="请设置任务频次"
              :bordered="false">
              <a-option v-for="item in options" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="请选择周次" field="cycleConfig" v-if="form.cycleType == 3" required>
            <a-select style="width:100%" @change="getTime" v-model="form.cycleConfig" placeholder="请选择周次"
              :bordered="false">
              <a-option v-for="item in week" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="请选择日期" field="cycleConfig" v-if="form.cycleType == 4" required>
            <a-select style="width:100%" @change="getTime" v-model="form.cycleConfig" placeholder="请选择日期"
              :bordered="false">
              <a-option v-for="item in mouth" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="请选择日期" field="cycleConfig" v-if="form.cycleType == 6" required>
            <a-date-picker style="width: 100%;" @change="getTime" format="MM-DD" value-format="YYYY-MM-DD"
              v-model="form.cycleConfig" placeholder="选择日期" :bordered="false" />
          </a-form-item>

          <a-form-item label="请选择任务生成时间" field="publishTime" required>
            <a-time-picker @change="getTime" format="HH:mm:ss" value-format="HH:mm:ss" v-model="form.publishTime"
              placeholder="选择任务生成时间" style="width: 100%;" />
          </a-form-item>
          <div class="cycle-hint"> <a-checkbox @change="getTime" v-model="form.isByCurrent"
              value="1">当天任务按当前时间生成</a-checkbox>
          </div>
          <div class="cycle-hint">最近一次任务于{{ setDate || '' }}生成</div>
          <a-form-item label="设置任务监督员" field="supervisor" required>
            <div class="publish-field tip-box" @click="openModal(2)">
              <div class="tip-box-item tags-wrapper" v-if="form.supervisor && form.supervisor.length > 0">
                <a-tag v-for="(tag, index) in form.supervisor" :key="tag.id">
                  <div class="tag">
                    <div class="tag-name">{{ tag.nickname }}</div>
                    <div class="close" @click.stop="handleSupervisor(index)">
                      <icon-close />
                    </div>
                  </div>
                </a-tag>
              </div>
              <div class="tip-box-item" v-else>
                <div class="setTip">请设置任务监督员</div>
              </div>
            </div>
          </a-form-item>
          <a-form-item label="设置填报人员范围" field="fillConfig" required>
            <div class="publish-field tip-box" @click="openModal(3)">
              <div class="tip-box-item tags-wrapper" v-if="FillPersonExist">
                <a-tag v-for="(tag, index) in form.fillConfig.deptIds" :key="`dept-${tag.id}`">
                  <div class="tag">
                    <div class="tag-name">{{ tag.label }}</div>
                    <div class="close" @click.stop="removeFillConfig(1, index)">
                      <icon-close />
                    </div>
                  </div>
                </a-tag>
                <a-tag v-for="(tag, index) in form.fillConfig.postIds" :key="`post-${tag.id}`">
                  <div class="tag">
                    <div class="tag-name">{{ tag.postName }}</div>
                    <div class="close" @click.stop="removeFillConfig(2, index)">
                      <icon-close />
                    </div>
                  </div>
                </a-tag>
                <a-tag v-for="(tag, index) in form.fillConfig.roleIds" :key="`role-${tag.id}`">
                  <div class="tag">
                    <div class="tag-name">{{ tag.roleName }}</div>
                    <div class="close" @click.stop="removeFillConfig(3, index)">
                      <icon-close />
                    </div>
                  </div>
                </a-tag>
                <a-tag v-for="(tag, index) in form.fillConfig.userIds" :key="`user-${tag.id}`">
                  <div class="tag">
                    <div class="tag-name">{{ tag.nickname }}</div>
                    <div class="close" @click.stop="removeFillConfig(4, index)">
                      <icon-close />
                    </div>
                  </div>
                </a-tag>
              </div>
              <div class="tip-box-item" v-if="!FillPersonExist">
                <div class="setTip">选择填报人员范围</div>
              </div>
            </div>
          </a-form-item>
          <a-form-item label="设置填报人员填报时间范围" required field="fillTimeScope">
            <div class="fill-time-row">
              <div class="fill-time-row__num">
                <a-input-number :min="1" v-model="form.fillTimeScope" :hide-button="true" :bordered="false" />
              </div>
              <a-select class="fill-time-row__unit" v-model="form.fillUnity" placeholder="单位" :bordered="false">
                <a-option :value="1">小时</a-option>
                <a-option :value="2">天</a-option>
                <a-option :value="3">周</a-option>
                <a-option :value="4">月</a-option>
              </a-select>
            </div>
          </a-form-item>
        </a-form>
      </div>

      <div class="success-box" v-else>
        <div class="img">
          <icon-check-circle-fill size="48" :style="{ color: '#1BC774' }" />
        </div>
        <div class="text">发布成功</div>
        <div class="name">
          {{ form.taskName }}
        </div>
        <div class="btn">
          <a-button @click="linkTo">任务管理中心</a-button>
        </div>
      </div>

      <template #footer>
        <div class="publish-task-modal__footer" v-if="!showSu">
          <a-button @click="handleClose">取消</a-button>
          <a-button type="primary" @click="handleSubmitTask">确认发布</a-button>
        </div>
      </template>
    </a-modal>

    <FillPublisherModal ref="fillPublisherModalRef" @setData="setFormData" />
    <FillSupervisorModal ref="fillSupervisorModalRef" @setData="setFormData" />
    <FillPersonModal ref="fillPersonModalRef" @setData="setFormData" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs';
import { createFillTask, getRecentlyTaskDate } from '@/api/taskFillManager/index'
import { mouth, week } from '@/data/accessPlan'
import { Message } from '@arco-design/web-vue'
import { IconCheckCircleFill } from '@arco-design/web-vue/es/icon'
import FillPersonModal from "@/views/application/publishTask/components/fillPersonModal.vue";
import FillSupervisorModal from "@/views/application/publishTask/components/fillSupervisorModal.vue";
import FillPublisherModal from "@/views/application/publishTask/components/fillPublisherModal.vue";

const props = defineProps<{
  appdes: any,
}>()

const router = useRouter()

const dialogVisible = ref(false)
const showSu = ref(false)
const setDate = ref('')
const activeModelIndex = ref('')
const formRef = ref(null)

const fillPublisherModalRef = ref()
const fillSupervisorModalRef = ref()
const fillPersonModalRef = ref()

const form = reactive({
  taskName: '',
  cycleType: '',
  cycleConfig: '',
  startDate: '',
  stopDate: '',
  dates: [],
  publisher: [],
  publishTime: '',
  supervisor: [],
  fillConfig: {
    deptIds: [],
    postIds: [],
    roleIds: [],
    userIds: [],
  },
  fillTimeScope: 1,
  fillUnity: 1
})

const options = [
  { value: 1, label: '一次' },
  { value: 2, label: '每天' },
  { value: 3, label: '每周' },
  { value: 4, label: '每月' },
  { value: 5, label: '每季度' },
  { value: 6, label: '每年' }
]

const rules = {
  taskName: [
    { required: true, message: '请输入任务名称' }
  ],
  publisher: [
    { required: true, message: '请选择发布部门' }
  ],
  dates: [
    { required: true, message: '请选择任务起止日期' }
  ],
  cycleType: [
    { required: true, message: '请选择任务频次' }
  ],
  cycleConfig: [
    { required: true, message: '请选择频次配置' }
  ],
  supervisor: [
    { required: true, message: '请选择监督员' }
  ],
  publishTime: [
    { required: true, message: '请选择任务生成时间' }
  ],
  fillConfig: [
    { required: true, message: '请选择填报对象' },
    {
      validator: (value, cb) => {
        if (!FillPersonExist.value) {
          cb('请选择填报对象')
        } else {
          cb()
        }
      }
    }
  ],
  fillTimeScope: [
    { required: true, message: '请选择填报时间' }
  ],
  fillUnity: [
    { required: true, message: '请选择填报单位' }
  ],
}

const FillPersonExist = computed(() => {
  if ((form.fillConfig.deptIds && form.fillConfig.deptIds.length > 0) ||
    (form.fillConfig.postIds && form.fillConfig.postIds.length > 0) ||
    (form.fillConfig.roleIds && form.fillConfig.roleIds.length > 0) ||
    (form.fillConfig.userIds && form.fillConfig.userIds.length > 0)
  ) {
    return true
  }
  return false
})

const disabledDate = (current) => {
  return dayjs(current).valueOf() < dayjs().startOf('day').valueOf()
}

const show = () => {
  dialogVisible.value = true
}

const handleClose = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  dialogVisible.value = false
  showSu.value = false
  setDate.value = ''
}

const getTimeS = () => {
  form.cycleConfig = ''
  getTime()
}

const getTime = () => {
  setDate.value = ''
  if (!form.cycleType || form.dates.length === 0 || !form.publishTime) return

  let params = {
    cycleType: form.cycleType,
    cycleConfig: '',
    publishTime: form.publishTime,
    isByCurrent: form.isByCurrent,
    startDate: form.dates[0],
    stopDate: form.dates[1]
  }

  if (form.cycleType === 3) {
    if (form.cycleConfig) {
      params.cycleConfig = { week: form.cycleConfig }
    } else {
      return
    }
  } else if (form.cycleType === 4) {
    if (form.cycleConfig) {
      params.cycleConfig = { day: form.cycleConfig }
    } else {
      return
    }
  } else if (form.cycleType === 6) {
    if (form.cycleConfig) {
      params.cycleConfig = {
        month: dayjs(form.cycleConfig).format('M'),
        day: dayjs(form.cycleConfig).format('D')
      }
    } else {
      return
    }
  }

  params.cycleConfig = JSON.stringify(params.cycleConfig)
  getRecentlyTaskDate(params).then(res => {
    setDate.value = res
  })
}

const openModal = (val: any) => {
  activeModelIndex.value = val
  if (val === 1) {
    fillPublisherModalRef.value?.showModal(form.publisher)
  } else if (val === 2) {
    fillSupervisorModalRef.value?.showModal(form.supervisor)
  } else if (val === 3) {
    fillPersonModalRef.value.showModal(form.fillConfig)
  }
}

const setFormData = (val: any) => {
  if (activeModelIndex.value === 1) {
    form.publisher = val
  } else if (activeModelIndex.value === 2) {
    form.supervisor = val
  } else if (activeModelIndex.value === 3) {
    form.fillConfig = val
  }
}

const handleSubmitTask = () => {
  formRef.value.validate(async (error) => {
    if (!error) {
      let params = {
        appId: props.appdes.id,
        category: props.appdes.category,
        formId: props.appdes.formId,
        taskName: props.appdes.appName + form.taskName,
        cycleType: form.cycleType,
        cycleConfig: '',
        startDate: form.dates[0],
        stopDate: form.dates[1],
        publishTime: form.publishTime,
        isByCurrent: form.isByCurrent,
        publisher: form.publisher.map(v => v.id),
        supervisor: form.supervisor.map(v => v.id),
        fillObject: {
          deptIds: form.fillConfig.deptIds.map(v => v.id),
          postIds: form.fillConfig.postIds.map(v => v.id),
          roleIds: form.fillConfig.roleIds.map(v => v.id),
          userIds: form.fillConfig.userIds.map(v => v.id)
        },
        fillUnity: form.fillUnity,
        fillTimeScope: form.fillTimeScope
      }

      if (form.cycleType === 3 && form.cycleConfig) {
        params.cycleConfig = { week: form.cycleConfig }
      } else if (form.cycleType === 4 && form.cycleConfig) {
        params.cycleConfig = { day: form.cycleConfig }
      } else if (form.cycleType === 6 && form.cycleConfig) {
        params.cycleConfig = {
          month: dayjs(form.cycleConfig).format('M'),
          day: dayjs(form.cycleConfig).format('D')
        }
      }

      params.cycleConfig = params.cycleConfig ? JSON.stringify(params.cycleConfig) : ''
      params.fillObject = JSON.stringify(params.fillObject)

      try {
        await createFillTask(params)
        showSu.value = true
      } catch (error) {
        // Message.error('发布失败')
      }
    }
  })
}

const linkTo = () => {
  router.push({ path: '/taskManageCenter', query: { menuCode: 'operationsCenter' } })
}

const handlePublisher = (index) => {
  form.publisher.splice(index, 1)
}

const handleSupervisor = (index) => {
  form.supervisor.splice(index, 1)
}

const removeFillConfig = (val: any, index: number) => {
  if (val == 1) {
    form.fillConfig.deptIds.splice(index, 1)
  }
  if (val == 2) {
    form.fillConfig.postIds.splice(index, 1)
  }
  if (val == 3) {
    form.fillConfig.roleIds.splice(index, 1)
  }
  if (val == 4) {
    form.fillConfig.userIds.splice(index, 1)
  }
}

defineExpose({
  show
})
</script>

<style lang="scss" scoped>
//@use "@/styles/person-modal.scss" as personModal;

.publish-task-modal__title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

:deep(.publish-task-modal .arco-modal-header) {
  border-bottom: none;
  padding: 20px 24px 0;
}

:deep(.publish-task-modal .arco-modal-body) {
  padding: 16px 24px 8px;
}

:deep(.publish-task-modal .arco-modal-footer) {
  border-top: none;
  padding: 8px 24px 20px;
}

:deep(.publish-task-modal .arco-form-item-label) {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

:deep(.publish-task-modal .arco-form-item-label-required-symbol) {
  color: #ef4444;
}

:deep(.publish-task-modal .arco-btn-primary) {
  background: rgb(var(--primary-6));
  border: none;
  border-radius: 10px;
  font-weight: 500;
}

:deep(.publish-task-modal .arco-btn-secondary) {
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-weight: 500;
}

.publish-field {
  width: 100%;
  box-sizing: border-box;
  min-height: 40px;
  padding: 0 12px;
  //background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  display: flex;
  gap: 4px;
  align-items: center;
  transition: border-color 0.2s, background 0.2s;

  &:focus-within {
    background: #fff;
    border-color: rgb(var(--primary-6));
  }

  :deep(.arco-input-wrapper),
  :deep(.arco-picker),
  :deep(.arco-select-view-single) {
    width: 100%;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  :deep(.arco-input) {
    font-size: 13px;
    color: #334155;

    &::placeholder {
      color: #94a3b8;
    }
  }
}

.publish-field.tip-box {
  padding: 4px 12px;
  cursor: pointer;
  flex-wrap: wrap;
  align-items: center;
  align-content: center;

  &:hover {
    border-color: #e2e8f0;
  }

  &:active {
    background: #fff;
    border-color: rgb(var(--primary-6));
  }

  .tags-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
  }

  .tip-box-item {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    margin: 0;
  }

  //  @include personModal.dsp-org-selection-tag;

  .tag {
    display: flex;
    align-items: center;
    color: #334155;
    font-size: 13px;

    .tag-name {
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .close {
      margin-left: 4px;
      cursor: pointer;
      color: #94a3b8;
      display: inline-flex;
      align-items: center;

      &:hover {
        color: #64748b;
      }
    }
  }

  .setTip {
    padding: 0;
    color: #94a3b8;
    font-size: 13px;
    line-height: 32px;
  }
}

.form-box {
  :deep(.arco-form-item) {
    margin-bottom: 16px;
  }

  :deep(.arco-select-view-single),
  :deep(.arco-picker) {
    width: 100%;
    min-height: 40px;
    background: #f8fafc !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 10px !important;
    box-shadow: none !important;
    transition: border-color 0.2s, background 0.2s;
  }


  :deep(.arco-input-wrapper:focus-within),
  :deep(.arco-select-view-single:focus-within),
  :deep(.arco-picker:focus-within) {
    background: #fff !important;
    border-color: rgb(var(--primary-6)) !important;
  }

  :deep(.arco-input),
  :deep(.arco-select-view-value),
  :deep(.arco-picker-input input) {
    font-size: 13px;
    color: #334155;
  }

  :deep(.arco-input::placeholder),
  :deep(.arco-picker-input input::placeholder) {
    color: #94a3b8;
  }

  :deep(.arco-picker-separator) {
    color: #94a3b8;
  }

  :deep(.arco-input-outer) {
    width: 100%;
    min-height: 42px;
    background: #fff !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 10px !important;
    box-shadow: none !important;
    transition: border-color 0.2s, background 0.2s;

    .arco-input-prepend {
      border-radius: 10px 0 0 10px !important;
      background: #fff !important;
      border-right: 1px solid #e2e8f0 !important;
    }


  }
}

.cycle-hint {
  margin: -8px 0 16px;
  padding-left: 2px;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.5;
}

.fill-time-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  &__num {
    width: 100px;
    flex-shrink: 0;



    :deep(.arco-input-wrapper) {
      text-align: center;
    }
  }

  &__unit {
    width: 100px;
    flex-shrink: 0;
  }
}

.success-box {
  padding: 40px 24px 24px;
  text-align: center;

  .text {
    margin: 11px 0 23px;
    color: #16a34a;
    font-size: 18px;
    font-weight: 600;
  }

  .name {
    color: #1e293b;
    font-size: 16px;
    margin-bottom: 32px;
  }

  .btn :deep(.arco-btn) {
    border-radius: 10px;
    padding: 8px 18px;
  }
}

.publish-task-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
}
</style>
