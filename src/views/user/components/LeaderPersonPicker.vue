<template>
  <div class="leader-person-picker">
    <div class="leader-person-picker__search person-modal-form">
      <a-input
        v-model="keyword"
        allow-clear
        placeholder="搜索姓名/电话"
        @press-enter="fetchUsers"
        @clear="fetchUsers"
        @input="onKeywordInput"
      />
    </div>
    <div class="person-leader-person-panel">
      <a-spin :loading="loading">
        <div v-if="userList.length" class="person-leader-pick-list">
          <button
            v-for="u in userList"
            :key="u.id"
            type="button"
            class="person-leader-pick"
            :class="{ 'is-active': isSelected(getUserId(u)) }"
            @click="toggleUser(u)"
          >
            <span class="person-leader-pick__avatar">{{
              avatarText(u.nickname)
            }}</span>
            <span class="person-leader-pick__body">
              <span class="person-leader-pick__name">
                {{ u.nickname }}
                <span v-if="postMeta(u)" class="person-leader-pick__meta">{{
                  postMeta(u)
                }}</span>
              </span>
              <span class="person-leader-pick__dept">{{ deptText(u) }}</span>
            </span>
          </button>
        </div>
        <div v-else-if="!loading" class="person-leader-empty">暂无人员</div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { getUser } from "@/api/user/index";
import { getPrimaryDeptName, getPostDisplay } from "../utils/personDisplay";

const props = withDefaults(
  defineProps<{
    modelValue?: (string | number)[];
  }>(),
  {
    modelValue: () => [],
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: (string | number)[]];
  change: [users: any[]];
}>();

const keyword = ref("");
const userList = ref<any[]>([]);
const loading = ref(false);
const userMap = ref<Record<string, any>>({});

const isSelected = (id: string | number | null | undefined) =>
  id != null &&
  (props.modelValue || []).some((v) => String(v) === String(id));

const usersFromIds = (ids: (string | number)[]) =>
  ids.map((id) => userMap.value[String(id)]).filter(Boolean);

const avatarText = (name?: string) => {
  const n = (name || "").trim();
  return n ? n.charAt(0) : "?";
};

const postMeta = (record: any) => {
  const postLine = getPostDisplay(record);
  if (!postLine || postLine === "-") return "";
  const parts = postLine.includes(" - ") ? postLine.split(" - ") : [postLine];
  const postOnly = parts.length > 1 ? parts.slice(1).join(" - ") : parts[0];
  return postOnly && postOnly !== "-" ? postOnly : "";
};

const deptText = (record: any) => {
  const dept = getPrimaryDeptName(record);
  return dept && dept !== "-" ? dept : "未分配部门";
};

const getUserId = (user: any) => user?.id ?? user?.userId;

const toggleUser = (user: any) => {
  const uid = getUserId(user);
  if (uid == null) return;
  const ids = [...(props.modelValue || [])];
  const idx = ids.findIndex((id) => String(id) === String(uid));
  if (idx >= 0) ids.splice(idx, 1);
  else ids.push(uid);
  emit("update:modelValue", ids);
  emit("change", usersFromIds(ids));
};

let keywordTimer: ReturnType<typeof setTimeout> | null = null;
const onKeywordInput = () => {
  if (keywordTimer) clearTimeout(keywordTimer);
  keywordTimer = setTimeout(() => fetchUsers(), 300);
};

const fetchUsers = () => {
  loading.value = true;
  getUser({
    active: 1,
    userType: 1,
    current: 1,
    size: 200,
    username: keyword.value.trim() || undefined,
  })
    .then((res) => {
      const kw = keyword.value.trim().toLowerCase();
      let list = res.records || [];
      if (kw) {
        list = list.filter(
          (u: any) =>
            (u.nickname || "").toLowerCase().includes(kw) ||
            (u.phone || "").includes(kw),
        );
      }
      userList.value = list;
      const map: Record<string, any> = { ...userMap.value };
      list.forEach((u: any) => {
        const uid = getUserId(u);
        if (uid != null) map[String(uid)] = u;
      });
      userMap.value = map;
    })
    .finally(() => {
      loading.value = false;
    });
};

watch(
  () => props.modelValue,
  (ids) => {
    const missing = (ids || []).some(
      (id) => id != null && !userMap.value[String(id)],
    );
    if (missing) fetchUsers();
  },
  { deep: true },
);

const refresh = () => fetchUsers();

defineExpose({ refresh });
fetchUsers();
</script>

<style lang="scss" scoped>
@use "@/styles/person-modal.scss";
</style>
