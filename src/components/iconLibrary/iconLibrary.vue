<template>
  <div class="content-box">
    <div class="content-box-bodys">
      <img v-for="icon in icons" :src="icon.url" @click="chooseIcon(icon.id)" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { getIconCacheList } from "@/api/iconLibrary/index";

const emit = defineEmits(["click"]);
const icons = ref([]);
const win = window as any;

const getIcons = () => {
  getIconCacheList().then((res) => {
    res.map((v: any) => {
      v.url =
        v.id ? (win.api.dowUrl +
          v.id +
          "&token=" +
          localStorage.getItem("wornbench_token")) : '';
    });
    icons.value = res;
  });
};

const chooseIcon = (iconId) => {
  emit("click", iconId);
};

getIcons();
</script>
<style lang="scss" scoped>
@use "../../styles/textColor.scss" as textColor;

.content-box {
  &-bodys {
    background-color: #fff;

    .page-bottom {
      display: flex;
      align-items: center;
      margin-top: 16px;
      justify-content: flex-end;
    }

    img {
      width: 32px;
      height: 32px;
      margin: 5px;
      padding: 1px;
      cursor: pointer;
    }

    img:hover {
      background: #ccc;

      border-radius: 5px;
    }
  }
}
</style>
<style>
.arco-modal-simple .arco-modal-footer {
  text-align: right;
}
</style>
