/** 性别展示 */
export function formatSex(sex: number) {
  if (sex === 2) return "女";
  if (sex === 1) return "男";
  return "未知";
}

/** 主部门名称 */
export function getPrimaryDeptName(record: any) {
  const list = record?.userDeptList;
  if (!Array.isArray(list) || list.length === 0) return "-";
  const main = list.find((d: any) => d.partTime === 0) || list[0];
  return main?.deptName || "-";
}

/** 是否已设置主部门（partTime === 0 且 deptId 有效） */
export function hasPrimaryDept(record: any): boolean {
  const list = record?.userDeptList;
  if (!Array.isArray(list) || list.length === 0) return false;
  const main = list.find((d: any) => d.partTime === 0);
  return main?.deptId != null && String(main.deptId) !== "";
}

/** 兼职部门数量（除主部门外） */
export function getPartTimeDeptCount(record: any) {
  const list = record?.userDeptList;
  if (!Array.isArray(list)) return 0;
  const extras = list.filter((d: any) => d.partTime === 1);
  return extras.length;
}

/** 职位展示：有主部门时为「部门 - 职位」，与原型 roleDisplay 一致 */
export function getPostDisplay(record: any) {
  const list = record?.userDeptList;
  if (!Array.isArray(list) || list.length === 0) return "-";
  const main = list.find((d: any) => d.partTime === 0) || list[0];
  const deptName = main?.deptName || "-";
  const posts = main?.userPostList;
  const postNames =
    !Array.isArray(posts) || posts.length === 0
      ? "-"
      : posts.map((p: any) => p.postName).join("、");
  if (deptName === "-" || deptName === "") return '';
  if (postNames === "-") return '';
  return `${deptName} - ${postNames}`;
}

/** 客户端按职位 id 过滤（后端不支持 postIds 时兜底） */
export function filterByPostId(records: any[], postId: string | number) {
  if (!postId) return records;
  return records.filter((r) => {
    const list = r?.userDeptList;
    if (!Array.isArray(list)) return false;
    return list.some((d: any) =>
      (d.userPostList || []).some((p: any) => p.postId === postId),
    );
  });
}
