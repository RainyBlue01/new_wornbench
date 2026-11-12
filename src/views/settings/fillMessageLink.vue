<template>
  <div class="sys-settings-page">
    <userBanner url="/homepage" :title="'系统设置'" active="settings" />
    <div class="sys-settings-main config-layout">
      <left active="4" />
      <div class="sys-card config-main">
        <div class="card-header">
          <h3>业务配置</h3>
          <a-button class="btn-ghost-sm" @click="submitHandler">
            <template #icon>
               <i class="fas fa-save"></i>
            </template>
            保存
          </a-button>
        </div>
        <div class="card-body">
          <div class="sys-form-alert">
            <i class="fas fa-exclamation-circle" aria-hidden="true" />
            <span>此配置用于业务页面的链接生成，通常不需要修改。</span>
          </div>

          <a-form
            ref="formRef"
            :style="{ width: '100%' }"
            :model="formData"
            layout="vertical"
            scroll-to-first-error
          >
            <div class="section-title">
              <span>PC端配置</span>
              <span class="line" />
            </div>

            <a-form-item field="pcItemRedirectUrl" label="PC端待办重定向链接">
              <a-input
                v-model="formData.pcItemRedirectUrl"
                placeholder="请输入PC端待办重定向链接"
                :max-length="500"
                allow-clear
              />
            </a-form-item>

            <a-form-item field="pcFillRedirectUrl" label="PC端填报重定向链接">
              <a-input
                v-model="formData.pcFillRedirectUrl"
                placeholder="请输入PC端填报重定向链接"
                :max-length="500"
                allow-clear
              />
            </a-form-item>

            <div class="section-title section-title--spaced">
              <span>移动端配置</span>
              <span class="line" />
            </div>

            <a-form-item
              field="mobileItemRedirectUrl"
              label="移动端待办重定向链接"
            >
              <a-input
                v-model="formData.mobileItemRedirectUrl"
                placeholder="请输入移动端待办重定向链接"
                :max-length="500"
                allow-clear
              />
            </a-form-item>

            <a-form-item
              field="mobileFillRedirectUrl"
              label="移动端填报重定向链接"
            >
              <a-input
                v-model="formData.mobileFillRedirectUrl"
                placeholder="请输入移动端填报重定向链接"
                :max-length="500"
                allow-clear
              />
            </a-form-item>

            <a-form-item
              field="mobileExternalRedirectUrl"
              label="微信端外网地址"
            >
              <a-input
                v-model="formData.mobileExternalRedirectUrl"
                placeholder="请输入微信端外网地址"
                :max-length="500"
                allow-clear
              />
            </a-form-item>
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

interface FillMessageLinkConfig {
  id?: string;
  pcItemRedirectUrl?: string;
  mobileItemRedirectUrl?: string;
  pcFillRedirectUrl?: string;
  mobileExternalRedirectUrl?: string;
  mobileFillRedirectUrl?: string;
}

const formData = reactive<FillMessageLinkConfig>({
  id: "",
  pcItemRedirectUrl: "",
  mobileItemRedirectUrl: "",
  pcFillRedirectUrl: "",
  mobileExternalRedirectUrl: "",
  mobileFillRedirectUrl: "",
});

const formRef = ref();

const refresh = () => {
  getConfig("detailLinkConfig").then((res) => {
    const jsonData = JSON.parse(res.configure);
    formData.id = res.id;
    formData.pcItemRedirectUrl = jsonData.pcItemRedirectUrl || "";
    formData.pcFillRedirectUrl = jsonData.pcFillRedirectUrl || "";
    formData.mobileItemRedirectUrl = jsonData.mobileItemRedirectUrl || "";
    formData.mobileFillRedirectUrl = jsonData.mobileFillRedirectUrl || "";
    formData.mobileExternalRedirectUrl =
      jsonData.mobileExternalRedirectUrl || "";
  });
};

const submitHandler = async () => {
  const configData = {
    pcItemRedirectUrl: formData.pcItemRedirectUrl,
    pcFillRedirectUrl: formData.pcFillRedirectUrl,
    mobileItemRedirectUrl: formData.mobileItemRedirectUrl,
    mobileFillRedirectUrl: formData.mobileFillRedirectUrl,
    mobileExternalRedirectUrl: formData.mobileExternalRedirectUrl,
  };

  updateConfig(formData.id, { configure: JSON.stringify(configData) }).then(
    () => {
      Message.success("修改成功");
      refresh();
    },
  );
};

refresh();
</script>

<style lang="scss">
@use "../../styles/system-settings.scss";
</style>
