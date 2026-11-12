/** myApps 应用管理 / 应用广场 UI 状态本地持久化 */

export const MY_APPS_STORAGE_KEYS = {
  MINE_TAB: "homePageMineTab",
  PLAZA_CATEGORY: "homePagePlazaCategory",
  PLAZA_SEARCH: "homePagePlazaSearch",
  LEGACY_ACTIVE_NAME: "activeName",
} as const;

export type MineTab = "created" | "managed";

export function loadMineTab(): MineTab {
  const stored = localStorage.getItem(MY_APPS_STORAGE_KEYS.MINE_TAB);
  if (stored === "created" || stored === "managed") return stored;

  const legacy = localStorage.getItem(MY_APPS_STORAGE_KEYS.LEGACY_ACTIVE_NAME);
  if (legacy === "myCreate") {
    saveMineTab("created");
    return "created";
  }
  if (legacy === "myManage") {
    saveMineTab("managed");
    return "managed";
  }
  return "created";
}

export function saveMineTab(tab: MineTab) {
  localStorage.setItem(MY_APPS_STORAGE_KEYS.MINE_TAB, tab);
}

export function loadPlazaCategory(): string | null {
  return localStorage.getItem(MY_APPS_STORAGE_KEYS.PLAZA_CATEGORY);
}

export function savePlazaCategory(id: string | number) {
  localStorage.setItem(MY_APPS_STORAGE_KEYS.PLAZA_CATEGORY, String(id));
}

export function loadPlazaSearch(): string {
  return localStorage.getItem(MY_APPS_STORAGE_KEYS.PLAZA_SEARCH) || "";
}

export function savePlazaSearch(text: string) {
  if (text.trim()) {
    localStorage.setItem(MY_APPS_STORAGE_KEYS.PLAZA_SEARCH, text);
  } else {
    localStorage.removeItem(MY_APPS_STORAGE_KEYS.PLAZA_SEARCH);
  }
}

/** 将旧版 activeName（myCreate/myManage/分类 id）迁移到新 key */
export function migrateLegacyPlazaCategory(
  categories: Array<{ id: string | number }>,
): string | number | null {
  const legacy = localStorage.getItem(MY_APPS_STORAGE_KEYS.LEGACY_ACTIVE_NAME);
  if (!legacy) return null;

  if (legacy === "myCreate" || legacy === "myManage") {
    localStorage.removeItem(MY_APPS_STORAGE_KEYS.LEGACY_ACTIVE_NAME);
    return null;
  }

  const exists = categories.some((x) => String(x.id) === String(legacy));
  if (!exists) return null;

  savePlazaCategory(legacy);
  localStorage.removeItem(MY_APPS_STORAGE_KEYS.LEGACY_ACTIVE_NAME);
  return /^\d+$/.test(legacy) ? Number(legacy) : legacy;
}

export function clearMyAppsPersist() {
  Object.values(MY_APPS_STORAGE_KEYS).forEach((key) => {
    if (key !== MY_APPS_STORAGE_KEYS.LEGACY_ACTIVE_NAME) {
      localStorage.removeItem(key);
    }
  });
}
