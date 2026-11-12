<template>
    <div class="qRelationData">
        <div class="table">
            <a-table :columns="columns" :pagination="false"    :data="comDes.props.value" />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, reactive, watch, h } from 'vue'
import { Image, Link } from '@arco-design/web-vue'
const props = defineProps<{
    comDes: any,
    formConfs: any,
}>()
const win = window as any
let token = localStorage.getItem("wornbench_token");
const columns = ref([])

watch(
    () => props.comDes.props.fieldList,
    () => {
        columns.value = []
        props.comDes.props.fieldList.map(v => {
            if (v.type == 'SIGNATURE') {
                columns.value.push({
                    title: v.title,
                    render: ({ record }: any) => {
                        let attach = record[v.id];
                        return h(
                            Image,
                            {
                                src: win + attach + '&token=' + token,
                                width: "80",
                                style: 'min-height:80px;margin-right:10px;',
                            }
                        )
                    }
                })
            } else if (v.type === 'RADIO' || v.type === 'SELECT' || v.type === 'SWITCH') {
                columns.value.push({
                    title: v.title,
                    render: ({ record }: any) => {
                        let attach = record[v.id];
                        return h(
                            'div',
                            {},
                            attach.label
                        )
                    }
                })
            } else if (v.type === 'CHECKBOX' || v.type === 'SELECT_MULTIPLE') {
                columns.value.push({
                    title: v.title,
                    render: ({ record }) => {
                        let paths = record[v.id]
                        const attaches = Array.isArray(paths) ? paths : []
                        return h(
                            'div',
                            attaches.map(
                                (item: any, index: any) => {
                                    return h(
                                        'div',
                                        {
                                            style: 'display:inline-block'
                                        },
                                        (item.label ? (index == 0 ? '' : ',') + item.label : '无名称')
                                    )
                                }
                            )
                        )

                    }
                })
            } else if (v.type === 'USER' || v.type === 'DEPT') {
                columns.value.push({
                    title: v.title,
                    render: ({ record }: any) => {
                        let attach = record[v.id];
                        return h(
                            'div',
                            {},
                            v.type === 'USER' ? (attach ? attach.nickname : '') : (attach ? attach.deptName : '')
                        )
                    }
                })
            } else if (v.type === 'ADDRESS') {
                columns.value.push({
                    title: v.title,
                    render: ({ record }: any) => {
                        let attach = record[v.id];
                        return h(
                            'div',
                            {},
                            attach.prov + '/' + attach.city + '/' + attach.dist + '/' + attach.det
                        )
                    }
                })
            } else if (v.type === 'DATE_INTERVAL' || v.type === 'TIME_INTERVAL') {
                columns.value.push({
                    title: v.title,
                    render: ({ record }: any) => {
                        let attach = record[v.id];
                        return h(
                            'div',
                            {},
                            attach.start + '-' + attach.end
                        )
                    }
                })
            } else if (v.type === 'DEPT_MULTIPLE' || v.type === 'USER_MULTIPLE') {
                columns.value.push({
                    title: v.title,
                    render: ({ record }) => {
                        let paths = record[v.id]
                        const attaches = Array.isArray(paths) ? paths : []
                        return h(
                            'div',
                            attaches.map(
                                (item: any, index: any) => {
                                    return h(
                                        'div',
                                        {
                                            style: 'display:inline-block'
                                        },
                                        (item.deptName ? (index == 0 ? '' : ',') + item.deptName : (index == 0 ? '' : ',') + item.nickname)
                                    )
                                }
                            )
                        )

                    }
                })
            } else if (v.type === 'ATTACH' || v.type === 'PICTURE') {
                columns.value.push({
                    title: v.title,
                    render: ({ record }) => {
                        let paths = JSON.parse(record[v.id])
                        const attaches = Array.isArray(paths) ? paths : []
                        return h(
                            'div',
                            attaches.map(
                                (item: any) => {
                                    return h(
                                        Link,
                                        {
                                            href: win.api.dowUrl + item.path + '&token=' + token,
                                        },
                                        (item.fileName ? item.fileName : '无名称')
                                    )
                                }
                            )
                        )

                    }
                })
            } else {
                columns.value.push({
                    title: v.title,
                    dataIndex: v.id,
                })
            }
        })
    },
    { immediate: true },
);
const data = reactive([])
</script>
<style lang="scss" scoped>
@use "@/styles/table.scss" as table;
.qRelationData {
    width: 100%;
}


</style>