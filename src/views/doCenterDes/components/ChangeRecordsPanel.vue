<script setup lang="ts">
import { toRef } from 'vue'
import { IconEdit, IconPlus, IconDelete, IconArrowRight } from '@arco-design/web-vue/es/icon'
import emptyBox from '@/components/emptyBox/emptyBox.vue'
import type { ChangeRecord } from '@/composables/useChangeRecords'
import type { FormConfs } from '@/types/form'
import { createChangeRecordFormatter } from '../utils/changeRecordFormat'

const props = defineProps<{
  changeRecords: ChangeRecord[]
  formConfs: FormConfs
  userNameMap: Map<string, string>
  deptNameMap: Map<string, string>
  getChangeIconClass: (record: ChangeRecord) => string
  getChangeDescription: (record: ChangeRecord, getFieldName: (field: string) => string) => string
}>()
const { getFieldName, formatFieldValue } = createChangeRecordFormatter({
  formConfs: toRef(props, 'formConfs'),
  userNameMap: toRef(props, 'userNameMap'),
  deptNameMap: toRef(props, 'deptNameMap'),
})
</script>

<template>
<div class="change-list-wrapper">
    <div class="change-list">
        <!-- 空状态 -->
        <div v-if="!changeRecords || changeRecords.length === 0" class="empty-state">
            <emptyBox />
        </div>
        <!-- 变更记录列表 -->
        <template v-else>
            <div class="change-items">
                <div v-for="(record, index) in changeRecords" :key="index" class="change-item">
                    <div class="change-item-header">
                        <div class="change-icon" :class="getChangeIconClass(record)">
                            <icon-edit v-if="record.classify == 2" />
                            <icon-plus v-else-if="record.classify == 1" />
                            <icon-delete v-else />
                        </div>
                        <div class="change-info">
                            <div class="change-user-time">
                                <span class="change-user">{{ record.createUser ||
                                    record.nickname ||
                                    '未知用户' }}</span>
                                <span class="change-time">{{ record.createTime ||
                                    record.recordTime
                                    || '' }}</span>
                            </div>
                            <div class="change-desc">
                                {{ getChangeDescription(record, getFieldName) }}
                            </div>
                        </div>
                    </div>
                    <!-- 显示变更内容（支持 compareFields 数组格式） -->
                    <div class="change-content-list"
                        v-if="record.classify == 2 && record.compareFields && record.compareFields.length > 0">
                        <div v-for="(field, idx) in record.compareFields" :key="idx"
                            class="change-field-item">
                            <div class="change-field-name">
                                {{ getFieldName(field.field) }}
                            </div>
                            <div class="change-field-values">
                                <span class="old-value">{{ formatFieldValue(field.oldValue,
                                    field.field) }}</span>
                                <icon-arrow-right class="change-arrow" />
                                <span class="new-value">{{ formatFieldValue(field.newValue,
                                    field.field) }}</span>
                            </div>
                        </div>
                    </div>
                    <!-- 兼容旧格式 -->
                    <div class="change-content"
                        v-else-if="record.classify == 2 && record.oldValue && record.newValue">
                        <div class="change-value old-value">
                            {{ record.oldValue }}
                        </div>
                        <icon-arrow-right class="change-arrow" />
                        <div class="change-value new-value">
                            {{ record.newValue }}
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</div>
</template>

<style scoped lang="scss">
.change-list {
    padding: 16px;

    // 空状态样式
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;

        .empty-icon {
            font-size: 48px;
            color: #cbd5e1;
            margin-bottom: 16px;
        }

        .empty-text {
            font-size: 14px;
            color: #94a3b8;
        }
    }

    // 变更记录卡片列表
    .change-items {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .change-item {
            background: #f8fafc;
            border-radius: 12px;
            padding: 16px;
            transition: all 0.3s;

            &:hover {
                background: #f1f5f9;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            }

            .change-item-header {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                margin-bottom: 12px;

                .change-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    flex-shrink: 0;

                    &.icon-edit {
                        background: #fef3c7;
                        color: #f59e0b;
                    }

                    &.icon-plus {
                        background: #dcfce7;
                        color: #22c55e;
                    }

                    &.icon-delete {
                        background: #fee2e2;
                        color: #ef4444;
                    }
                }

                .change-info {
                    flex: 1;

                    .change-user-time {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-bottom: 4px;

                        .change-user {
                            font-size: 14px;
                            font-weight: 500;
                            color: #1e293b;
                        }

                        .change-time {
                            font-size: 12px;
                            color: #94a3b8;
                        }
                    }

                    .change-desc {
                        font-size: 13px;
                        color: #64748b;
                    }
                }
            }

            .change-content {
                display: flex;
                align-items: center;
                gap: 8px;
                padding-left: 44px;

                .change-value {
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;

                    &.old-value {
                        background: #fee2e2;
                        color: #dc2626;
                        text-decoration: line-through;
                    }

                    &.new-value {
                        background: #dcfce7;
                        color: #16a34a;
                    }
                }

                .change-arrow {
                    font-size: 14px;
                    color: #94a3b8;
                }
            }

            // 支持 compareFields 数组格式的变更内容列表
            .change-content-list {
                padding-left: 44px;
                margin-top: 8px;

                .change-field-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    margin-bottom: 8px;
                    padding: 8px 12px;
                    background: #f8fafc;
                    border-radius: 6px;
                    transition: all 0.2s;

                    &:hover {
                        background: #f1f5f9;
                    }

                    .change-field-name {
                        min-width: 100px;
                        font-size: 13px;
                        font-weight: 500;
                        color: #475569;
                        flex-shrink: 0;
                    }

                    .change-field-values {
                        display: flex;
                        align-items: flex-start;
                        gap: 8px;
                        flex: 1;
                        min-width: 0;

                        .old-value {
                            padding: 4px 10px;
                            background: #fee2e2;
                            color: #dc2626;
                            border-radius: 4px;
                            font-size: 13px;
                            text-decoration: line-through;
                            flex: 1;
                            word-break: break-word;
                            white-space: pre-wrap;
                            line-height: 1.6;
                        }

                        .change-arrow {
                            font-size: 14px;
                            color: #94a3b8;
                            flex-shrink: 0;
                            margin-top: 4px;
                        }

                        .new-value {
                            padding: 4px 10px;
                            background: #dcfce7;
                            color: #16a34a;
                            border-radius: 4px;
                            font-size: 13px;
                            font-weight: 500;
                            flex: 1;
                            word-break: break-word;
                            white-space: pre-wrap;
                            line-height: 1.6;
                        }
                    }
                }
            }

            .change-action {
                margin-top: 12px;
                padding-left: 44px;

                .view-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 12px;
                    background: rgba(59, 130, 246, 0.1);
                    color: rgb(var(--primary-6));
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;

                    &:hover {
                        background: rgba(59, 130, 246, 0.2);
                        transform: translateY(-1px);
                    }
                }
            }
        }
    }

    .lifeCycle-footer {
        margin-top: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0;
    }
}
</style>
