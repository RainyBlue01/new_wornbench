<template>
  <a-modal
    v-model:visible="showVisible"
    title="任务管理"
    class="task-manage-modal"
    :width="520"
    unmount-on-close
    @ok="submit"
    @cancel="closeDialog"
    :ok-loading="submitLoading"
    ok-text="保存修改"
    cancel-text="取消"
  >
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-form-item field="taskName" label="任务名称" required>
          <a-input
            v-model="form.taskName"
            placeholder="请输入任务名称"
            :bordered="false"
          />
      </a-form-item>

      <a-form-item field="publisher" label="发布部门" required>
        <div class="task-field tip-box" @click="openRefModal(1)">
          <div class="tip-box-item tags-wrapper" v-if="form.publisher?.length">
            <a-tag
              v-for="(tag, index) in form.publisher"
              :key="tag.id"
            >
              <div class="tag">
                <div class="tag-name">{{ tag.label }}</div>
                <div class="close" @click.stop="handleCloseDept(index)">
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

      <a-form-item field="supervisor" label="监督人员" required>
        <div class="task-field tip-box" @click="openRefModal(2)">
          <div class="tip-box-item tags-wrapper" v-if="form.supervisor?.length">
            <a-tag
              v-for="(tag, index) in form.supervisor"
              :key="tag.id"
            >
              <div class="tag">
                <div class="tag-name">{{ tag.nickname }}</div>
                <div class="close" @click.stop="handleCloseSupervisor(index)">
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

      <a-form-item field="dates" label="任务周期" required>
          <a-range-picker
            v-model="form.dates"
            :style="{ width: '100%' }"
            :placeholder="['开始日期', '结束日期']"
            separator="-"
            allow-clear
            :bordered="false"
          />
      </a-form-item>
    </a-form>
  </a-modal>

  <FillPublisherModal ref="fillPublisherModalRef" @setData="setFormData" />
  <FillSupervisorModal ref="fillSupervisorModalRef" @setData="setFormData" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import dayjs from 'dayjs';
import {
  modifyTaskName,
  modifyTaskPeriod,
  modifyTaskPublisher,
  modifyTaskSupervisor,
} from '@/api/taskFillManager';
import FillPublisherModal from '@/views/application/publishTask/components/fillPublisherModal.vue';
import FillSupervisorModal from '@/views/application/publishTask/components/fillSupervisorModal.vue';

const emits = defineEmits(['refresh']);

const fillPublisherModalRef = ref();
const fillSupervisorModalRef = ref();
const formRef = ref();
const showVisible = ref(false);
const submitLoading = ref(false);
const activeModelIndex = ref('');

const form = ref({
  id: '',
  taskName: '',
  supervisor: [] as any[],
  publisher: [] as any[],
  dates: [] as (Date | string | undefined)[],
});

const rules = {
  taskName: [{ required: true, message: '请输入任务名称' }],
  publisher: [
    {
      required: true,
      validator: (value: any[], callback: (error?: string) => void) => {
        if (!value?.length) callback('请选择发布部门');
        else callback();
      },
    },
  ],
  supervisor: [
    {
      required: true,
      validator: (value: any[], callback: (error?: string) => void) => {
        if (!value?.length) callback('请设置监督人员');
        else callback();
      },
    },
  ],
  dates: [
    {
      required: true,
      validator: (value: any[], callback: (error?: string) => void) => {
        if (!value?.[0] || !value?.[1]) callback('请选择任务周期');
        else callback();
      },
    },
  ],
};

const showModal = (data: any) => {
  form.value = {
    id: data.id,
    taskName: data.taskName || '',
    supervisor: [...(data.supervisor || [])],
    publisher: [...(data.publisher || [])],
    dates:
      data.startDate && data.stopDate
        ? [
            new Date(dayjs(data.startDate).format('YYYY-MM-DD')),
            new Date(dayjs(data.stopDate).format('YYYY-MM-DD')),
          ]
        : data.dates?.length
          ? [...data.dates]
          : [],
  };
  showVisible.value = true;
};

const handleCloseDept = (index: number) => {
  form.value.publisher.splice(index, 1);
  formRef.value?.validateField?.('publisher');
};

const handleCloseSupervisor = (index: number) => {
  form.value.supervisor.splice(index, 1);
  formRef.value?.validateField?.('supervisor');
};

const closeDialog = () => {
  showVisible.value = false;
};

const openRefModal = (val: number) => {
  activeModelIndex.value = String(val);
  if (val === 1) {
    fillPublisherModalRef.value?.showModal(form.value.publisher);
  } else if (val === 2) {
    fillSupervisorModalRef.value?.showModal(form.value.supervisor);
  }
};

const setFormData = (val: any) => {
  if (activeModelIndex.value === '1') {
    form.value.publisher = val;
    formRef.value?.validateField?.('publisher');
  } else if (activeModelIndex.value === '2') {
    form.value.supervisor = val;
    formRef.value?.validateField?.('supervisor');
  }
};

const submit = async () => {
  try {
    await formRef.value?.validate();
    submitLoading.value = true;

    const id = form.value.id;
    await Promise.all([
      modifyTaskName({ id, name: form.value.taskName }),
      modifyTaskPublisher({
        id,
        publisher: form.value.publisher.map((v) => v.id),
      }),
      modifyTaskSupervisor({
        id,
        supervisor: form.value.supervisor.map((v) => v.id),
      }),
      modifyTaskPeriod({
        id,
        startDate: dayjs(form.value.dates[0]).format('YYYY-MM-DD'),
        stopDate: dayjs(form.value.dates[1]).format('YYYY-MM-DD'),
      }),
    ]);

    Message.success('任务信息已更新');
    emits('refresh');
    closeDialog();
  } catch (error) {
    console.error('Submit error:', error);
  } finally {
    submitLoading.value = false;
  }
};

defineExpose({
  showModal,
});
</script>

<style scoped lang="scss">
@use '@/styles/person-modal.scss' as personModal;

:deep(.task-manage-modal .arco-modal-header) {
  border-bottom: none;
  padding: 20px 24px 0;
}

:deep(.task-manage-modal .arco-modal-body) {
  padding: 16px 24px 8px;
}

:deep(.task-manage-modal .arco-modal-footer) {
  border-top: none;
  padding: 8px 24px 20px;
}

:deep(.task-manage-modal .arco-modal-title) {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

:deep(.task-manage-modal .arco-form-item-label) {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
}

:deep(.task-manage-modal .arco-form-item-label-required-symbol) {
  color: #ef4444;
}

:deep(.task-manage-modal .arco-btn-primary) {
  background: linear-gradient(135deg, rgb(var(--primary-6)), #6366f1);
  border: none;
  border-radius: 10px;
  font-weight: 600;
}

:deep(.task-manage-modal .arco-btn-secondary) {
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-weight: 600;
}

// 任务名称 / 发布部门 / 监督人员 / 任务周期 统一表单项外观
.task-field {
  width: 100%;
  box-sizing: border-box;
  min-height: 40px;
  padding: 0 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  transition: border-color 0.2s, background 0.2s;

  &:focus-within {
    background: #fff;
    border-color: rgb(var(--primary-6));
  }

  :deep(.arco-input-wrapper),
  :deep(.arco-picker) {
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

  :deep(.arco-picker-input) {
    font-size: 13px;
    color: #334155;
  }

  :deep(.arco-picker-input-active input),
  :deep(.arco-picker-input input::placeholder) {
    color: #94a3b8;
  }

  :deep(.arco-picker-separator) {
    color: #94a3b8;
  }

  :deep(.arco-picker-suffix-icon) {
    color: #94a3b8;
  }
}

.task-field.tip-box {
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

  @include personModal.dsp-org-selection-tag;

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
    line-height: 28px;
  }
}
</style>
