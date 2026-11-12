import { Parser } from "expr-eval";
import { nanoid } from "nanoid";
import { v4 as uuid } from "uuid";
// import { ExpressionFunc } from '../formula';
interface ExpressionFunc {
  label: string;
  value?: string;
  selectable?: boolean;
  desc?: string;
  type?: string;
  children?: Array<ExpressionFunc>;
}

function generateUUid() {
  return uuid();
}

function generateNanoid(size?: number) {
  return nanoid(size);
}

export const randomFunc: ExpressionFunc = {
  label: "随机函数",
  value: "randomFunc",
  selectable: false,
  children: [
    {
      label: "uuid",
      value: "generateUuid()",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>生成uuid </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>generateUuid()</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>uuid</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>cb8fb521-f6cf-4f7d-9286-53dab493e86b</span> </div>" +
        "</div>",
    },
    {
      label: "nanoid",
      value: "generateNanoid()",
      type: "func",
      desc:
        "<div class='func-box'>" +
        "<div class='func-describe'> <span class='title'>说明:</span> <span class='context'>获取nanoid </span></div>" +
        "<div class='func-use'> <span class='title'>用法:</span> <span class='context'>generateNanoid()</span> </div>" +
        "<div class='func-result'> <span class='title'>返回:</span> <span class='context'>nanoid</span> </div>" +
        "<div class='func-example'> <span class='title'>示列:</span> <span class='context'>mjWnlBn5AbR9UduDf2j0J</span> </div>" +
        "</div>",
    },
  ],
};

export function register(parser: Parser) {
  parser.functions.generateUuid = generateUUid;
  parser.functions.generateNanoid = generateNanoid;
}
