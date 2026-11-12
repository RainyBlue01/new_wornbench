<template>
    <div class="qRelationQuery">
        <div class="selects">
            <a-select :placeholder="comDes.title" :disabled="comDes.props.disabled" allow-search
                :multiple="comDes.props.selectType === 'single' ? false : true" v-model="comDes.props.value"
                @change="changeData" allow-clear :options="comDes.props.options"></a-select>
        </div>
        <div class="table" v-if="Array.isArray(data) && data.length > 0">
            <a-table :columns="columns" :scroll="scroll"   :scrollbar="scrollbar" :pagination="false" :data="data" />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, inject, watch, h } from 'vue'
import { Image, Link } from '@arco-design/web-vue'
const options = ref([])
const props = defineProps<{
    comDes: any,
    formConfs: any,
}>()
const win = window as any
const scrollbar = ref(true);
const scroll = { x: "max-content" };
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
                            v.type === 'USER' ? (attach.nickname ? attach.nickname : '') : (attach.deptName ? attach.deptName : '')
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
                        let paths = record[v.id]
                        const attaches = Array.isArray(paths) ? paths : []
                        return h(
                            'div',
                            attaches.map(
                                (item: any) => {
                                    return h(
                                        Link,
                                        {
                                            href: item.path  ?  win.api.dowUrl + item.path + '&token=' + token : '',
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
const provideState = inject("provideDesigner") as {
    filterData: (...args: any) => void;
};
const data = ref([])
watch(
    () => props.comDes.props.value,
    () => {
        if (props.comDes.props.value) {
            if (props.comDes.props.selectType === 'single') {
            
                props.comDes.props.options.map(v1 => {
                    if (props.comDes.props.value == v1.value) {
                        
                        data.value = [v1.data]
                    }
                })

            }else{
                let newData = []
               props.comDes.props.value.map(v => {
                    props.comDes.props.options.map(v1 => {
                        if (v == v1.value) {
                           newData.push(v1.data)
                        }
                    })

                })
                  data.value = newData
            }
            provideState.filterData(props.comDes)
        } else {
            data.value = []
            provideState.filterData(props.comDes)
        }

    },
    { immediate: true },
);
const changeData = () => {
}
</script>
<style lang="scss" scoped>
@use "@/styles/table.scss" as table;
.qRelationQuery {
    width: 100%;

    .selects {
        margin-bottom: 10px;
    }
}
</style>