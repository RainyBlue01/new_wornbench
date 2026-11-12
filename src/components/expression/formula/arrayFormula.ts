import { Parser } from "expr-eval";

interface ExpressionFunc {
  label: string;
  value?: string;
  selectable?: boolean;
  desc?: string;
  type?: string;
  children?: Array<ExpressionFunc>;
}

async function includeAny(array: any, args: any) {
  const realArray = toArray(await array);
  const realTargetArr = toArray(await args);
  if (realArray.length === 0 || realTargetArr.length === 0) {
    return false;
  }
  return realTargetArr.some((target: any) => realArray.includes(target));
}

async function includeAll(array: any, args: any) {
  const realArray = toArray(await array);
  const realTargetArr = toArray(await args);
  if (realArray.length === 0 || realTargetArr.length === 0) {
    return false;
  }
  return realTargetArr.every((target: any) => realArray.includes(target));
}

export const arrayFunc: ExpressionFunc = {
  label: "数组函数",
  value: "arrayFunc",
  selectable: false,
  children: [
    {
      label: "包含任一",
      value: "includeAny('数组','匹配值')",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>判断是否包含某个元素 </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>includeAny('数组','匹配值')</span> </div>" +
        "<div class='func-arg'> <span class='title'>数组:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-arg'> <span class='title'>匹配值:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>真/假</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>includeAny(['苹果','香蕉','西瓜'],['苹果'])</span> </div>" +
        "</div>",
    },
    {
      label: "包含全部",
      value: "includeAll('数组','匹配值')",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>判断是否包含所有元素 </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>includeAll('数组','匹配值')</span> </div>" +
        "<div class='func-arg'> <span class='title'>数组:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-arg'> <span class='title'>匹配值:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>真/假</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>includeAll(['苹果','香蕉','西瓜'],['苹果'])</span> </div>" +
        "</div>",
    },
  ],
};

export function register(parser: Parser) {
  parser.functions.includeAny = includeAny;
  parser.functions.includeAll = includeAll;
}

function toArray(value: any) {
  if (value == null) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  if (
    typeof value === "object" &&
    "length" in value &&
    !Object.prototype.hasOwnProperty.call(value, "__proto__")
  ) {
    return Array.from(value);
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      return value.split(",").map((item) => item.trim());
    }
  }
  return [value];
}
