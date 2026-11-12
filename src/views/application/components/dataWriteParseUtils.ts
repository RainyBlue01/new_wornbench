import type { DataWriteOutputParam } from '@/api/dataWrite/index';

export type ClassifyType = 'any' | 'object' | 'array';

export interface FieldOption {
  field: string;
  name: string;
}

export interface ParseRow extends DataWriteOutputParam {
  _key: string;
  parentField?: string;
  classify?: ClassifyType;
  children?: ParseRow[];
}

let rowKeySeed = 0;
export const nextRowKey = () => `row-${++rowKeySeed}`;

export const resetRowKeySeed = () => {
  rowKeySeed = 0;
};

export const createEmptyParseRow = (parentField?: string): ParseRow => ({
  _key: nextRowKey(),
  field: '',
  name: '',
  path: '',
  classify: 'any',
  ...(parentField ? { parentField } : {}),
});

export const mapFieldConfigToRows = (
  items?: DataWriteOutputParam[],
  parentField?: string,
): ParseRow[] => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const row: ParseRow = {
      ...item,
      _key: nextRowKey(),
      classify: (item.classify as ClassifyType) || 'any',
      ...(parentField ? { parentField } : {}),
    };
    if (Array.isArray(item.children) && item.children.length) {
      row.children = mapFieldConfigToRows(item.children, item.field);
    }
    return row;
  });
};

const serializeRow = (row: ParseRow): DataWriteOutputParam | null => {
  const field = row.field?.trim();
  const path = row.path?.trim();
  const classify = row.classify || 'any';

  if (!field && !path && classify === 'any' && !row.children?.length) {
    return null;
  }

  const payload: DataWriteOutputParam = {
    field,
    name: row.name,
    path,
    classify,
  };

  if (classify === 'object' || classify === 'array') {
    const children = (row.children ?? [])
      .map(serializeRow)
      .filter((item): item is DataWriteOutputParam => item != null);
    if (children.length) {
      payload.children = children;
    }
  }

  return payload;
};

export const serializeFieldConfig = (rows: ParseRow[]): DataWriteOutputParam[] =>
  rows.map(serializeRow).filter((item): item is DataWriteOutputParam => item != null);

const validateRow = (row: ParseRow, label: string): string | null => {
  const field = row.field?.trim();
  const path = row.path?.trim();
  const classify = row.classify || 'any';

  if (classify === 'any') {
    if ((field && !path) || (!field && path)) {
      return `${label}：字段与 JSON PATH 需同时填写`;
    }
    return null;
  }

  if (!field) {
    return `${label}：对象/列表类型需选择表单字段`;
  }

  if (row.children?.length) {
    for (const child of row.children) {
      const childError = validateRow(child, label);
      if (childError) return childError;
    }
  }

  return null;
};

export const validateParseTree = (rows: ParseRow[], label: string): string | null => {
  for (const row of rows) {
    const error = validateRow(row, label);
    if (error) return error;
  }
  return null;
};

export const countParseConditions = (rows?: DataWriteOutputParam[]): number => {
  if (!Array.isArray(rows)) return 0;
  let count = 0;
  const walk = (items: DataWriteOutputParam[]) => {
    items.forEach((item) => {
      count += 1;
      if (item.children?.length) walk(item.children);
    });
  };
  walk(rows);
  return count;
};

export const buildTopFieldOptions = (formList: any[]): FieldOption[] => {
  const result: FieldOption[] = [];
  if (!Array.isArray(formList)) return result;
  formList.forEach((item) => {
    if (item?.props?.field) {
      result.push({ field: item.props.field, name: item.title || item.props.field });
    }
  });
  return result;
};

export const getChildFieldOptions = (formList: any[], parentField: string): FieldOption[] => {
  if (!Array.isArray(formList) || !parentField) return [];
  const parent = formList.find((item) => item?.props?.field === parentField);
  if (parent?.type !== 'SUBFORM' || !Array.isArray(parent.children)) return [];
  return parent.children
    .filter((child: any) => child?.props?.field)
    .map((child: any) => ({
      field: child.props.field,
      name: child.title || child.props.field,
    }));
};
