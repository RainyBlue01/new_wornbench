<template>
    <div class="app-manage-page access">
        <h2 class="app-manage-page-title">访问限制</h2>
        <a-form ref="refChangeForm" class="access-form" :style="{ width: '100%' }" :model="formData" :rules="rules"
            layout="vertical" scroll-to-first-error>
            <a-form-item field="appName" label="访问对象" class="access-object-item">
                <div class="select">
                    <a-tag v-for="(name, index) of formData.deptIds" :key="index">
                        <div class="tag">
                            <div class="tag-name">
                                {{ name.label }}
                            </div>
                            <div class="close" @click="closeItem(1, index)">
                                <icon-close />
                            </div>
                        </div>
                    </a-tag>
                    <a-tag v-for="(name, index) of formData.postIds" :key="index">
                        <div class="tag">
                            <div class="tag-name">
                                {{ name.postName }}
                            </div>
                            <div class="close" @click="closeItem(2, index)">
                                <icon-close />
                            </div>
                        </div>
                    </a-tag>
                    <a-tag v-for="(name, index) of formData.roleIds" :key="index">
                        <div class="tag">
                            <div class="tag-name">
                                {{ name.roleName }}
                            </div>
                            <div class="close" @click="closeItem(3, index)">
                                <icon-close />
                            </div>
                        </div>
                    </a-tag>
                    <a-tag v-for="(name, index) of formData.userIds" :key="index">
                        <div class="tag">
                            <div class="tag-name">
                                {{ name.nickname }}
                            </div>
                            <div class="close" @click="closeItem(4, index)">
                                <icon-close />
                            </div>
                        </div>
                    </a-tag>
                </div>
            </a-form-item>
            <a-form-item field="category" label="权限清单" class="permission-item">
                <div class="list app-manage-inner-scroll">
                    <a-tabs v-model="activeKey" auto-switch justify>
                        <a-tab-pane key="1">
                            <template #title><i class="fas fa-building" style="margin-right:4px;" />部门</template>
                            <deptList :users="formData.userIds" :deptList="deptLists" ref="deptListRef" />
                        </a-tab-pane>
                        <a-tab-pane key="2">
                            <template #title><i class="fas fa-briefcase" style="margin-right:4px;" />职位</template>
                            <jobsList :users="formData.postIds" :postList="postList" ref="postListRef" />
                        </a-tab-pane>
                        <a-tab-pane key="3">
                            <template #title><i class="fas fa-user-tag" style="margin-right:4px;" />角色</template>
                            <rolesList :users="formData.roleIds" :roleList="roleList" ref="roleListRef" />
                        </a-tab-pane>
                        <a-tab-pane key="4">
                            <template #title><i class="fas fa-user" style="margin-right:4px;" />人员</template>
                            <personList :showUser="true" :deptList="deptLists" ref="personListRef" />
                        </a-tab-pane>
                    </a-tabs>
                </div>
            </a-form-item>
        </a-form>
    </div>
</template>
<script setup lang="ts">
import { setAccess, getAccess } from '@/api/homePage/index'
import personList from '@/components/selectPerson/components/personList.vue'
import deptList from '@/components/selectPerson/components/deptList.vue'
import jobsList from '@/components/selectPerson/components/jobsList.vue'
import rolesList from '@/components/selectPerson/components/rolesList.vue'
import { getRoleList, getPostList } from '@/api/common/index'
import { ref, reactive, provide } from 'vue'
import { Message } from '@arco-design/web-vue';
import { useRoute } from 'vue-router'
import { inject } from 'vue'
const personListRef = ref()
const refChangeForm = ref();
const route = useRoute()

const getAppId = inject('appId', () => route.query.id) as () => any;
const activeKey = ref("1")
const deptListRef = ref()
const postListRef = ref()
const roleListRef = ref()
const props = defineProps<{
    appdes: any,
    deptLists: any,
}>()
const emits = defineEmits([
    'handleCancel',
])
interface FormDataType {
    deptIds: any,
    postIds: any,
    userIds: any,
    roleIds: any,
}
const formData = reactive<FormDataType>({
    deptIds: [],
    postIds: [],
    userIds: [],
    roleIds: [],
});
const roleList = ref([])
const postList = ref([])
const getData = async () => {
    const [res1, res3] = await Promise.all([getRoleList(), getPostList()]);
    roleList.value = res1
    postList.value = res3
    getList()
}
const getList = () => {
    getAppId() && getAccess(getAppId()).then(res => {
        deptListRef.value.setData((res.deptIds ? res.deptIds : []))
        postListRef.value.setData((res.postIds ? res.postIds : []))
        roleListRef.value.setData((res.roleIds ? res.roleIds : []))
        personListRef.value.setData((res.userIds ? res.userIds : []))
    })
}

getData()
const rules = ref({
});
const closeItem = (val: any, index: number) => {
    if (val == 1) {
        formData.deptIds.splice(index, 1)
        deptListRef.value.updateItem(formData.deptIds)
    }
    if (val == 2) {
        formData.postIds.splice(index, 1)
        postListRef.value.updateItem(formData.postIds)
    }
    if (val == 3) {
        formData.roleIds.splice(index, 1)
        roleListRef.value.updateItem(formData.roleIds)
    }
    if (val == 4) {
        formData.userIds.splice(index, 1)
        personListRef.value.updateItem(formData.userIds)
    }
}
const handClear = () => {
    formData.deptIds = []
    formData.postIds = []
    formData.userIds = []
    formData.roleIds = []
    closeItem(1, formData.deptIds)
    closeItem(2, formData.postIds)
    closeItem(3, formData.roleIds)
    closeItem(4, formData.userIds)
    emits('handleCancel')
}
const formSubmit = () => {
    refChangeForm.value.validate((error: any) => {
        if (!error) {
            let params = {
                deptIds: formData.deptIds.map(user => user.id),
                postIds: formData.postIds.map(user => user.id),
                userIds: formData.userIds.map(user => user.id),
                roleIds: formData.roleIds.map(user => user.id),
            }
            setAccess(params, getAppId()).then(() => {
                Message.success('修改成功');
                handClear()
            })
        }
    });
}
const setForms = (val: any, item: any) => {
    formData[val] = item
}
provide("provideDesigner", { setForms });

defineExpose({
    formSubmit,
    handClear,
})
</script>
<style lang="scss" scoped>
@use "@/styles/app-manage.scss" as appManage;
@use "@/styles/person-modal.scss" as personModal;

.access {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    height: 100%;
    padding-bottom: 0;

    .app-manage-page-title {
        margin-bottom: 20px;
        flex-shrink: 0;
    }



    .list.app-manage-inner-scroll {
        flex: 1;
        max-height: none;
        overflow-y: auto;
        @include appManage.app-manage-scrollbar;
        @include appManage.app-manage-org-tabs;
        min-height: 0;
    }
}

.tag {
    display: flex;
    align-items: center;
    color: #334155;
    font-size: 13px;

    .close {
        margin-left: 4px;
        cursor: pointer;
        color: #94a3b8;

        &:hover {
            color: #64748b;
        }
    }
}

.select {
    @include appManage.app-manage-tag-select;
    @include personModal.dsp-org-selection-tag;
    gap: 4px;
    align-items: center;
    flex-wrap: wrap;
}

:deep(.access-form .arco-tabs-content) {
    padding-top: 0;
}

:deep(.access-form .permission-item) {
    margin-bottom: 0;
}
</style>
<style lang="scss">
.access-form {
    .arco-tabs-nav-tab-list {
        width: 100%;
    }

    .arco-tabs-tab {
        width: 25% !important;
    }
}
</style>
