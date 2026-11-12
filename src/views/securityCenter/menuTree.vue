<template>
  <div class="menu-tree-inner">
    <a-tree
      :default-expand-all="false"
      v-model:checked-keys="checkedMenuIds"
      block-node
      :field-names="{
        key: 'id',
        title: 'label',
      }"
      :checkable="true"
      :disabled="!canEdit"
      :data="menuData"
    />
  </div>
</template>
<script lang="ts" setup>
import { computed, ref } from "vue";
import {
  getMenuTree,
  addMenuGrant,
  getMenuGrantIds,
} from "@/api/securityCenter";
import { Message } from "@arco-design/web-vue";

const securityGroup = ref<any>();
const menuData = ref();
const checkedMenuIds = ref<string[]>([]);

const canEdit = computed(
  () => securityGroup.value && securityGroup.value.id !== "1",
);

const loadMenuTree = () => {
  getMenuTree().then((res) => {
    menuData.value = res;
  });
};

const loadMenu = (group: any) => {
  checkedMenuIds.value = [];
  securityGroup.value = group;
  
  // 如果是系统管理员，显示全部选中
  if (group && group.id === "1") {
    // Message.info("系统管理员拥有所有权限");
    // 获取所有菜单ID并全部选中
    const getAllMenuIds = (menus: any[]): string[] => {
      let ids: string[] = [];
      menus.forEach((menu) => {
        ids.push(menu.id);
        menu.disabled = true;
        if (menu.children && menu.children.length > 0) {
          ids = ids.concat(getAllMenuIds(menu.children));
        }
      });
      return ids;
    };
    checkedMenuIds.value = getAllMenuIds(menuData.value || []);
    return;
  }else{
     // Message.info("系统管理员拥有所有权限");
    // 获取所有菜单ID并全部选中
    const getAllMenuIds = (menus: any[]): string[] => {
      menus.forEach((menu) => {
        menu.disabled = false;
        if (menu.children && menu.children.length > 0) {
        getAllMenuIds(menu.children)
        }
      });
    };
    checkedMenuIds.value = getAllMenuIds(menuData.value || []);
   
  }
  
  getMenuGrantIds(group.id).then((res) => {
    checkedMenuIds.value = res;
  });
};

const saveMenu = () => {
  if (!canEdit.value) {
    Message.warning("系统管理员拥有所有权限，无法修改");
    return;
  }
  const menuIds = {
    authorityIds: checkedMenuIds.value,
  };
  addMenuGrant(securityGroup.value.id, menuIds).then(() => {
    Message.success("功能授权成功");
    loadMenuTree();
  });
};

loadMenuTree();

defineExpose({
  loadMenu,
  saveMenu,
});
</script>

<style lang="scss" scoped>
.menu-tree-inner {
  font-size: 13px;
  color: #334155;
}
</style>
