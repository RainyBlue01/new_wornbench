<template>
    <div class="app-manage-page baseMsg">
        <h2 class="app-manage-page-title">应用密钥</h2>
        <div class="app-manage-form form">
            <a-form ref="refChangeForm" :style="{ width: '100%' }" :model="formData" :rules="rules" layout="vertical"
                scroll-to-first-error>
                <a-form-item field="smpAppId" label="应用id">
                    <a-input v-model="formData.smpAppId" placeholder="应用id" :max-length="50" allow-clear
                        show-word-limit />
                    <template #extra>
                        <div>应用id用于与服务中台应用关联，填写后请仔细核对</div>
                    </template>
                </a-form-item>
                <!-- <a-form-item field="smpAppSecret" label="应用密钥">
                    <a-input-password v-model="formData.smpAppSecret" placeholder="应用密钥" :max-length="200" allow-clear
                        show-word-limit />
                 
                </a-form-item> -->

            </a-form>
        </div>
    </div>
</template>
<script setup lang="ts">
import { setClientSecret, getSmpAppConfig } from "@/api/homePage/index";
import { ref, reactive } from "vue";
import { Message } from "@arco-design/web-vue";
import { useRoute } from "vue-router";
import { inject } from 'vue'
const route = useRoute();
const refChangeForm = ref();

// 获取应用ID：优先使用注入的 appId，否则从 route.query.id 获取
const getAppId = inject('appId', () => route.query.id) as () => any;
const props = defineProps<{
    appdes: any;
}>();
const emits = defineEmits(["handleCancel"]);
interface FormDataType {
    smpAppId?: string;
    // smpAppSecret?: string;
}
const formData = reactive<FormDataType>({
    smpAppId: "",
    // smpAppSecret: "",
});
getAppId() && getSmpAppConfig(getAppId()).then((res) => {
    formData.smpAppId = res.smpAppId;
    // formData.smpAppSecret = res.smpAppSecret;
});

const rules = ref({
    // smpAppId: [
    //     {
    //         required: true,
    //         message: "请输入应用ID",
    //     },
    // ],
    // smpAppSecret: [
    //     {
    //         required: true,
    //         message: "请输入应用密钥",
    //     },
    // ],
});
const handClear = () => {
    formData.smpAppId = "";
    // formData.smpAppSecret = "";
    emits("handleCancel");
};
const formSubmit = () => {
    refChangeForm.value.validate((error: any) => {
        if (!error) {
            let params = {
                ...formData,
            };
            setClientSecret(params, getAppId()).then(() => {
                Message.success("修改应用密钥成功");
                handClear();
            });
        }
    });
};

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

#app_update_id {
    display: inline-block;
    position: relative;
}
</style>
<style>
.app .arco-modal-body {
    overflow: visible !important;
}
</style>
