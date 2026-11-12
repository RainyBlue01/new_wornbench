<template>
  <div class="app-manage-page baseMsg">
    <h2 class="app-manage-page-title">Webhook</h2>
    <div class="app-manage-form form">
      <a-form ref="refChangeForm" :style="{ width: '100%' }" :model="formData" :rules="rules" layout="vertical"
              scroll-to-first-error>
        <a-form-item field="active" label="是否开启">
          <a-switch v-model="formData.active" :checked-value="1" :unchecked-value="0"/>
        </a-form-item>
        <webhook-mapping v-show="formData.active == '1'"
                         ref="webhookMappingRef"
                         :app-id="appdes.id"
                         :mapping="formData.mapping"
                         @change="changeWebhookMapping" />
      </a-form>
    </div>
  </div>
</template>
<script setup lang="ts">
import {setWebhookConfig, getWebhookConfig} from '@/api/homePage/index'
import {ref, reactive, toRaw, watch} from 'vue'
import {Message} from '@arco-design/web-vue';
import {useRouter, useRoute} from 'vue-router'
import { inject } from 'vue'
import WebhookMapping from "@/views/application/updateApp/webhookMapping.vue";

const win = window as any
const route = useRoute()
const refChangeForm = ref();

// 获取应用ID：优先使用注入的 appId，否则从 route.query.id 获取
const getAppId = inject('appId', () => route.query.id) as () => any;
const props = defineProps<{
  appdes: any,
}>()
const emits = defineEmits([
  'handleCancel',
])

interface FormDataType {
  active?: string;
  mapping?: string;
}

const formData = reactive<FormDataType>({
  active: '',
  mapping: '',
});

// 添加 webhookMapping 组件的引用
const webhookMappingRef = ref();
const mappingData = ref([])

getAppId() && getWebhookConfig(getAppId()).then(res => {
  formData.active = res.active
  if (!!res.mapping) {
    formData.mapping = res.mapping
    mappingData.value = JSON.parse(res.mapping)
  }
})
const rules = ref({
  active: [
    {
      required: true,
      message: '请选择是否开启',
    },
  ],
});
const handClear = () => {
  formData.active = ''
  formData.mapping = ''
  emits('handleCancel')
}
const formSubmit = () => {
  refChangeForm.value.validate((error: any) => {
    if (!error) {

      if (!validateMappingData()) {
        return;
      }

      let params = {
        active: formData.active,
        mapping: JSON.stringify(mappingData.value),
      }
      setWebhookConfig(params, getAppId()).then(() => {
        Message.success('修改成功');
        handClear()
      })
    }
  });
}

// 校验映射数据的完整性
const validateMappingData = () => {
  // 如果没有开启webhook，不需要校验映射数据
  if (formData.active != '1') {
    return true;
  }

  // 调用子组件的方法来校验数据
  if (webhookMappingRef.value) {
    const validationResult = webhookMappingRef.value.validateMappingData();
    if (!validationResult.valid) {
      Message.warning(validationResult.message || '请完善映射编码信息');
      return false;
    }
  }
  return true;
};


const changeWebhookMapping = (data: any) => {
  mappingData.value = data
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
