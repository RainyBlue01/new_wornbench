import { Parser } from "expr-eval";
import {
  getUserRole as getUserRoleApi,
  getUserDept as getUserDeptApi,
  getUserPost as getUserPostApi,
  getUserDeptLevel as getUserDeptLevelApi,
  getUserDeptPath as getUserDeptPathApi,
} from "../../../api/login/index";

// import { ExpressionVariable } from '../formula';
interface ExpressionVariable {
  id: string;
  parentId: string;
  label: string;
  value?: string;
  selectable?: boolean;
  type?: string;
  showLabel?: string;
  children?: Array<ExpressionVariable>;
}
function getCurrentUser(attribute: string) {
  const userinfoStr = localStorage.getItem("wornbench_useinfo");
  const userinfo = JSON.parse(userinfoStr + "");
  switch (attribute) {
    case "id":
      return userinfo.id;
    case "nickname":
      return userinfo.nickname;
    case "username":
      return userinfo.username;
    case "email":
      return userinfo.email;
    case "phone":
      return userinfo.phone;
    case "sex":
      return userinfo.sex == 1 ? '男' : '女';
    case "isLeader":
      return isLeader(null);
    case "isMainLeader":
      return isLeader(0);
    case "isPartLeader":
      return isLeader(1);
    default:
      return "";
  }
}

function isLeader(partTime: number | null) {
  return getUserDeptApi({ partTime: partTime }).then((res) => {
    return res.filter((item: any) => item.leader == 1).length > 0;
  });
}

function getUserRole(attribute: string) {
  return getUserRoleApi().then((res) => {
    switch (attribute) {
      case "id":
        return res.map((item: any) => item.id).join(",");
      case "name":
        return res.map((item: any) => item.roleName).join(",");
      default:
        return "";
    }
  });
}

function getUserDept(attribute: string) {
  return autoGetUserDept(null, attribute);
}

function getUserMainDept(attribute: string) {
  return autoGetUserDept(0, attribute);
}

function getUserPartDept(attribute: string) {
  return autoGetUserDept(1, attribute);
}

function getUserDeptLevel() {
  return getUserDeptLevelApi().then((res) => {
    return res;

  })
}
function getUserDeptPath() {
  return getUserDeptPathApi().then((res) => {
    console.log("getUserDeptPath", res);
    return res;

  })
}
function autoGetUserDept(partTime: number | null, attribute: string) {
  return getUserDeptApi({ partTime: partTime }).then((res) => {
    switch (attribute) {
      case "id":
        return res.map((item: any) => item.deptId).join(",");
      case "name":
        return res.map((item: any) => item.deptName).join(",");
      default:
        return "";
    }
  });
}

function getUserPost(attribute: string) {
  return autoGetUserPost(null, attribute);
}

function getUserMainPost(attribute: string) {
  return autoGetUserPost(0, attribute);
}
function getUserPartPost(attribute: string) {
  return autoGetUserPost(1, attribute);
}

function autoGetUserPost(partTime: number | null, attribute: string) {
  return getUserPostApi({ partTime: partTime }).then((res) => {
    switch (attribute) {
      case "id":
        return res.map((item: any) => item.postId).join(",");
      case "name":
        return res.map((item: any) => item.postName).join(",");
      default:
        return "";
    }
  });
}

export const userVariable: ExpressionVariable = {
  id: "10000",
  parentId: "0",
  label: "当前用户",
  value: "userVariable",
  selectable: false,
  children: [
    {
      id: "10101",
      parentId: "10000",
      label: "ID",
      value: 'getCurrentUser("id")',
      type: "variable",
      showLabel: "当前用户 / ID",
    },
    {
      id: "10101",
      parentId: "10000",
      label: "昵称",
      value: 'getCurrentUser("nickname")',
      type: "variable",
      showLabel: "当前用户 / 昵称",
    },
    {
      id: "10102",
      parentId: "10000",
      label: "用户名",
      value: 'getCurrentUser("username")',
      type: "variable",
      showLabel: "当前用户 / 用户名",
    },
    {
      id: "10103",
      parentId: "10000",
      label: "电子邮箱",
      value: 'getCurrentUser("email")',
      type: "variable",
      showLabel: "当前用户 / 电子邮箱",
    },
    {
      id: "10104",
      parentId: "10000",
      label: "手机号码",
      value: 'getCurrentUser("phone")',
      type: "variable",
      showLabel: "当前用户 / 手机号码",
    },
    {
      id: "10105",
      parentId: "10000",
      label: "性别",
      value: 'getCurrentUser("sex")',
      type: "variable",
      showLabel: "当前用户 / 性别",
    },
    {
      id: "10107",
      parentId: "10000",
      label: "角色",
      value: "roleVariable",
      selectable: false,
      children: [
        {
          id: "10108",
          parentId: "10107",
          label: "ID",
          value: 'getUserRole("id")',
          type: "variable",
          showLabel: "当前用户 / 角色 / ID",
        },
        {
          id: "10110",
          parentId: "10107",
          label: "名称",
          value: 'getUserRole("name")',
          type: "variable",
          showLabel: "当前用户 / 角色 / 名称",
        },
      ],
    },
    {
      id: "15000",
      parentId: "10000",
      label: "部门",
      value: "deptVariable",
      selectable: false,
      children: [
        {
          id: "15001",
          parentId: "15000",
          label: "ID",
          value: 'getUserDept("id")',
          type: "variable",
          showLabel: "当前用户 / 部门 / ID",
        },

        {
          id: "15002",
          parentId: "15000",
          label: "名称",
          value: 'getUserDept("name")',
          type: "variable",
          showLabel: "当前用户 / 部门 / 名称",
        },
        {
          id: "15003",
          parentId: "15000",
          label: "是否负责人",
          value: 'getCurrentUser("isLeader")',
          type: "variable",
          showLabel: "当前用户 / 部门 / 是否负责人",
        },

      ],
    },
    {
      id: "16000",
      parentId: "10000",
      label: "主要部门",
      value: "mainDeptVariable",
      selectable: false,
      children: [
        {
          id: "16001",
          parentId: "16000",
          label: "ID",
          value: 'getUserMainDept("id")',
          type: "variable",
          showLabel: "当前用户 / 主要部门 / ID",
        },
        {
          id: "16002",
          parentId: "16000",
          label: "名称",
          value: 'getUserMainDept("name")',
          type: "variable",
          showLabel: "当前用户 / 主要部门 / 名称",
        },
        {
          id: "16003",
          parentId: "16000",
          label: "是否负责人",
          value: 'getCurrentUser("isMainLeader")',
          type: "variable",
          showLabel: "当前用户 / 主要部门 / 是否负责人",
        },
        {
          id: "16004",
          parentId: "16000",
          label: "部门全路径",
          value: 'getUserDeptPath()',
          type: "variable",
          showLabel: "当前用户 / 主要部门 / 部门全路径",
        },
        {
          id: "16005",
          parentId: "16000",
          label: "部门层级",
          value: 'getUserDeptLevel()',
          type: "variable",
          showLabel: "当前用户 / 主要部门 / 部门层级",
        },
      ],
    },
    {
      id: "17000",
      parentId: "10000",
      label: "兼任部门",
      value: "partDeptVariable",
      selectable: false,
      children: [
        {
          id: "17001",
          parentId: "17000",
          label: "ID",
          value: 'getUserPartDept("id")',
          type: "variable",
          showLabel: "当前用户 / 兼任部门 / ID",
        },
        {
          id: "17002",
          parentId: "17000",
          label: "名称",
          value: 'getUserPartDept("name")',
          type: "variable",
          showLabel: "当前用户 / 兼任部门 / 名称",
        },
        {
          id: "17003",
          parentId: "17000",
          label: "是否负责人",
          value: 'getCurrentUser("isPartLeader")',
          type: "variable",
          showLabel: "当前用户 / 兼任部门 / 是否负责人",
        },
        // {
        //   id: "17004",
        //   parentId: "17000",
        //   label: "部门全路径",
        //   value: 'getUserPartDept("deptPath")',
        //   type: "variable",
        //   showLabel: "当前用户 / 兼任部门 / 部门全路径",
        // },
        // {
        //   id: "17005",
        //   parentId: "17000",
        //   label: "部门层级",
        //   value: 'getUserPartDept("deptLevel")',
        //   type: "variable",
        //   showLabel: "当前用户 / 兼任部门 / 部门层级",
        // },
      ],
    },

    {
      id: "20000",
      parentId: "10000",
      label: "职位",
      value: "postVariable",
      selectable: false,
      children: [
        {
          id: "20001",
          parentId: "20000",
          label: "ID",
          value: 'getCurrentPost("id")',
          type: "variable",
          showLabel: "当前用户 / 职位 / ID",
        },
        {
          id: "20002",
          parentId: "20000",
          label: "名称",
          value: 'getCurrentPost("name")',
          type: "variable",
          showLabel: "当前用户 / 职位 / 名称",
        },
      ],
    },
    {
      id: "21000",
      parentId: "10000",
      label: "主要职位",
      value: "mainPostVariable",
      selectable: false,
      children: [
        {
          id: "21001",
          parentId: "20000",
          label: "ID",
          value: 'getCurrentMainPost("id")',
          type: "variable",
          showLabel: "当前用户 / 主要职位 / ID",
        },
        {
          id: "22001",
          parentId: "20000",
          label: "名称",
          value: 'getCurrentMainPost("name")',
          type: "variable",
          showLabel: "当前用户 / 主要职位 / 名称",
        },
      ],
    },
    {
      id: "22000",
      parentId: "10000",
      label: "兼任职位",
      value: "partPostVariable",
      selectable: false,
      children: [
        {
          id: "22001",
          parentId: "22000",
          label: "兼任职位ID",
          value: 'getCurrentPartPost("ID")',
          type: "variable",
          showLabel: "当前用户 / 兼任职位 / ID",
        },
        {
          id: "22002",
          parentId: "22000",
          label: "兼任职位名称",
          value: 'getCurrentPartPost("name")',
          type: "variable",
          showLabel: "当前用户 / 兼任职位 / 名称",
        },
      ],
    },
  ],
};

export function flatVariableToMap(tree: Array<ExpressionVariable>) {
  const flatData = new Map<string, ExpressionVariable>();
  function traverse(nodes: Array<ExpressionVariable>) {
    nodes.forEach((node) => {
      flatData.set(node.id, node);
      if (node.children) {
        traverse(node.children);
      }
    });
  }

  traverse(tree);
  return flatData;
}

export function findParentNode(
  flatVariableMap: Map<string, ExpressionVariable>,
  parentId: string,
  parentNodes: Array<ExpressionVariable>,
) {
  const parent = flatVariableMap.get(parentId);
  if (parent) {
    parentNodes.push(parent);

    findParentNode(flatVariableMap, parent.parentId, parentNodes);
  }
}

export function register(parser: Parser) {
  parser.functions.getCurrentUser = getCurrentUser;
  parser.functions.getUserRole = getUserRole;
  parser.functions.getUserDept = getUserDept;
  parser.functions.getUserMainDept = getUserMainDept;
  parser.functions.getUserPartDept = getUserPartDept;
  parser.functions.getUserDeptLevel = getUserDeptLevel;
  parser.functions.getUserDeptPath = getUserDeptPath;
  parser.functions.getUserPost = getUserPost;
  parser.functions.getUserMainPost = getUserMainPost;
  parser.functions.getUserPartPost = getUserPartPost;
}
