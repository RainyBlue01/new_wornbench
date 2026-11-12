<template>
    <a-modal :visible="visible" title="填报详情" :width="520" :footer="false" unmount-on-close
        @update:visible="emit('update:visible', $event)" @cancel="emit('close')">
        <a-spin :loading="loading" style="width: 100%;">
            <div v-if="data" class="view-detail-content">
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">填报人</span>
                        <span class="detail-value detail-value--bold">{{ data.nickname || '--' }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">所在部门</span>
                        <span class="detail-value">{{ data.deptName || '--' }}</span>
                    </div>
                    <div v-for="row in rows" :key="row.id" class="detail-item">
                        <span class="detail-label">{{ row.title }}</span>
                        <span class="detail-value">
                            <span v-if="row.lines?.length"
                                :class="['fill-field-tag', row.tagClass, 'detail-lines-tag']">
                                <span v-for="(line, lineIndex) in row.lines" :key="`${row.id}-${lineIndex}`">
                                    {{ line }}
                                </span>
                            </span>
                            <span v-else :class="['fill-field-tag', row.tagClass]">{{ row.text }}</span>
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">提交时间</span>
                        <span class="detail-value">{{ data.submitTime || '--' }}</span>
                    </div>
                </div>
                <div class="view-modal-footer">
                    <a-dropdown @select="(key: string) => emit('download', key)">
                        <button type="button" class="ops-btn-ghost-sm">
                            <icon-download />
                            下载
                            <icon-down />
                        </button>
                        <template #content>
                            <a-doption value="word">Word（按表单模板）</a-doption>
                            <a-doption value="pdf">PDF（按表单模板）</a-doption>
                        </template>
                    </a-dropdown>
                    <a-dropdown @select="(key: string) => emit('print', key)">
                        <button type="button" class="ops-btn-ghost-sm">
                            <icon-printer />
                            打印
                            <icon-down />
                        </button>
                        <template #content>
                            <a-doption value="form">按表单模板打印</a-doption>
                            <a-doption value="row">按行打印</a-doption>
                        </template>
                    </a-dropdown>
                </div>
            </div>
        </a-spin>
    </a-modal>
</template>

<script setup lang="ts">
interface DetailRow {
    id: string | number
    title: string
    text: string
    lines?: string[]
    tagClass?: string
}

defineProps<{
    visible: boolean
    loading: boolean
    data: Record<string, any> | null
    rows: DetailRow[]
}>()

const emit = defineEmits<{
    (event: 'update:visible', value: boolean): void
    (event: 'close'): void
    (event: 'download', key: string): void
    (event: 'print', key: string): void
}>()
</script>

<style scoped lang="scss">
.view-detail-content {
    .detail-grid {
        display: grid;
        grid-template-columns: 100px 1fr;
        gap: 12px 16px;
        align-items: center;
        font-size: 13px;
        color: #475569;
    }

    .detail-item {
        display: contents;
    }

    .detail-label {
        color: #94a3b8;
    }

    .detail-value {
        color: #475569;

        &--bold {
            font-weight: 600;
            color: #1e293b;
        }
    }
}

.fill-field-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    line-height: 1.4;

    &--success { color: #16a34a; background: #f0fdf4; }
    &--warn { color: #d97706; background: #fff7ed; }
    &--info { color: #2563eb; background: #eff6ff; }
    &--muted { color: #64748b; background: #f1f5f9; }
}

.detail-lines-tag {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
    max-width: 100%;
    white-space: normal;
    word-break: break-word;
}

.view-modal-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #f1f5f9;
}
</style>
