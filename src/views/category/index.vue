<template>
  <div class="sys-settings-page">
    <userBanner url="/homepage" :title="'系统设置'" :active="4" />
    <div class="sys-settings-main">
      <div class="sys-card">
        <div class="card-header">
          <h3>应用分类</h3>
          <a-button class="btn-ghost-sm" @click="addItem">
            <template #icon>
              <icon-plus />
            </template>
            新增分类
          </a-button>
        </div>
        <div class="card-body">
          <emptyBox
            v-if="!data.length"
            embedded
            desc="暂无应用分类，点击右上角新增分类"
          />
          <draggable
            v-else
            v-model="data"
            class="cat-list"
            handle=".cat-drag"
            ghost-class="sortable-ghost"
            @end="onDragEnd"
          >
            <div
              v-for="(element, index) in data"
              :key="element.id"
              class="cat-item"
            >
              <span class="cat-drag" title="拖拽排序">
                <icon-drag-dot-vertical />
              </span>
              <span class="cat-num">{{ index + 1 }}</span>
              <span class="cat-name">{{ element.category }}</span>
              <div class="cat-actions">
                <button
                  type="button"
                  class="cat-action-btn edit"
                  title="编辑"
                  @click="editItem(element)"
                >
                  <icon-edit />
                </button>
                <button
                  type="button"
                  class="cat-action-btn"
                  title="删除"
                  @click="deleteItem(element)"
                >
                  <icon-delete />
                </button>
              </div>
            </div>
          </draggable>
        </div>
      </div>
    </div>
    <create ref="createRef" @init="search" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VueDraggableNext as draggable } from "vue-draggable-next";
import { getCategory, deleteCategory, putCategory } from "@/api/category/index";
import create from "./create.vue";
import emptyBox from "@/components/emptyBox/emptyBox.vue";
import { Modal, Message } from "@arco-design/web-vue";

const createRef = ref();
const data = ref<any[]>([]);

const getList = () => {
  getCategory({}).then((res) => {

    data.value = (res || []).sort(
      (a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
  });
};

getList();

const search = () => {
  getList();
};

const addItem = () => {
  createRef.value.showItem();
};

const editItem = (record: any) => {
  createRef.value.showItem(record);
};

const deleteItem = (item: any) => {
  Modal.confirm({
    title: "提示",
    simple: true,
    renderToBody: false,
    titleAlign: "start",
    content: "确定要移除应用分类吗？",
    hideCancel: false,
    okText: "确认",
    onOk: async () => {
      deleteCategory(item.id).then(() => {
        Message.success("移除成功");
        search();
      });
    },
  });
};

const onDragEnd = async () => {
  const updates = data.value.map((item, index) =>
    putCategory({ ...item, sortOrder: index + 1 }, item.id),
  );
  try {
    await Promise.all(updates);
    Message.success("排序已更新");
    getList();
  } catch {
    Message.error("排序更新失败");
    getList();
  }
};
</script>

<style lang="scss">
@use "../../styles/system-settings.scss";
</style>
