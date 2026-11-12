<template>
  <div class="sys-settings-page">
    <userBanner url="/homepage" :title="'系统设置'" active="settings" />
    <div class="sys-settings-main config-layout">
      <left active="3" />
      <div class="sys-card config-main">
        <div class="card-header">
          <h3>微信服务号配置</h3>
          <a-button class="btn-ghost-sm" @click="submitHandler">
            <template #icon>
             <i class="fas fa-save"></i>
            </template>
            保存
          </a-button>
        </div>
        <div class="card-body">
          <a-form
            ref="formRef"
            :style="{ width: '100%' }"
            :model="formData"
            :rules="rules"
            layout="vertical"
            scroll-to-first-error
          >
            <a-form-item field="enable" label="配置开关">
              <a-radio-group v-model="formData.enable" >
                <a-radio :value="true">开启</a-radio>
                <a-radio :value="false">关闭</a-radio>
              </a-radio-group>
            </a-form-item>

            <template v-if="formData.enable">
              <a-form-item field="appId" label="微信服务号 APPID">
                <a-input
                  v-model="formData.appId"
                  placeholder="从微信开发者平台获取"
                  :max-length="50"
                  allow-clear
                />
              </a-form-item>

              <a-form-item field="appSecret" label="微信服务号 APPSECRET">
                <a-input-password
                  v-model="formData.appSecret"
                  placeholder="从微信开发者平台获取"
                  :max-length="100"
                  allow-clear
                  autocomplete="new-password"
                />
              </a-form-item>

              <a-form-item field="templateId" label="模板消息 ID">
                <a-input
                  v-model="formData.templateId"
                  placeholder="从微信公众平台获取"
                  :max-length="100"
                  allow-clear
                />
              </a-form-item>
            </template>
          </a-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { getConfig, updateConfig } from "@/api/settings/index";
import { Message } from "@arco-design/web-vue";
import left from "./left.vue";

interface WechatOfficialConfig {
  id?: string;
  enable?: boolean;
  appId?: string;
  appSecret?: string;
  templateId?: string;
}

const formData = reactive<WechatOfficialConfig>({
  id: "",
  enable: false,
  appId: "",
  appSecret: "",
  templateId: "",
});

const rules = ref({
  appId: [{ required: true, message: "请填写微信服务号 APPID" }],
  appSecret: [{ required: true, message: "请填写微信服务号 APPSECRET" }],
  templateId: [{ required: true, message: "请填写模板消息 ID" }],
});

const formRef = ref();

const refresh = () => {
  getConfig("wechatOfficialConfig").then((res) => {
    const jsonData = JSON.parse(res.configure);
    formData.id = res.id;
    formData.enable = jsonData.enable || false;
    formData.appId = jsonData.appId || "";
    formData.appSecret = jsonData.appSecret || "";
    formData.templateId = jsonData.templateId || "";
  });
};

const validateForm = async () => {
  const errors = await formRef.value.validate();
  return !errors;
};

const submitHandler = async () => {
  if (formData.enable && !(await validateForm())) return;

  const messageConfigData = {
    enable: formData.enable,
    appId: formData.appId,
    appSecret: formData.appSecret,
    templateId: formData.templateId,
  };

  updateConfig(formData.id, {
    configure: JSON.stringify(messageConfigData),
  })
    .then(() => {
      Message.success("修改成功");
      refresh();
    })
    .catch(() => {
      Message.error("修改失败");
    });
};

refresh();
</script>

<style lang="scss">
@use "../../styles/system-settings.scss";
</style>
