import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { getDept } from "@/api/department/index";
import { getRoleList } from "@/api/role/index";
import { getPostList } from "@/api/job/index";
import { getNoDeptNum } from "@/api/user/index";
import { toSnowflakeIdString } from "@/utils/snowflakeId";

export type PersonLeftTab = "dept" | "post" | "role" | "leader" | "resigned";

export const PERSON_TAB_TITLES: Record<PersonLeftTab, string> = {
  dept: "按部门筛选",
  post: "按职位筛选",
  role: "角色成员管理",
  leader: "分管领导",
  resigned: "离职成员",
};

export function usePersonPage() {
  const route = useRoute();

  const leftTab = ref<PersonLeftTab>(
    (route.query.tab as PersonLeftTab) || "dept",
  );

  const deptList = ref<any[]>([]);
  const roleList = ref<any[]>([]);
  const postList = ref<any[]>([]);
  const noDeptNum = ref(0);

  /** 部门筛选：'' 全部 | '__NO_DEPT__' 无部门 | 部门 id */
  const deptFilter = ref<string>("");
  const selectedPostId = ref<string | number | "">("");
  const selectedRoleId = ref<string | number | "">("");

  const pageTitle = computed(() => PERSON_TAB_TITLES[leftTab.value]);

  const deptNameMap = computed(() => {
    const map = new Map<string | number, string>();
    const walk = (nodes: any[]) => {
      nodes?.forEach((n) => {
        map.set(n.id, n.label);
        if (n.children?.length) walk(n.children);
      });
    };
    walk(deptList.value);
    return map;
  });

  const resolveDeptNames = (ids: (string | number)[] | undefined) => {
    if (!ids?.length) return "未设置";
    return ids
      .map((id) => deptNameMap.value.get(id) || String(id))
      .join(" · ");
  };

  const switchTab = (tab: PersonLeftTab) => {
    leftTab.value = tab;
    if (tab === "dept") {
      deptFilter.value = "";
    }
    if (tab !== "post") {
      selectedPostId.value = "";
    }
    if (tab !== "role") {
      selectedRoleId.value = "";
    }
  };

  const loadMeta = async () => {
    const [dept, roles, noDept, posts] = await Promise.all([
      getDept(),
      getRoleList(),
      getNoDeptNum({ userType: 1, username: "" }),
      getPostList(),
    ]);
    deptList.value = dept || [];
    roleList.value = (roles || []).map((r: any) => ({
      ...r,
      id: toSnowflakeIdString(r.id),
    }));
    noDeptNum.value = noDept ?? 0;
    postList.value = posts || [];
  };

  const refreshNoDeptNum = async () => {
    const noDept = await getNoDeptNum({ userType: 1, username: "" });
    noDeptNum.value = noDept ?? 0;
  };

  watch(
    () => route.query.tab,
    (tab) => {
      if (
        tab &&
        ["dept", "post", "role", "leader", "resigned"].includes(tab as string)
      ) {
        leftTab.value = tab as PersonLeftTab;
      }
    },
  );

  return {
    leftTab,
    deptList,
    roleList,
    postList,
    noDeptNum,
    deptFilter,
    selectedPostId,
    selectedRoleId,
    pageTitle,
    deptNameMap,
    resolveDeptNames,
    switchTab,
    loadMeta,
    refreshNoDeptNum,
  };
}
