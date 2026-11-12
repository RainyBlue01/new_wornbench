<template>
  <div class="sys-settings-page">
    <userBanner url="/homepage" :title="'系统设置'" :active="4" />
    <div class="sys-settings-main">
      <div class="sys-card">
        <div class="card-header">
          <h3>图标库</h3>
          <a-button class="btn-ghost-sm" @click="triggerUpload">
            <template #icon>
              <icon-plus />
            </template>
            添加图标
          </a-button>
        </div>
        <div class="card-body">
          <emptyBox
            v-if="!icons.length"
            embedded
            desc="暂无图标，点击右上角添加图标"
          />
          <div v-else class="icon-grid">
            <div
              v-for="icon in icons"
              :key="icon.id"
              class="icon-item"
            >
              <img :src="icon.url" class="icon-preview" alt="" />
              <button
                type="button"
                class="icon-delete"
                title="删除"
                @click="removeIcon(icon)"
              >
                <icon-close />
              </button>
            </div>
            <div class="icon-add-card" @click="triggerUpload">
              <icon-plus />
              <span>添加图标</span>
            </div>
          </div>
          <a-upload
            ref="uploadRef"
            class="icon-upload-hidden"
            action="/"
            accept="image/*"
            :show-file-list="false"
            :custom-request="customRequest"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Modal, Message } from "@arco-design/web-vue";
import { getIconList, uploadIcon, deleteIcon } from "@/api/iconLibrary/index";
import emptyBox from "@/components/emptyBox/emptyBox.vue";

const icons = ref<any[]>([]);
const uploadRef = ref();
const win = window as any;
const token = localStorage.getItem("wornbench_token");

const getIcons = () => {
  getIconList().then((res) => {
    icons.value = (res || []).map((v: any) => ({
      ...v,
      uid: v.id,
      url: win.api.dowUrl + v.id + "&token=" + token,
    }));
  });
};

const triggerUpload = () => {
  const input = uploadRef.value?.$el?.querySelector('input[type="file"]');
  input?.click();
};

const customRequest = (option: any) => {
  const { fileItem } = option;
  const formData = new FormData();
  const blob = new Blob([JSON.stringify({ folder: "appIcon" })], {
    type: "application/json",
  });
  formData.append("fileProfile", blob);
  formData.append("file", fileItem.file);
  uploadIcon(formData).then(() => {
    Message.success("上传成功");
    getIcons();
  });
};

const removeIcon = (file: any) => {
  Modal.confirm({
    title: "提示",
    simple: true,
    renderToBody: false,
    titleAlign: "start",
    content: "确认删除该图标?",
    hideCancel: false,
    okText: "确认",
    onOk: async () => {
      deleteIcon(file.id).then(() => {
        Message.success("删除成功");
        getIcons();
      });
    },
  });
};

getIcons();
</script>

<style lang="scss">
@use "../../styles/system-settings.scss";
</style>
