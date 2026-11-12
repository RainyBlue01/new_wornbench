import { Parser } from "expr-eval";

interface ExpressionFunc {
  label: string;
  value?: string;
  selectable?: boolean;
  desc?: string;
  type?: string;
  children?: Array<ExpressionFunc>;
}

async function toStr(arg: any) {
  const value = await arg;

  if (value === null || value === undefined) {
    return "null";
  }

  if (value instanceof Date) {
    return value.toLocaleString() || value.toString();
  }

  if (Array.isArray(value)) {
    const arrStr = value.map((item) => item).join(",");
    return `${arrStr}`;
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      return value.toString();
    }
  }

  return String(value);
}

async function eqStr(arg: string, arg1: string) {
  const realArg = await arg;
  const realArg1 = await arg1;
  return realArg === realArg1;
}

async function concatStr(...args: any[]) {
  return (await Promise.all(args)).map(String).join("");
}

async function splitStr(arg: string, arg1: string) {
  const realArg = await arg;
  const realArg1 = await arg1;
  if (realArg && realArg1) {
    return realArg.split(realArg1);
  }
  return [];
}

export const stringFunc: ExpressionFunc = {
  label: "字符串函数",
  value: "stringFunc",
  selectable: false,
  children: [
    {
      label: "转换",
      value: "toStr('参数')",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>转换为字符串 </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>toStr('参数')</span> </div>" +
        "<div class='func-arg'> <span class='title'>参数:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>字符串</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>toStr(['张三','李四'])</span> </div>" +
        "</div>",
    },
    {
      label: "等于",
      value: "eqStr('字符串','字符串1')",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>字符串比较 </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>eqStr('字符串','字符串1')</span> </div>" +
        "<div class='func-arg'> <span class='title'>字符串:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-arg'> <span class='title'>字符串1:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>真/假</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>eqStr('张三','张三')</span> </div>" +
        "</div>",
    },
    {
      label: "拼接",
      value: "concatStr('字符串','字符串1')",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>拼接多个字符串 </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>concatStr('字符串','字符串1')</span> </div>" +
        "<div class='func-arg'> <span class='title'>字符串:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-arg'> <span class='title'>字符串1:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>拼接字符串</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>concatStr('我','你')</span> </div>" +
        "</div>",
    },
    {
      label: "拆分",
      value: "splitStr('字符串','分隔符')",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>将字符串拆分为数组 </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>splitStr('字符串','分隔符')</span> </div>" +
        "<div class='func-arg'> <span class='title'>字符串:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-arg'> <span class='title'>分隔符:</span> <span class='context'>固定值</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>数组</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>splitStr('1,2,3',',')</span> </div>" +
        "</div>",
    },
  ],
};

export function register(parser: Parser) {
  parser.functions.toStr = toStr;
  parser.functions.eqStr = eqStr;
  parser.functions.concatStr = concatStr;
  parser.functions.splitStr = splitStr;
}
