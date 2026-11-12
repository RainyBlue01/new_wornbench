<template>
    <a-modal v-model:visible="visible" :render-to-body="false" @cancel="handleCancel" :footer="false" unmountOnClose 
        title-align="start" width="1200px" :mask-closable="false" :align-center="false"> 
        <template #title>回收站</template>

        <div class="original-table">
            <div class="original-table-data">
                <a-table rowKey="id" :pagination="false" :columns="columns" :data="data" :scroll="scroll"
                    :scrollbar="scrollbar">
                    <template #operation="row">
                        <a-space class="original-operation-cell">
                            <a-link @click="upDateLift(row.record)">数据生命周期</a-link>
                        </a-space>
                    </template>
                </a-table>
            </div>
            <div class="data-pagination person-page">
                <PersonPagination
                    :total="pagination.total"
                    :current="pagination.current"
                    :page-size="pagination.pageSize"
                    @change="changePageNumHandler"
                    @page-size-change="changePageSizeHandler"
                />
            </div>
        </div>
    </a-modal>
    <lifeCycle ref="lifeCycleRef" />
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import lifeCycle from "./lifeCycle.vue";
import PersonPagination from "@/views/user/components/PersonPagination.vue";
import {
    originalPageRecordApi,
} from "@/api/original/index";
const props = defineProps<{
    appdes: any;
    columns: any;
}>();
const lifeCycleRef = ref()
const visible = ref(false);
const data = ref([]);
const matchValue = ref(false);
const conditions = ref([]);

const pagination = reactive({
    total: 1,
    current: 1,
    pageSize: 10,
});

const scrollbar = ref(true);
const scroll = { maxHeight: "calc(100vh - 400px)" };


const handleCancel = () => {
    visible.value = false;
};





const upDateLift = (record: any) => {
    let params = {
        dataId: record.id,
        formId: props.appdes.formId
    }
    lifeCycleRef.value.show(params)
}

const changePageSizeHandler = (size: number) => {
    pagination.pageSize = size;
    pagination.current = 1;
    originalPageRecord();
};

const changePageNumHandler = (current: number) => {
    pagination.current = current;
    originalPageRecord();
};



const originalPageRecord = () => {
    const params = {
        formId: props.appdes.formId,
        appId: props.appdes.id,
        current: pagination.current,
        size: pagination.pageSize,
        match: matchValue.value,
        logicDelete: 1,
        conditions: conditions.value,
    };

    originalPageRecordApi(params).then((res) => {
        pagination.total = res.total;
        pagination.current = res.current;
        pagination.pageSize = res.size;
        data.value = res.records.map((record) => {
            const handleObj = {
                ...record,
                ...record.dataValue,
            };
            if (record.instanceState && record.instanceState == 1) {
                handleObj.disabled = true;
            }
            return handleObj;
        });
    });
};

const show = () => {
    visible.value = true;
    originalPageRecord();
};
defineExpose({ show });

</script>

<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;


.original-table {
    padding: 0px 10px 10px 10px;

    &-wrapper {
        display: flex;
        -webkit-box-pack: justify;
        -ms-flex-pack: justify;
        justify-content: space-between;
        background-color: #fff;
        padding-bottom: 16px;

        &-left {
            .arco-btn {
                background-color: #fff;
                border: 1px solid #ddd;
            }

            .arco-btn:hover {
                background-color: textColor.$ThemeTextColor;
                border: 1px solid textColor.$ThemeTextColor;
                color: #fff;
            }
        }

        &-right {
            &-fieldSelect {
                background: #fff;
                border-radius: 4px;
                border: 1px solid #ebeef5;
                padding: 12px 15px;
                z-index: 2000;
                color: #606266;
                line-height: 1.4;
                text-align: justify;
                font-size: 14px;
                box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
                word-break: break-all;
            }

            .arco-btn {
                color: rgba(0, 0, 0, 0.6);
                padding: 0 3px;
            }

            .arco-btn:hover {
                background: #fff;
            }
        }
    }

    &-data {
    

        .arco-table-th {
            font-size: 13px;
        }
    }

    .data-pagination {
        flex-shrink: 0;
    }
}
</style>
<style lang="scss">
@use "styles/textColor.scss" as textColor;
.original-table {
    &-wrapper {
        &-right {
            &-fieldSelect {

                .arco-checkbox-indeterminate .arco-checkbox-icon,
                .arco-checkbox-checked .arco-checkbox-icon {
                    background-color: textColor.$ThemeTextColor;
                    border-color: transparent;
                }
            }
        }
    }

    &-data {
        .arco-table-th {
            font-size: 12px !important;
            font-weight: bold;
            padding: 2px;
            background-color: var(--color-neutral-2) !important;
        }

        .arco-table-td {
            padding: 2px 0px;

            .arco-link {
                padding: 0;
            }
        }

        .arco-checkbox-indeterminate .arco-checkbox-icon,
        .arco-checkbox-checked .arco-checkbox-icon {
            background-color: textColor.$ThemeTextColor;
            border-color: transparent;
        }
    }

    .original-operation-cell {
        a {
            color: rgba(0, 0, 0, 0.6);
        }

        a:hover {
            color: #ed2f2f;
        }
    }
}
</style>
