import { Parser } from "expr-eval";
import { getUserDeptLeader as getUserDeptLeaderApi } from "../../../api/login/index";
interface ExpressionFunc {
  label: string;
  value?: string;
  selectable?: boolean;
  desc?: string;
  type?: string;
  children?: Array<ExpressionFunc>;
}

let userDeptLeaderPromise: Promise<any[]> | null = null;
let userDeptLeaderCache: any[] | null = null;

function loadUserDeptLeader() {
  if (userDeptLeaderCache) return Promise.resolve(userDeptLeaderCache);
  if (userDeptLeaderPromise) return userDeptLeaderPromise;

  userDeptLeaderPromise = getUserDeptLeaderApi()
    .then((res) => {
      userDeptLeaderCache = Array.isArray(res) ? res : [];
      return userDeptLeaderCache;
    })
    .finally(() => {
      userDeptLeaderPromise = null;
    });
  return userDeptLeaderPromise;
}

function getUserDeptLeader(attribute: String = "nickname") {
  return loadUserDeptLeader().then((res) => {
    switch (attribute) {
      case "id":
        return res.map((item: any) => item.id).join(",");
      case "username":
        return res.map((item: any) => item.username).join(",");
      case "nickname":
        return res.map((item: any) => item.nickname).join(",");
      default:
        return "";
    }
  });
}

export const businessFunc: ExpressionFunc = {
  label: "业务函数",
  value: "businessFunc",
  selectable: false,
  children: [
    {
      label: "部门负责人",
      value: "getUserDeptLeader()",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>获取当前用户部门负责人 </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>getUserDeptLeader()</span> </div>" +
        "<div class='func-use'> <span class='title'>用法1:</span> <span class='context'>getUserDeptLeader('属性')</span> </div>" +
        "<div class='func-arg'> <span class='title'>属性:</span> <span class='context'>id(唯一键)、username(账号)、nickname(昵称)</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>唯一键、账号、昵称</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>getUserDeptLeader('nickname')</span> </div>" +
        "</div>",
    },
  ],
};

export function register(parser: Parser) {
  parser.functions.getUserDeptLeader = getUserDeptLeader;
}
