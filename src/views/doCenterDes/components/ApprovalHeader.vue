<template>
  <div class="approval-header">
    <div class="header-avatar">
      {{ flowInfo.applyUser?.nickname?.charAt(0) || '申' }}
    </div>
    <div class="header-info">
      <div class="header-title">
        <span class="applicant-name">{{ flowInfo.applyUser?.nickname || '申请人' }}</span>
        <span class="applicant-dept">
          {{flowInfo.applyUser?.deptList?.map((d: any) => d.deptName).join('、') || '部门'}}
        </span>
        <span class="header-divider">|</span>
        <span class="apply-time">{{ commentList[0]?.recordTime || '' }}</span>
      </div>
      <div class="header-status">
        <span class="status-tag"
          :class="flowInfo.processFinish ? flowInfo.finishType !== 0 ? 'status-finished' : 'status-success' : 'status-processing'">
          {{ flowInfo.processFinish ? (finishTypeConfig[Number(flowInfo.finishType)]?.label || '已结束') : '审批中' }}
        </span>
        <template v-if="flowInfo.processFinish && flowInfo.finishType !== 0">
          <span>
            失败原因：<span class="status-fail-reason">
              {{ finishTypeConfig[Number(flowInfo.finishType)]?.desc }}
            </span>
          </span>

        </template>
        <template v-else>
          <span class="status-info">
            当前节点：<span class="status-value">{{ flowInfo.nodeName || '无' }}</span>
          </span>
          <span class="status-info" v-if="candidateList && candidateList.length > 0">
            待处理：
            <span class="status-value">{{candidateList.map((d: any) => d.nickname).join('、')}}</span>
          </span>
          <span class="status-info" v-if="flowInfo.backCount > 0">
            第<span class="status-value">{{ flowInfo.backCount }}次退回</span>
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconInfoCircle, IconCheckCircleFill, IconRecordStop, IconCloseCircleFill, IconBranch, IconExclamationCircle, IconCode, IconUserGroup } from '@arco-design/web-vue/es/icon'
import type { FlowInfo } from '@/types/form'

const props = defineProps<{
  flowInfo: FlowInfo
  commentList: Array<any>
  candidateList: Array<any>
}>()

// 流程结束状态配置映射
const finishTypeConfig: Record<number, { title: string; desc: string; label: string; theme: string; icon: any }> = {
  0: { title: '正常通过结束', desc: '审批链路全部完成，流程正常结束', label: '已通过', theme: 'success', icon: IconCheckCircleFill },
  1: { title: '申请人主动终止', desc: '发起人主动撤销/终止流程', label: '已终止', theme: 'warning', icon: IconRecordStop },
  2: { title: '审批被拒绝', desc: '审批人明确拒绝，流程结束', label: '已拒绝', theme: 'danger', icon: IconCloseCircleFill },
  3: { title: '分支条件未通过', desc: '条件判断未命中，流程走到结束分支', label: '条件未通过', theme: 'warning-orange', icon: IconBranch },
  4: { title: '未找到节点负责人', desc: '节点配置异常，无法找到处理人', label: '节点异常', theme: 'gray', icon: IconExclamationCircle },
  5: { title: '未通过占比条件', desc: '会签/占比条件未达到设定阈值', label: '条件未满足', theme: 'gray', icon: IconCode },
  6: { title: '会签未全部通过', desc: '会签节点未获得全部同意，流程结束', label: '会签失败', theme: 'purple', icon: IconUserGroup },
  7: { title: '管理员主动终止', desc: '管理员强制终止了当前流程', label: '已终止', theme: 'warning', icon: IconRecordStop },
  8: { title: '任务监督员退回', desc: '任务监督员退回了当前流程', label: '已退回', theme: 'warning', icon: IconRecordStop }
}
</script>

<style lang="scss" scoped>
.approval-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;

  .header-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgb(var(--primary-6)), #6366f1);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .header-info {
    flex: 1;
    min-width: 0;

    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      flex-wrap: wrap;

      .applicant-name {
        font-size: 16px;
        font-weight: 600;
        color: #0f172a;
      }

      .applicant-dept {
        font-size: 14px;
        color: #64748b;
      }

      .header-divider {
        color: #cbd5e1;
        margin: 0 4px;
      }

      .apply-time {
        font-size: 13px;
        color: #94a3b8;
      }
    }

    .header-status {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;

      .status-tag {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        color: rgb(var(--arcoblue-6));
        background-color: rgb(var(--arcoblue-1));

        &.status-finished {
          background-color: #fef2f2 !important;
          color: #dc2626 !important;
        }

        &.status-success {
          color: rgb(var(--green-6));
          background-color: rgb(var(--green-1));
        }
      }

      .status-info {
        font-size: 13px;
        color: #64748b;

        .status-value {
          color: #334155;
          font-weight: 500;
        }
      }

      .status-fail-reason {
        font-size: 13px;
        color: #dc2626 !important;
        font-weight: 600;
      }
    }
  }
}
</style>
