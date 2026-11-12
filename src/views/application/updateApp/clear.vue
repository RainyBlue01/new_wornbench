

<template>
    <div class="app-manage-page baseMsg">
        <h2 class="app-manage-page-title" v-if="check == 3">数据清理</h2>
        <h2 class="app-manage-page-title" v-else-if="check == 4">应用销毁</h2>
        <h2 class="app-manage-page-title" v-else-if="check == 8">应用转让</h2>
        <div class="app-manage-form form">
            <a-form ref="refChangeForm" :style="{ width: '100%' }" :model="formData" :rules="rules" layout="vertical"
                scroll-to-first-error>
                <a-form-item field="clear" v-if="check == 3" label="以输入“清理全部数据”，来清除数据">
                    <a-input v-model="formData.clear" placeholder="清理全部数据" :max-length="50" allow-clear show-word-limit />
                    <template #extra>
                        <div>清理数据会彻底清空该应用下的所有数据，请谨慎操作。如要删除部分数据，请在原始数据中操作。</div>
                    </template>
                </a-form-item>
                <a-form-item field="name" v-if="check == 4" label="以输入应用名称，来销毁应用">
                    <a-input v-model="formData.name" placeholder="应用名称" :max-length="50" allow-clear show-word-limit />
                    <template #extra>
                        <div>应用一旦销毁不可恢复，请谨慎操作</div>
                    </template>
                </a-form-item>
                <a-form-item field="userId" v-if="check == 8" label="转让人">
                    <!-- <selectPerson placeholder="分管领导" title="选择分管领导" v-model="formData.userIds" :deptList="deptList" /> -->
                    <a-select allow-search :style="{ width: '100%' }" :field-names="fieldNameRole" allow-clear
                        placeholder="转让人" :options="roleList" v-model="formData.userId" />
                          <template #extra>
                        <div>应用转让后，转让人将获得该应用的所有权限</div>
                    </template>
                </a-form-item>
            </a-form>
        </div>
    </div>
</template>
<script setup lang="ts">
import { deleteApp, dataClear, transferApp } from '@/api/homePage/index'
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue';
import { getUserList } from '@/api/common/index.ts'
import { useRouter } from 'vue-router'
const fieldNameRole = { value: 'id', label: 'nickname' }
const win = window as any
const refChangeForm = ref();
const props = defineProps<{
    appdes: any,
    check: number
}>()
const router = useRouter()
const roleList = ref([])
getUserList().then(res => {
    roleList.value = res
})
const emits = defineEmits([
    'handleCancel',
])
interface FormDataType {
    name?: string;
    userId?: string;
    clear?: string;
}
const formData = reactive<FormDataType>({
    name: '',
    userId: '',
    clear: ''
});
const rules = ref({
    name: [
        {
            required: true,
            message: '请输入应用名称',
        },
        {
            validator: (value, cb) => {
                if (value !== props.appdes.appName) {
                    cb('应用名称错误')
                } else {
                    cb()
                }
            }
        }
    ],
    clear: [
        {
            required: true,
            message: '请输入清理全部数据',
        },
        {
            validator: (value, cb) => {
                if (value !== '清理全部数据') {
                    cb('请输入清理全部数据')
                } else {
                    cb()
                }
            }
        }
    ],
    userId: [
        {
            required: true,
            message: '请输入转让人',
        },
    ],
});
const handClear = () => {
    formData.name = ''
    formData.userId = ''
    formData.clear = ''
    emits('handleCancel')
}
const formSubmit = () => {
    refChangeForm.value.validate((error: any) => {
        if (!error) {
            if (props.check == 4) {
                deleteApp(props.appdes.id).then(() => {
                    Message.success('删除成功');
                    router.replace({
                        name: 'myApps'
                    })
                })
            } else if (props.check == 3) {
                dataClear(props.appdes.id).then(() => {
                    Message.success('数据清理成功');
                    handClear()
                })
            } else if (props.check == 8) {
                var formDatas = new URLSearchParams()
                formDatas.append('userId', formData.userId)
                transferApp(formDatas, props.appdes.id).then(() => {
                    Message.success('应用转让成功');
                    router.push({
                        path: '/homePage'
                    })
                })
            }

        }
    });
}

defineExpose({
    formSubmit,
    handClear,
})
</script>
<style lang="scss" scoped>
@use "@/styles/app-manage.scss" as appManage;

.form {
  flex: 1;
  @include appManage.app-manage-form;
}
</style>
