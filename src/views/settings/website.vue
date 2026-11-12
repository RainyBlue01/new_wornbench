<template>
  <div class="sys-settings-page">
    <userBanner url="/homepage" :title="'系统设置'" active="settings" />
    <div class="sys-settings-main config-layout">
      <left active="1" />
      <div class="sys-card config-main">
        <div class="card-header">
          <h3>系统配置</h3>
          <a-button class="btn-ghost-sm" @click="submitHandler">
            <template #icon>
              <i class="fas fa-save"></i>
            </template>
            保存
          </a-button>
        </div>
        <div class="card-body">
          <a-form ref="formRef" :style="{ width: '100%' }" :model="formData" :rules="rules" layout="vertical"
            scroll-to-first-error>
            <!-- <a-form-item field="logo" label="系统 Logo">
              <div class="item">
                <a-upload action="/" accept="image/*" :file-list="logoFile ? [logoFile] : []" :show-file-list="false"
                  :custom-request="uploadLogoRequest">
                  <template #upload-button>
                    <div class="logo-upload">
                      <img v-if="formData.logoUrl" :src="formData.logoUrl" alt="" />
                      <template v-else>
                        <i class="fas fa-cloud-upload-alt" aria-hidden="true" />
                        <p>点击上传</p>
                      </template>
                    </div>
                  </template>
                </a-upload>
                <p class="logo-upload-tips">
                  支持 PNG、JPG、SVG 格式，推荐正方形图片
                </p>
              </div>

            </a-form-item> -->

            <a-form-item field="title" label="系统名称">
              <a-input v-model="formData.title" placeholder="请输入系统名称" :max-length="30" allow-clear show-word-limit />
            </a-form-item>

            <!-- <a-form-item field="desc" label="描述">
              <a-input v-model="formData.desc" placeholder="请输入系统描述" :max-length="100" allow-clear show-word-limit />
            </a-form-item> -->
          </a-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { upload } from "@/api/user";
import { getConfig, updateConfig } from "@/api/settings/index";
import { Message } from "@arco-design/web-vue";
import { webSiteConfigStore } from "@/store/index";
import left from "./left.vue";

const webSiteStore = webSiteConfigStore();

interface WebsiteConfig {
  id?: string;
  title?: string;
  desc?: string;
  logo?: string;
  logoUrl?: string;
}

const formData = reactive<WebsiteConfig>({
  id: "",
  title: "",
  desc: "",
  logo: "",
  logoUrl: "",
});

const rules = ref({
  title: [{ required: true, message: "请输入系统名称" }],
});

const formRef = ref();
const win = window as any;
const dowUrl = win.api.dowUrl;
const token = localStorage.getItem("wornbench_token");
const logoFile = ref();
console.log(token)
const refresh = () => {
  getConfig("website").then((res) => {
    const jsonData = JSON.parse(res.configure);
    formData.id = res.id;
    formData.title = jsonData.title || "";
    formData.desc = jsonData.desc || jsonData.intro || "";
    formData.logo = jsonData.logo;
    if (formData.logo) {
      formData.logoUrl = dowUrl + formData.logo + "&token=" + token;
    } else {
      formData.logoUrl = "";
    }
  });
};

const uploadLogoRequest = (option: any) => {
  const { fileItem } = option;
  const uploadFileData = new FormData();
  const blob = new Blob([JSON.stringify({ folder: "appIcon" })], {
    type: "application/json",
  });
  uploadFileData.append("fileProfile", blob);
  uploadFileData.append("file", fileItem.file);
  upload(uploadFileData).then((res) => {
    formData.logoUrl = "";
    setTimeout(() => {
      logoFile.value = fileItem;
      formData.logo = res;
      formData.logoUrl = win.api.dowUrl + res + "&token=" + token;
    }, 100);
  });
};

const validateForm = async () => {
  const errors = await formRef.value.validate();
  return !errors;
};

const submitHandler = async () => {
  if (!(await validateForm())) return;

  const configData = {
    title: formData.title,
    desc: formData.desc,
    logo: formData.logo,
  };

  updateConfig(formData.id, { configure: JSON.stringify(configData) }).then(
    () => {
      Message.success("修改成功");
      webSiteStore.setWebSiteConfig(configData);
      refresh();
    },
  );
};

refresh();
</script>

<style lang="scss">
@use "../../styles/system-settings.scss";
</style>
