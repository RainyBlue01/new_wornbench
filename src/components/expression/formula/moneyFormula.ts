import { Parser } from "expr-eval";

interface ExpressionFunc {
  label: string;
  value?: string;
  selectable?: boolean;
  desc?: string;
  type?: string;
  children?: Array<ExpressionFunc>;
}

const digit = [
  "零",
  "壹",
  "贰",
  "叁",
  "肆",
  "伍",
  "陆",
  "柒",
  "捌",
  "玖",
] as const;
const units = [
  "",
  "拾",
  "佰",
  "仟",
  "万",
  "拾",
  "佰",
  "仟",
  "亿",
  "拾",
  "佰",
  "仟",
] as const;

async function toChinese(arg: any) {
  const realArg = await arg;
  // 1. 边界值处理
  if (isNaN(realArg) || realArg < 0 || realArg > 999999999999.99) {
    return "无效金额";
  }
  const [intStr = "0", decStr = "00"] = Number(realArg).toFixed(2).split(".");

  // 处理整数部分
  let intChinese = "";
  let needZero = false;
  for (let i = 0; i < intStr.length; i++) {
    const n = +intStr[i];
    const pos = intStr.length - 1 - i;
    if (n) {
      if (needZero) intChinese += "零";
      intChinese += digit[n] + units[pos];
      needZero = false;
    } else {
      needZero = pos % 4 !== 0 && intChinese; // 非万/亿位且已有内容才标记补零
    }
  }
  // 整数收尾（空则补零，加“元”）
  intChinese = intChinese || "零";
  intChinese += "元";

  // 处理小数部分（角、分）
  const jiao = +decStr[0],
    fen = +decStr[1];
  let decChinese = jiao ? digit[jiao] + "角" : "";
  decChinese += fen
    ? digit[fen] + "分"
    : jiao || intChinese === "零元"
      ? ""
      : "整";
  if (!jiao && fen) decChinese = "零" + decChinese; // 角零分非零补零

  // 最终优化（合并多余零、修正单位）
  const result = (intChinese + decChinese)
    .replace(/零+([万|亿])/g, "$1")
    .replace(/零+/g, "零")
    .replace(/零元/, "零元")
    .replace(/零整/, "整");
  return result;
}

async function sum(...args: (number | string | number[] | string[])[]) {
  const flatNumbers = args.flat().map((item) => {
    const num = typeof item === "string" ? Number(item) : item;
    return Number.isNaN(num) ? 0 : num;
  });

  const maxDecimalPlaces = flatNumbers.reduce((max, item) => {
    const value = String(item).toLowerCase();
    const [coefficient, exponentText] = value.split("e");
    const decimalPlaces = coefficient.includes(".")
      ? coefficient.length - coefficient.indexOf(".") - 1
      : 0;
    const exponent = exponentText ? Number(exponentText) : 0;
    return Math.max(max, Math.max(0, decimalPlaces - exponent));
  }, 0);
  const scale = 10 ** maxDecimalPlaces;

  const integerTotal = flatNumbers.reduce(
    (total, curr) => total + Math.round(curr * scale),
    0,
  );
  return integerTotal / scale;
}

async function avg(...args: (number | string | number[] | string[])[]) {

  const flatNumbers = args.flat().map(item => {
    const num = typeof item === 'string' ? Number(item) : item;
    return Number.isNaN(num) ? null : num; // 无效值标记为 null
  }).filter(item => item !== null); // 过滤无效值

  // 空数组返回 0（也可改为返回 NaN，根据业务需求调整）
  if (flatNumbers.length === 0) return 0;

  // 计算平均值 = 总和 / 有效数字个数
  const total = flatNumbers.reduce((total, curr) => total + curr, 0);
  return total / flatNumbers.length;
}

async function toNumber(arg: any) {
  const realArg = await arg;
  try {
    const num = Number(realArg);
    if (Number.isNaN(num)) {
      return 0;
    }
    return num.toFixed(2);
  } catch (e) {
    console.error('操作失败:', e);

  }
  return 0;
}

export const moneyFunc: ExpressionFunc = {
  label: "财务函数",
  value: "moneyFunc",
  selectable: false,
  children: [
    {
      label: "金额大写",
      value: "toChinese('数字')",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>数字转中文 </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>toChinese('数字')</span> </div>" +
        "<div class='func-arg'> <span class='title'>数字:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>大写金额</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>toChinese('300.25')</span> </div>" +
        "</div>",
    },
    {
      label: "相加",
      value: "sum('数字','数字')",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>多个数字求和,支持数字、字符串、数组 </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>sum('数字','数字')</span> </div>" +
        "<div class='func-arg'> <span class='title'>数字:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>数字</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>sum('1','2')</span> </div>" +
        "</div>",
    },
    {
      label: "平均值",
      value: "avg('数字','数字')",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>多个数字求平均值,支持数字、字符串、数组 </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>avg('数字','数字')</span> </div>" +
        "<div class='func-arg'> <span class='title'>数字:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>数字</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>avg('1','2')</span> </div>" +
        "</div>",
    },
    {
      label: "转数字",
      value: "toNumber('字符串')",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>字符串转数字 </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>toNumber('数字')</span> </div>" +
        "<div class='func-arg'> <span class='title'>字符串:</span> <span class='context'>固定值或变量</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>数字</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>toNumber('300.25')</span> </div>" +
        "</div>",
    },
  ],
};

export function register(parser: Parser) {
  parser.functions.toChinese = toChinese;
  parser.functions.sum = sum;
  parser.functions.avg = avg;
  parser.functions.toNumber = toNumber;
}
