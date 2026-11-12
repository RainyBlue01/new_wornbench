import { Parser } from "expr-eval";
import { Message } from "@arco-design/web-vue";
import { getFormById } from "../../utils/form/storage";
import { useReferenceStore } from "../../store/modules/reference";

import { register as userFormulaRegister } from "./formula/userFormula";
import { register as dateFormulaRegister } from "./formula/dateFormula";
import { register as randomFormulaRegister } from "./formula/randomFormula";
import { register as commonFormulaRegister } from "./formula/commonFormula";
import { register as stringFormulaRegister } from "./formula/stringFormula";
import { register as arrayFormulaRegister } from "./formula/arrayFormula";
import { register as moneyFormulaRegister } from "./formula/moneyFormula";
import { register as businessFormulaRegister } from "./formula/businessFormula";
import { toRaw } from "vue";

/**
 * 递归查找字段配置（支持布局容器内的嵌套字段）
 */
const findFieldById = (list: any[], fieldId: string): any => {
  if (!Array.isArray(list)) return null;
  for (const item of list) {
    if (item.id === fieldId) return item;
    // 递归查找非子表单的 children（如 COL、ROW 布局容器内的字段）
    if (item.children && item.type !== "SUBFORM") {
      const found = findFieldById(item.children, fieldId);
      if (found) return found;
    }
  }
  return null;
};

/**
 * 翻译字段值：根据字段类型，将原始值翻译为可读的名称或格式化后的值
 * 参考 form.ts setUpDateData 中各个类型的数据结构
 */
const translateFieldValue = (field: any, value: any): any => {
  const referenceStore = useReferenceStore();

  if (value === null || value === undefined || value === "") {
    return value;
  }

  switch (field.type) {
    case "USER":
      // 单个用户选择 → 返回用户名称
      // props.value 结构: [{id, name, userName, ...}]
      if (Array.isArray(value) && value.length > 0) {
        const firstItem = value[0];
        const userId = String(firstItem.id || firstItem.userId || firstItem);
        const user = referenceStore.getUser(userId);
        if (user) {
          return user.name || user.userName || firstItem.name || "";
        }
        // 缓存未命中时，直接从数组项中取名称
        return firstItem.name || firstItem.userName || String(firstItem);
      }
      return value;

    case "DEPT":
      // 单个部门选择 → 返回部门名称
      // props.value 结构: [{id, name, label, deptName, ...}]
      if (Array.isArray(value) && value.length > 0) {
        const firstItem = value[0];
        const deptId = String(firstItem.id || firstItem.deptId || firstItem);
        const dept = referenceStore.getDept(deptId);
        if (dept) {
          return dept.name || dept.label || dept.deptName || firstItem.name || "";
        }
        // 缓存未命中时，直接从数组项中取名称
        return firstItem.name || firstItem.label || firstItem.deptName || String(firstItem);
      }
      return value;

    case "USER_MULTIPLE":
      // 多个用户选择 → 返回用户名称数组
      // props.value 结构: [{id, name, userName, ...}, ...]
      if (Array.isArray(value)) {
        return value
          .map((item: any) => {
            const userId = String(item.id || item.userId || item);
            const user = referenceStore.getUser(userId);
            if (user) {
              return user.name || user.userName || item.name || "";
            }
            return item.name || item.userName || String(item);
          })
          .filter((v: any) => v !== "");
      }
      return value;

    case "DEPT_MULTIPLE":
      // 多个部门选择 → 返回部门名称数组
      // props.value 结构: [{id, name, label, deptName, ...}, ...]
      if (Array.isArray(value)) {
        return value
          .map((item: any) => {
            const deptId = String(item.id || item.deptId || item);
            const dept = referenceStore.getDept(deptId);
            if (dept) {
              return dept.name || dept.label || dept.deptName || item.name || "";
            }
            return item.name || item.label || item.deptName || String(item);
          })
          .filter((v: any) => v !== "");
      }
      return value;

    case "SELECT":
    case "RADIO":
      // 单选下拉、单选框 → 翻译 option value 为 label
      if (field.props?.options) {
        const option = field.props.options.find(
          (opt: any) => String(opt.value) === String(value)
        );
        return option ? option.label : value;
      }
      return value;

    case "SELECT_MULTIPLE":
    case "CHECKBOX":
      // 多选下拉、多选框 → 翻译 option value 数组为 label 数组
      {
        const options = field.props?.options || [];
        if (Array.isArray(value)) {
          return value.map((v: any) => {
            const option = options.find(
              (opt: any) => String(opt.value) === String(v)
            );
            return option ? option.label : v;
          });
        } else if (typeof value === "string" && value.includes(",")) {
          return value.split(",").map((v: any) => {
            const option = options.find(
              (opt: any) => String(opt.value) === String(v.trim())
            );
            return option ? option.label : v.trim();
          });
        }
        return value;
      }

    case "DATE":
      // 日期 → 值已由 setUpDateData 格式化为 "YYYY-MM-DD HH:mm:ss"
      return value;

    case "DATE_INTERVAL":
      // 日期区间 → 返回 {start, end} 格式
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return {
          start: value.start || "",
          end: value.end || "",
        };
      }
      return value;

    case "TIME":
      // 时间 → 值已由 setUpDateData 格式化为 "HH:mm:ss"
      return value;

    case "TIME_INTERVAL":
      // 时间区间 → 返回 {start, end} 格式
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return {
          start: value.start || "",
          end: value.end || "",
        };
      }
      return value;

    default:
      return value;
  }
};

const parser = new Parser();

userFormulaRegister(parser);
dateFormulaRegister(parser);
randomFormulaRegister(parser);
commonFormulaRegister(parser);
stringFormulaRegister(parser);
arrayFormulaRegister(parser);
moneyFormulaRegister(parser);
businessFormulaRegister(parser);

//获取表单值
parser.functions.getFormValue = (formId: string, fieldId: string) => {
  const formConfig = getFormById(formId);
  if (!formConfig || !formConfig.formList) return "";

  const field = findFieldById(formConfig.formList, fieldId);
  if (!field) return "";

  const value = field.props?.value;

  // 始终调用 translateFieldValue，根据字段类型翻译值（0/false 等有效值不会被跳过）
  return translateFieldValue(field, value) ?? "";
};

//获取子表单值
parser.functions.getSubFormValue = (
  formId: string,
  subFormId: string,
  fieldId: string,
) => {
  const formConfig = getFormById(formId);
  if (!formConfig || !formConfig.formList) return "";

  const subForm = formConfig.formList.find(
    (item: any) => item.id === subFormId,
  );
  if (!subForm) return "";

  const subFormDataList = subForm.list;
  if (!subFormDataList || !Array.isArray(subFormDataList)) return "";

  // 递归查找目标字段的配置（子表单 children 内的字段）
  const targetFieldConfig = findFieldById(subForm.children || [], fieldId);

  const fieldValues: any[] = [];
  subFormDataList.forEach((rowData: any[]) => {
    if (!Array.isArray(rowData)) return;
    rowData.forEach((item: any) => {
      // 子表单行数据中的 field 属性存储的是原始字段 ID
      if (item.field === fieldId) {
        const value = item.props?.value;
        // 根据字段配置翻译值
        const translated = targetFieldConfig
          ? translateFieldValue(targetFieldConfig, value)
          : value;
        fieldValues.push(translated);
      }
    });
  });
  return fieldValues.length > 0 ? fieldValues : "";
};

export interface ExpressionVariable {
  id: string;
  parentId: string;
  label: string;
  value?: string;
  selectable?: boolean;
  type?: string;
  children?: Array<ExpressionVariable>;
}

export interface ExpressionFunc {
  label: string;
  value?: string;
  selectable?: boolean;
  desc?: string;
  type?: string;
  children?: Array<ExpressionFunc>;
}

export function calculate(expression: string) {
  try {
    let rawExpression = toRaw(expression);
    rawExpression = rawExpression.replace(/@#|#@/g, "");
    // console.log("执行公式", rawExpression);
    const parsedExpr = parser.parse(rawExpression);
    return parsedExpr.evaluate();
  } catch (e: any) {
    Message.error("表达式解析错误");
    console.error("表达式解析错误" + e);
  }
}
