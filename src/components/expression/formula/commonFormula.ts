import { Parser } from "expr-eval";

interface ExpressionFunc {
  label: string;
  value?: string;
  selectable?: boolean;
  desc?: string;
  type?: string;
  children?: Array<ExpressionFunc>;
}

async function isNull(arg: any) {
  console.log(arg);
  const realArg = await arg;
  return (
    realArg == undefined ||
    realArg == null ||
    realArg === "" ||
    realArg.length === 0
  );
}

async function isNotNull(arg: any) {
  const res = await isNull(arg);
  return !res;
}

async function match(condition: any, trueValue: any, falseValue: any) {
  const resolvedCondition = await condition;
  let isTrue = Boolean(resolvedCondition);

  // 公式编辑器中的条件通常以字符串传入，例如：match('1==1', '真', '假')。
  // 非空字符串直接转为 Boolean 会始终为 true，因此需要先按表达式求值。
  if (typeof resolvedCondition === "string" && resolvedCondition.trim()) {
    try {
      isTrue = Boolean(Parser.evaluate(resolvedCondition));
    } catch {
      // 普通文本不是合法表达式时，仍按固定值的真假性处理。
      isTrue = Boolean(resolvedCondition);
    }
  }

  return isTrue ? await trueValue : await falseValue;
}

async function matchAll(...conditions: any[]) {
  for (const condition of conditions) {
    const resolvedCondition = await condition;
    let isTrue = Boolean(resolvedCondition);

    if (typeof resolvedCondition === "string" && resolvedCondition.trim()) {
      try {
        isTrue = Boolean(Parser.evaluate(resolvedCondition));
      } catch {
        isTrue = Boolean(resolvedCondition);
      }
    }

    if (!isTrue) {
      return false;
    }
  }
  return true;
}

async function matchAny(...conditions: any[]) {
  for (const condition of conditions) {
    const resolvedCondition = await condition;
    let isTrue = Boolean(resolvedCondition);

    if (typeof resolvedCondition === "string" && resolvedCondition.trim()) {
      try {
        isTrue = Boolean(Parser.evaluate(resolvedCondition));
      } catch {
        isTrue = Boolean(resolvedCondition);
      }
    }

    if (isTrue) {
      return true;
    }
  }
  return false;
}

export const commonFunc: ExpressionFunc = {
  label: "公共函数",
  value: "commonFunc",
  selectable: false,
  children: [
    {
      label: "为空判断",
      value: "isNull('参数')",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>判断参数是否为空 </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>isNull('参数')</span> </div>" +
        "<div class='func-arg'> <span class='title'>参数:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>真/假</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>isNull('1')</span> </div>" +
        "</div>",
    },
    {
      label: "非空判断",
      value: "isNotNull('参数')",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>判断参数是否不为空 </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>isNotNull('参数')</span> </div>" +
        "<div class='func-arg'> <span class='title'>参数:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>真/假</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>isNotNull('1')</span> </div>" +
        "</div>",
    },
    {
      label: "匹配返回",
      value: "match('条件','真返回','假返回')",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>匹配条件返回</span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>match('条件','真返回','假返回')</span> </div>" +
        "<div class='func-arg'> <span class='title'>条件:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-arg'> <span class='title'>真返回:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-arg'> <span class='title'>假返回:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>真返回/假返回</span> </div>" +
        "<div class='func-example'> <span class='title'>示例:</span> <span class='context'>match('1==1','真','假')</span> </div>" +
        "</div>",
    },
    {
      label: "全满足",
      value: "matchAll('条件')",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>所有条件都满足</span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>matchAll('条件1')</span> </div>" +
        "<div class='func-arg'> <span class='title'>条件:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-arg'> <span class='title'>返回:</span> <span class='context'>真/假</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>matchAll('1==1','2==2')</span> </div>" +
        "</div>",
    },
    {
      label: "任意满足",
      value: "matchAny('条件')",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>任意条件都满足</span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>matchAny('条件1')</span> </div>" +
        "<div class='func-arg'> <span class='title'>条件:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-arg'> <span class='title'>返回:</span> <span class='context'>真/假</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>matchAny('1==1','2==2')</span> </div>" +
        "</div>",
    },
  ],
};

export function register(parser: Parser) {
  parser.functions.isNull = isNull;
  parser.functions.isNotNull = isNotNull;
  parser.functions.match = match;
  parser.functions.matchAll = matchAll;
  parser.functions.matchAny = matchAny;
}
