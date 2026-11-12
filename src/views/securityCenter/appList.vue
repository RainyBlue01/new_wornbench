<template>
  <div class="manager-app-list">
    <div
      v-for="item in appList"
      :key="item.id"
      class="item"
      @mouseenter="checkAppHandler(item.id)"
      @mouseleave="unCheckAppHandler"
    >
      <appCategory :category="item.category" />
      <a-space>
        <div class="img">
          <img v-if="item.showIcon" :src="item.showIcon" alt="" />
          <img v-else :src="zhu" alt="" />
        </div>
        <div class="des">
          {{ item.appName }}
        </div>
      </a-space>
      <div
        v-if="securityGroup && securityGroup.id != '1' && checkApp == item.id"
        class="remove-btn"
      >
        <icon-close @click="removeAppHandler(item)" />
      </div>
    </div>
    <div class="item" v-if="securityGroup && securityGroup.id != '1'">
      <div class="add-app" @click="addAppHandler">
        <icon-plus />
      </div>
    </div>

    <base-modal
      ref="modalRef"
      @handle-ok="formSubmit"
      @handle-cancel="handleCancel"
    >
      <a-checkbox-group v-model="addApp">
        <div class="manager-app-list">
          <template v-for="item in allApp" :key="item.id">
            <div class="item" v-if="isExistsChoose(item)">
              <appCategory :category="item.category" />
              <a-checkbox :value="item.id">
                <a-space>
                  <div class="img">
                    <img v-if="item.showIcon" :src="item.showIcon" alt="" />
                    <img v-else :src="zhu" alt="" />
                  </div>
                  <div class="des">
                    {{ item.appName }}
                  </div>
                </a-space>
              </a-checkbox>
            </div>
          </template>
        </div>
      </a-checkbox-group>
    </base-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import {
  grantApps,
  addGrantApp,
  deleteGrantApp,
  getApps,
} from "@/api/securityCenter";
import zhu from "../../assets/icon_zhanwei.svg";
import { Message, Modal } from "@arco-design/web-vue";
const emits = defineEmits(["getAppNum"]);
const securityGroup = ref();
const appList = ref([]);
const allApp = ref([]);
const modalRef = ref();
const addApp = ref([]);
const win = window as any;
const existsIds = ref([]);
const loadAllApps = () => {
  getApps().then((res) => {
    res.map((v: any) => {
      v.showIcon =
        v.icon && v.icon != null
          ? win.api.dowUrl +
            v.icon +
            "&token=" +
            localStorage.getItem("wornbench_token")
          : "";
    });
    allApp.value = res;
  });
};

const loadApp = (group: any) => {
  securityGroup.value = group;
  grantApps(group.id).then((res) => {
    res.map((v: any) => {
      v.showIcon =
        v.icon && v.icon != null
          ? win.api.dowUrl +
            v.icon +
            "&token=" +
            localStorage.getItem("wornbench_token")
          : "";
    });
    existsIds.value = res.map((v) => v.id);
    appList.value = res;
    emits("getAppNum", appList.value.length);
  });
};

const checkApp = ref();
const checkAppHandler = (appId: string) => {
  checkApp.value = appId;
};

const unCheckAppHandler = () => {
  checkApp.value = "";
};

const removeAppHandler = (item: any) => {
  Modal.confirm({
    width: "300px",
    title: "确认",
       titleAlign: "start",
    content: `确认移除 ${item.appName}?`,
    hideCancel: false,
    okText: "确认删除",
    onOk: async () => {
      deleteGrantApp(securityGroup.value.id, { authorityIds: [item.id] }).then(
        (res) => {
          Message.success("移除应用成功");
          loadApp(securityGroup.value);
        },
      );
    },
  });
};

const isExistsChoose = (item: any) => {
  return !existsIds.value.includes(item.id);
};

const addAppHandler = () => {
  modalRef.value.handleClick({
    title: "添加应用",
    okText: "完成",
    cancelText: "关闭",
    showBtn: true,
    width: "800px",
  });
};

const handleCancel = () => {
  addApp.value = [];
  modalRef.value.handleClose();
};
const formSubmit = () => {
  addGrantApp(securityGroup.value.id, {
    authorityIds: addApp.value.concat(existsIds.value),
  }).then((res) => {
    Message.success("添加成功");
    handleCancel();
    loadApp(securityGroup.value);
  });
};

loadAllApps();

defineExpose({ loadApp });
</script>

<style lang="scss" scoped>
@use "../../styles/textColor.scss" as textColor;

.manager-app-list {
  width: 100%;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-flow: row wrap;
  flex-flow: row wrap;
  -webkit-box-pack: start;
  -ms-flex-pack: start;
  .item {
    border: 1px solid #e2e5eb;
    border-radius: 8px;
    position: relative;
    cursor: pointer;
    padding: 10px;
    margin-right: 8px;
    margin-bottom: 8px;
    width: calc(22% - 7.5px);
    height: 50px;

    .img img {
      width: 32px;
      margin-top: 4px;
    }
    .remove-btn {
      position: absolute;
      right: 5px;
      top: 28px;
    }
    .des {
      font-size: 13px;
      line-height: 50px;
      width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .add-app {
      text-align: center;
      line-height: 50px;
    }
  }
  .disable {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
