<template>
  <div class="bottom-action-bar" v-if="flowInfo?.classify !== 'notice'">
    <div class="action-bar-content">
      <div>
        <div
          v-if="(flowInfo?.classify == 'apply' || flowInfo?.classify == 'handler' || flowInfo?.classify == 'pending') && flowInfo?.processFinish && (route?.query?.finishState == '1' || !route?.query?.finishState)"
          class="flow-status-badge">
          <icon-check-circle class="status-icon" />
          <span class="status-text">流程已结束</span>
        </div>
        <div class="flow-status-bar" v-if="flowInfo?.classify == 'apply' && !flowInfo?.processFinish">
          <span class="status-badge">审批中</span>
          <span class="status-tip">流程进行中，可执行以下操作</span>
        </div>
        <div class="flow-status-badge" v-if="flowInfo?.classify == 'handler' && !flowInfo?.processFinish">
          <icon-check-circle class="status-icon" />
          <span class="status-tip">您已通过此申请</span>
        </div>
        <div class="flow-status-bar"
          v-if="flowInfo?.classify == 'apply' && flowInfo?.processFinish && route?.query?.finishState == '2'">
          <span class="status-badge failed">流程失败</span>
          <span class="status-tip">流程已终止，可重新发起</span>
        </div>
      </div>

      <a-space>
        <template v-if="flowInfo?.classify == 'pending' && !flowInfo?.processFinish">
          <a-button class="action-btn ghost" v-if="flowInfo?.delegate?.enable" @click="$emit('submit-form', 3)"
            :loading="delegateLoading">
            <icon-share-alt class="btn-icon" />
            {{ flowInfo?.delegate?.label || '转交' }}
          </a-button>
          <a-button class="action-btn ghost" v-if="flowInfo?.back?.enable" @click="$emit('submit-form', 4)"
            :loading="backLoading">
            <icon-undo class="btn-icon" />
            {{ flowInfo?.back?.label || '退回' }}
          </a-button>
          <a-button class="action-btn danger" v-if="flowInfo?.refuse?.enable" @click="$emit('submit-form', 2)"
            :loading="refuseLoading">
            <icon-close class="btn-icon" />
            {{ flowInfo?.refuse?.label || '拒绝' }}
          </a-button>
          <a-button class="action-btn success" v-if="flowInfo?.pass?.enable" @click="$emit('submit-form', 1)"
            :loading="passLoading">
            <icon-check class="btn-icon" />
            {{ flowInfo?.pass?.label || '通过' }}
          </a-button>
          <a-button class="action-btn primary" @click="$emit('submit')" :loading="submitBtnLoading"
            v-if="flowInfo?.priority == '1'">
            提交
          </a-button>
        </template>

        <template v-if="flowInfo?.classify == 'apply' && flowInfo?.processFinish && route?.query?.finishState == '2'">
          <div class="action-buttons-group">
            <!-- <a-button class="action-btn ghost-with-icon"  @click="openRevokeModal" :loading="returnLoading">
              <icon-undo class="btn-icon" />
              撤回
            </a-button> -->
            <a-button class="action-btn primary" @click="$emit('reapply')">
              <icon-refresh class="btn-icon" />
              重新申请
            </a-button>
          </div>
        </template>

        <template v-if="flowInfo?.classify == 'apply' && !flowInfo?.processFinish">
          <div class="action-buttons-group">
            <a-button class="action-btn ghost-with-icon" @click="$emit('urgent')" :loading="urgentLoading">
              <icon-bulb class="btn-icon" />
              催办
            </a-button>
            <a-button class="action-btn warning" v-if="flowInfo?.revoke" @click="$emit('revoke')"
              :loading="returnLoading">
              <icon-undo class="btn-icon" />
              撤回流程
            </a-button>
            <a-button class="action-btn danger" @click="$emit('terminate')" :loading="endFlowLoading">
              <icon-stop class="btn-icon" />
              终止流程
            </a-button>
          </div>
        </template>

        <template v-if="flowInfo?.classify == 'handler' && !flowInfo?.processFinish">
          <div class="action-buttons-group">
            <a-button class="action-btn ghost-with-icon" v-if="flowInfo?.revoke" @click="openRevokeModal"
              :loading="returnLoading">
              <icon-undo class="btn-icon" />
              撤回
            </a-button>
          </div>
        </template>
      </a-space>
    </div>

    <a-modal v-model:visible="revokeModalVisible" title="撤回" :width="520" :mask-closable="false" :esc-to-close="false"
      unmount-on-close @before-ok="handleRevokeConfirm" @cancel="handleRevokeCancel">
      <a-form ref="revokeFormRef" :model="revokeForm" :rules="revokeRules" layout="vertical">
        <a-form-item field="reason" label="撤回原因">
          <a-textarea v-model="revokeForm.reason" placeholder="请输入撤回原因" :auto-size="{ minRows: 3, maxRows: 6 }" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import type { FormInstance } from '@arco-design/web-vue'

const route = useRoute()

const revokeModalVisible = ref(false)
const revokeFormRef = ref<FormInstance>()
const revokeForm = ref({ reason: '' })
const revokeRules = {
  reason: [{ required: true, message: '请输入撤回原因' }],
}

const openRevokeModal = () => {
  revokeForm.value.reason = ''
  revokeModalVisible.value = true
}

const handleRevokeCancel = () => {
  revokeForm.value.reason = ''
  revokeModalVisible.value = false
}

const handleRevokeConfirm = (done: (closed?: boolean) => void) => {
  revokeFormRef.value?.validate((errors) => {
    if (errors) {
      done(false)
      return
    }
    emit('revoke', revokeForm.value.reason)
    revokeForm.value.reason = ''
    revokeModalVisible.value = false
    done(true)
  })
}

defineProps<{
  flowInfo?: {
    classify?: string
    nodeConfig?: {
      processFinish?: boolean
      delegate?: { enable?: boolean; label?: string }
      back?: { enable?: boolean; label?: string }
      refuse?: { enable?: boolean; label?: string }
      pass?: { enable?: boolean; label?: string }
      priority?: string
    }
    processFinish?: boolean
    delegate?: { enable?: boolean; label?: string }
    back?: { enable?: boolean; label?: string }
    refuse?: { enable?: boolean; label?: string }
    pass?: { enable?: boolean; label?: string }
    priority?: string
    [key: string]: any
  }
  passLoading?: boolean
  refuseLoading?: boolean
  delegateLoading?: boolean
  backLoading?: boolean
  submitBtnLoading?: boolean
  returnLoading?: boolean
  urgentLoading?: boolean
  endFlowLoading?: boolean
}>()

const emit = defineEmits<{
  'submit-form': [val: number]
  submit: []
  revoke: [reason: string]
  reapply: []
  urgent: []
  terminate: []
}>()
</script>

<style lang="scss" scoped>
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #e2e8f0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);
  padding: 16px 24px;
  min-height: 32px;
  z-index: 1000;

  .action-bar-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 32px;

    .flow-status-badge,
    .flow-status-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;

      .status-icon {
        color: #16a34a;
      }

      .status-text,
      .status-tip {
        color: #64748b;
      }

      .status-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        color: rgb(var(--arcoblue-6));
        background-color: rgb(var(--arcoblue-1));

        &.failed {
          background-color: #fef2f2 !important;
          color: #dc2626 !important;
        }
      }
    }

    .action-buttons-group {
      display: flex;
      gap: 12px;
    }

    .action-btn {
      border-radius: 8px;
      padding: 8px 16px;
      font-weight: 500;
      transition: all 0.2s;

      .btn-icon {
        margin-right: 4px;
      }

      &.primary {
        background: linear-gradient(135deg, rgb(var(--primary-6)), #6366f1);
        color: #fff;
        border: none;

        &:hover {
          background: linear-gradient(135deg, rgb(var(--primary-6)), #6366f1) !important;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }

      &.success {
        background: #16a34a;
        color: #fff;
        border: none;
      }

      &.danger {
        background: #dc2626;
        color: #fff;
        border: none;
      }

      &.warning {
        background: #ea580c;
        color: #fff;
        border: none;
      }

      &.ghost {
        background: transparent;
        border: 1px solid #e2e8f0;
        color: #64748b;
      }

      &.ghost-with-icon {
        background: transparent;
        border: 1px solid #e2e8f0;
        color: #64748b;
      }

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>
