import { toFrontendDateFormat } from './dateFormats'
import { validateJsonSchemaModel } from '@/utils/jsonSchemaValidate'


const isEmptyJsonSchemaValue = (value: any) => {
  if (value === undefined || value === null || value === '') return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

const buildJsonSchemaRules = (field: any) => {
  const validationConfig = field.props?.validationConfig || {};
  const rules: any[] = [];
  if (field.props?.required) {
    rules.push({
      required: true,
      validator: (value: any, cb: any) => {
        if (isEmptyJsonSchemaValue(value)) cb(validationConfig.requiredMessage || `${field.title}不能为空`);
      },
    });
  }
  if (validationConfig.enableJsonSchema !== false) {
    rules.push({
      validator: (value: any, cb: any) => {
        const result = validateJsonSchemaModel(field.props?.schema, value || {});
        if (!result.valid && result.firstError) cb(result.firstError);
      },
    });
  }
  if (Array.isArray(validationConfig.customRules)) {
    validationConfig.customRules.forEach((rule: any) => {
      if (!rule?.pattern) return;
      rules.push({
        validator: (value: any, cb: any) => {
          const targetValue = rule.field ? value?.[rule.field] : value;
          if (targetValue !== undefined && targetValue !== null && !(new RegExp(rule.pattern).test(String(targetValue)))) {
            cb(rule.message || `${rule.field || field.title}校验不通过`);
          }
        },
      });
    });
  }
  return rules;
};
export function setRules(formList: any, rules: any, val = false) {
  if (!Array.isArray(formList)) {
    return;
  }
  formList.map(
    (v: any) => {
      if (v.type == 'JSON_SCHEMA') {
        const jsonSchemaRules = buildJsonSchemaRules(v);
        if (jsonSchemaRules.length) {
          rules[v.id] = jsonSchemaRules;
        }
      } else if (v.props.required) {
        if (v.type == "DATE_INTERVAL" || v.type == "TIME_INTERVAL" || v.type == "USER" || v.type == "DEPT") {
          rules[v.id] = [
            { type: "object", required: true, message: v.title + "不能为空" },
          ];
        } else if (v.type == "CHECKBOX" || v.type == "SELECT_MULTIPLE" || v.type == "USER_MULTIPLE" || v.type == "DEPT_MULTIPLE") {

          rules[v.id] = [
            { type: "array", required: true, message: v.title + "不能为空" },
          ];
        } else if (v.type == "PHONE") {
          rules[v.id] = [
            { required: true, message: v.title + "不能为空" },
            { max: 11, message: "电话号码不能超过11位" },
            {
              required: true,
              match:
                /^(?:(\d{11})|((\d{5,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})))$/,
              message: "请输入正确的手机号码或者座机号",
            },
          ];
        } else if (v.type == "ID_CARD") {
          rules[v.id] = [
            { required: true, message: v.title + "不能为空" },
            {
              required: true,
              match:
                /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
              message: "身份证格式错误",
            },
          ];
        } else if (v.type == "EMAIL") {
          rules[v.id] = [
            { required: true, message: v.title + "不能为空" },
            { required: true, type: "email", message: "邮箱格式错误" },
          ];
        } else if (v.type == "URL") {
          rules[v.id] = [
            { required: true, message: v.title + "不能为空" },
            { required: true, type: "url", message: "URL格式错误" },
          ];
        } else if (v.type == "ADDRESS") {
          rules[v.id] = [
            { required: true, type: "object", message: v.title + "不能为空" },
            {
              validator: (value, cb) => {
                return new Promise<void>((resolve) => {
                  if (value.prov == "") {
                    cb("省份不能为空");
                  }
                  if (value.city == "") {
                    cb("市不能为空");
                  }
                  if (value.dist == "" && v.props.option !== "prov-city") {
                    cb("区不能为空");
                  }
                  resolve();
                });
              },
            },
          ];
        } else if (v.type == "LOCATION") {
          rules[v.id] = [
            { required: true, type: "object", message: v.title + "不能为空" },
            {
              validator: (value, cb) => {
                return new Promise<void>((resolve) => {
                  if (!value?.address && (!value?.longitude || !value?.latitude)) {
                    cb("当前位置不能为空");
                  }
                  resolve();
                });
              },
            },
          ];
        } else {
          rules[v.id] = [{ required: true, message: v.title + "不能为空" }];
        }
        if ((v.type == "DATE_INTERVAL" || v.type == "DATE") && !val) {
          // console.log(v.props.format)
          v.props.format = toFrontendDateFormat(v.props.format);

        }
      }
      if (v.children) {
        setRules(v.children, rules, val);
      }
      if (v.list) {
        v.list.map(v1 => {
          // console.log(v1)
          setRules(v1, rules, val);
        })
        // setRules(v.list, rules, val);
      }
    },
  );
}
