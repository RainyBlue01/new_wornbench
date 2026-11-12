<template>
  <div class="sys-settings-page">
    <userBanner url="/homepage" :title="'系统设置'" active="settings" />
    <div class="sys-settings-main config-layout">
      <left active="2" />
      <div class="sys-card config-main">
        <div class="card-header">
          <h3>内部认证配置</h3>
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
              <a-form-item field="server" label="认证地址">
                <a-input
                  v-model="formData.server"
                  placeholder="请输入认证地址"
                  :max-length="200"
                  allow-clear
                />
              </a-form-item>

              <a-form-item field="appId" label="APPID">
                <a-input
                  v-model="formData.appId"
                  placeholder="从开放平台获取"
                  :max-length="50"
                  allow-clear
                />
              </a-form-item>

              <a-form-item field="clientSecret" label="APPSECRET">
                <a-input-password
                  v-model="formData.clientSecret"
                  placeholder="从开放平台获取"
                  :max-length="100"
                  allow-clear
                  autocomplete="new-password"
                />
              </a-form-item>

              <a-form-item field="scenarioCode" label="场景编码">
                <a-input
                  v-model="formData.scenarioCode"
                  placeholder="请输入场景编码"
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

interface MiddlePlatformConfig {
  id?: string;
  enable?: boolean;
  server?: string;
  appId?: string;
  clientSecret?: string;
  scenarioCode?: string;
}

const formData = reactive<MiddlePlatformConfig>({
  id: "",
  enable: false,
  server: "",
  appId: "",
  clientSecret: "",
  scenarioCode: "",
});

const rules = ref({
  server: [{ required: true, message: "请输入认证地址" }],
  appId: [{ required: true, message: "请填写 APPID" }],
  clientSecret: [{ required: true, message: "请填写 APPSECRET" }],
  scenarioCode: [{ required: true, message: "请填写场景编码" }],
});

const formRef = ref();

const refresh = () => {
  getConfig("middleConfig").then((res) => {
    const jsonData = JSON.parse(res.configure);
    formData.id = res.id;
    formData.enable = jsonData.enable || false;
    formData.server = jsonData.server || "";
    formData.appId = jsonData.appId || "";
    formData.clientSecret = jsonData.clientSecret || "";
    formData.scenarioCode = jsonData.scenarioCode || "";
  });
};

const validateForm = async () => {
  const errors = await formRef.value.validate();
  return !errors;
};

const submitHandler = async () => {
  if (formData.enable && !(await validateForm())) return;

  const loginConfigData = {
    enable: formData.enable,
    server: formData.server,
    appId: formData.appId,
    clientSecret: formData.clientSecret,
    scenarioCode: formData.scenarioCode,
  };

  updateConfig(formData.id, {
    configure: JSON.stringify(loginConfigData),
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
