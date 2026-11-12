import { h, type VNodeChild } from 'vue'
import router from '@/router'
import { buildAttachmentPreviewUrl, getInitialAttachmentUrl, resolveAttachmentUrl } from '@/utils/attachmentUrl'



/** 附件/签名点击：内部文件走预览页，外链或 data URL 直接打开 */
const handleFileClick = async (file: any) => {
  const path = file?.path;
  if (path == null || path === "") return;

  const pathStr = String(path);
  const isDataOrHttp =
    pathStr.startsWith("data:") || /^https?:\/\//i.test(pathStr);
  if (isDataOrHttp) {
    window.open(pathStr, "_blank", "noopener,noreferrer");
    return;
  }

  if (file.type == 1 || file.type == null) {
    const { href } = router.resolve({
      name: "iframePreview",
      query: {
        fileId: pathStr,
        ...(file.fileName ? { fileName: file.fileName } : { fileName: 'signature.png' }),
      },
    });
    window.open(href, "_blank", "noopener,noreferrer");
    return;
  }

  try {
    const fileUrl = await resolveAttachmentUrl(file);
    if (!fileUrl) return;
    const previewUrl = buildAttachmentPreviewUrl(fileUrl, file.fileName || 'file', pathStr);
    const { href } = router.resolve({
      name: "iframePreview",
      query: { url: previewUrl, fileName: file.fileName || 'file' },
    });
    window.open(href, "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error('获取第三方附件地址失败:', error);
  }
};

/** 将单元格里的附件/签名值统一为 { path, fileName, type }[]，避免 string 上调用 .map 报错 */
function normalizeAttachFiles(raw: any): any[] {
  if (raw == null || raw === "") return [];
  if (Array.isArray(raw)) {
    const out: any[] = [];
    for (const item of raw) {
      if (item == null || item === "") continue;
      if (typeof item === "string") {
        out.push({ path: item, fileName: null, type: 1 });
      } else if (typeof item === "object") {
        out.push(item);
      }
    }
    return out;
  }
  if (typeof raw === "string") {
    return [{ path: raw, fileName: null, type: 1 }];
  }
  if (typeof raw === "object") {
    return [raw];
  }
  return [];
}

function getSubFormParentKey(column: any): string | undefined {
  return column?.parentDataIndex ?? column?.parent?.dataIndex;
}

function findOptionLabel(options: any[], value: any) {
  if (!options?.length) return null;
  const opt = options.find(
    (item) => item.value === value || item.key === value || String(item.value) === String(value),
  );
  return opt?.label ?? opt?.text ?? null;
}

function formatSubFormFieldValue(formField: any, value: any): string {
  if (value === null || value === undefined || value === '') return '-';

  const type = formField?.type;
  const options = formField?.props?.options || formField?.props?.optionList || [];

  if (type === 'USER' || type === 'DEPT') {
    if (Array.isArray(value)) {
      return value.map((item) => item?.nickname || item?.label || item?.deptName || item?.name).filter(Boolean).join('、') || '-';
    }
    return String(value);
  }
  if (type === 'SELECT' || type === 'RADIO' || type === 'SWITCH') {
    return findOptionLabel(options, value) ?? String(value);
  }
  if (type === 'SELECT_MULTIPLE' || type === 'CHECKBOX') {
    const values = Array.isArray(value) ? value : String(value).split(',').filter(Boolean);
    return values.map((item) => findOptionLabel(options, item) ?? String(item)).join('、') || '-';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function withSubFormParentColumn(_row: any, column: any) {
  const parentKey = getSubFormParentKey(column);
  if (!parentKey) return column;
  return {
    ...column,
    parentDataIndex: parentKey,
    parent: column.parent ?? { dataIndex: parentKey },
  };
}

function collectFilesFromRow(row: any): any[] {
  const { record, column } = row;
  const parentKey = getSubFormParentKey(column);
  if (parentKey) {
    const subformData = record[parentKey];
    if (!Array.isArray(subformData)) return [];
    const out: any[] = [];
    for (const data of subformData) {
      const v = data?.[column.dataIndex];
      if (v != null && v !== "") {
        out.push(...normalizeAttachFiles(v));
      }
    }
    return out;
  }
  return normalizeAttachFiles(record[column.dataIndex]);
}

const renderingAttach = (row): VNodeChild => {
  const files = collectFilesFromRow(row);

  // 遍历文件数组，为每个文件创建带点击事件的span节点
  const fileNodes = files.map((file: any, index: number) => {
    return h(
      "span",
      {
        onClick: () => handleFileClick(file),
        // 样式优化：可点击样式 + 间距
        style: {
          color: "#165DFF",
          cursor: "pointer",
          display: "block",
          margin: "4px 0",
        },
        // 可选：添加key避免v-for警告
        key: `${file.path}-${index}`,
      },
      file.fileName === null ? "无名称" : file.fileName,
    );
  });
  // 返回文件节点数组（VNodeChild[] 类型）
  return fileNodes.length > 0 ? fileNodes : "";
};

/** 签名：值为文件 id 或附件对象时，用带鉴权的下载地址以图片展示 */
const renderingSignature = (row): VNodeChild => {
  const files = collectFilesFromRow(row);
  if (files.length === 0) return "";

  const imgNodes = files.map((file: any, index: number) => {
    const path = file?.path ?? (typeof file === "string" ? file : "");
    if (!path) return null;

    const isDataOrHttp =
      typeof path === "string" &&
      (path.startsWith("data:") || /^https?:\/\//i.test(path));
    let src = isDataOrHttp ? path : getInitialAttachmentUrl(file);

    if (Number(file?.type) === 2 && !src) {
      void resolveAttachmentUrl(file)
        .then((url) => {
          file.url = url;
        })
        .catch((error) => {
          console.error('获取第三方图片地址失败:', error);
        });
    }

    if (!src) return null;

    const fileForClick =
      typeof file === "object" && file != null && "path" in file
        ? file
        : { path, fileName: null, type: 1 };

    return h("img", {
      key: `signature-${path}-${index}`,
      src,
      alt: "签名",
      title: "点击查看原图",
      style: {
        maxHeight: "64px",
        maxWidth: "100%",
        objectFit: "contain",
        display: "block",
        margin: "4px 0",
        verticalAlign: "middle",
        border: "1px solid #e5e6eb",
        borderRadius: "4px",
        cursor: "pointer",
        background: "#fafafa",
      },
      onClick: () => handleFileClick(fileForClick),
    });
  });

  const filtered = imgNodes.filter(Boolean) as VNodeChild[];
  return filtered.length > 0 ? filtered : "";
};

const renderingSubForm = (row): VNodeChild => {
  const { record, column } = row;
  const parentKey = getSubFormParentKey(column);
  if (!parentKey) return "";

  const attachLikeTypes = ["ATTACH", "PICTURE", "SIGNATURE"];
  if (attachLikeTypes.includes(column.dataType)) {
    const renderFunc = renderMap[column.dataType];
    if (renderFunc) {
      return renderFunc({ record, column: withSubFormParentColumn(row, column) });
    }
  }

  const dataList = record[parentKey] || [];
  if (!Array.isArray(dataList) || dataList.length === 0) {
    return "";
  }

  const formField = column.formField;
  const dataNodes = dataList.map((data: any, index: number) => {
    const value = data?.[column.dataIndex];
    const displayValue = formatSubFormFieldValue(formField, value);

    return h(
      "div",
      {
        key: index,
        style: {
          display: "block",
          marginBottom: index < dataList.length - 1 ? "6px" : "0",
          lineHeight: "1.6",
          whiteSpace: "normal",
          wordBreak: "break-word",
          fontSize: "inherit",
          color: "inherit",
        },
      },
      displayValue,
    );
  });

  return dataNodes.length > 0 ? dataNodes : "";
};

/** 日期间隔：start ~ end */
const renderingDateInterval = ({ record, column }: any): VNodeChild => {
  const raw = record?.[column.dataIndex];
  if (raw == null || raw === "") return "";
  if (typeof raw === "object" && raw.start && raw.end) {
    return `${raw.start} ~ ${raw.end}`;
  }
  return String(raw);
};

/** 时间间隔：start ~ end */
const renderingTimeInterval = ({ record, column }: any): VNodeChild => {
  const raw = record?.[column.dataIndex];
  if (raw == null || raw === "") return "";
  if (typeof raw === "object" && raw.start && raw.end) {
    return `${raw.start} ~ ${raw.end}`;
  }
  return String(raw);
};

const formatAddressLikeValue = (raw: any): string => {
  if (raw == null || raw === "") return "";
  if (typeof raw === "object") {
    const parts = [];
    if (raw.prov) parts.push(raw.prov);
    if (raw.city) parts.push(raw.city);
    if (raw.dist) parts.push(raw.dist);
    const prefix = parts.length > 0 ? parts.join("/") : "";
    const address = raw.address || raw.det || "";
    const coordinate = raw.longitude && raw.latitude ? `(${raw.longitude}, ${raw.latitude})` : "";
    return [prefix, address, coordinate].filter(Boolean).join(" ").trim();
  }
  return String(raw);
};

/** 地址：省/市/区 详细地址 */
const renderingAddress = ({ record, column }: any): VNodeChild => formatAddressLikeValue(record?.[column.dataIndex]);

/** 位置定位：地址 + 坐标 */
const renderingLocation = ({ record, column }: any): VNodeChild => formatAddressLikeValue(record?.[column.dataIndex]);
const renderMap = {
  ATTACH: renderingAttach,
  PICTURE: renderingAttach,
  SIGNATURE: renderingSignature,
  SUBFORM: renderingSubForm,
  DATE_INTERVAL: renderingDateInterval,
  TIME_INTERVAL: renderingTimeInterval,
  ADDRESS: renderingAddress,
  LOCATION: renderingLocation,
};

/** 复合字段拆分子列后，从父字段对象中读取展示值（与报表设计详情一致） */
function renderingCompositePart(fieldId: string, part: string) {
  return ({ record }: any): VNodeChild => {
    const raw = record?.[fieldId];
    if (raw == null || raw === "") return "";
    if (typeof raw === "object") {
      const val = raw[part];
      return val != null && val !== "" ? String(val) : "";
    }
    return String(raw);
  };
}

/**
 * 日期范围 / 时间范围 / 地址 拆分为多个映射字段（参考报表设计详情）
 * @param skipExpand 为 true 时跳过拆分，复合字段作为单列展示
 */
function expandCompositeFieldColumns(formField: any, skipExpand?: boolean): any[] | null {
  if (skipExpand) return null;

  const fieldId = formField.id;
  const base = {
    dataType: formField.type,
    parentFieldId: fieldId,
    children: null,
  };

  if (formField.type === "DATE_INTERVAL" || formField.type === "TIME_INTERVAL") {
    const startLabel = `${formField.title}_开始时间`;
    const endLabel = `${formField.title}_结束时间`;
    return [
      {
        ...base,
        title: startLabel,
        dataIndex: `${fieldId}_start`,
        fieldPart: "start",
        render: renderingCompositePart(fieldId, "start"),
      },
      {
        ...base,
        title: endLabel,
        dataIndex: `${fieldId}_end`,
        fieldPart: "end",
        render: renderingCompositePart(fieldId, "end"),
      },
    ];
  }

  if (formField.type === "ADDRESS" || formField.type === "LOCATION") {
    const option = formField.props?.option ?? "prov-city-dist";
    const columns: any[] = [
      {
        ...base,
        title: `${formField.title}_省`,
        dataIndex: `${fieldId}_prov`,
        fieldPart: "prov",
        render: renderingCompositePart(fieldId, "prov"),
      },
      {
        ...base,
        title: `${formField.title}_市`,
        dataIndex: `${fieldId}_city`,
        fieldPart: "city",
        render: renderingCompositePart(fieldId, "city"),
      },
    ];
    if (option === "prov-city-dist" || option === "prov-city-dist-det") {
      columns.push({
        ...base,
        title: `${formField.title}_区`,
        dataIndex: `${fieldId}_dist`,
        fieldPart: "dist",
        render: renderingCompositePart(fieldId, "dist"),
      });
    }
    if (option === "prov-city-dist-det") {
      columns.push({
        ...base,
        title: `${formField.title}_详细地址`,
        dataIndex: `${fieldId}_det`,
        fieldPart: "det",
        render: renderingCompositePart(fieldId, "det"),
      });
    }
    return columns;
  }

  return null;
}

export function convertToColumns(formFields: any, skipExpand?: boolean) {
  const columns = [];
  if (!formFields) return columns;
  formFields.map((formField) => {
    const convertColumns = convertToColumn(formField, skipExpand);
    if (convertColumns != null) {
      convertColumns.map((convertColumn) => {
        columns.push(convertColumn);
      });
    }
  });
  return columns;
}

export function convertToColumn(formField: any, skipExpand?: boolean) {
  if (formField.type == "HR" || formField.type == "TITLE" || formField.type == "SPLIT_LINE" || formField.type == "BUTTON_CONNECTOR" || formField.type == "EDITORS" || formField.type == "RELATION_QUERY") {
    return null;
  }

  if (formField.type == "COL") {
    return convertToColumns(formField.children, skipExpand);
  }

  const expandedColumns = expandCompositeFieldColumns(formField, skipExpand);
  if (expandedColumns) {
    return expandedColumns;
  }

  const isGroupedField = formField.type === "SUBFORM" || formField.type === "RELATION_DATA";
  const column = {
    title: formField.title,
    dataIndex: formField.id,
    dataType: formField.type,
    children: null,
    render: isGroupedField ? undefined : renderMap[formField.type],
  };
  if (formField.children || formField.props.fieldList) {
    let convertChildren;
    if (formField.type === "SUBFORM") {
      convertChildren = convertToSubFromColumns(formField.children, formField.id);
    } else if (formField.type === "RELATION_DATA") {
      convertChildren = convertToSubFromColumns(formField.props.fieldList, formField.id);
    } else {
      convertChildren = convertToColumns(formField.children, skipExpand);
    }
    if (convertChildren && convertChildren.length > 0) {
      column.children = convertChildren;
    }
  }
  return [column];
}

function convertToSubFromColumns(formFields: any, parentDataIndex: string) {
  if (!formFields) return [];
  return formFields.map((formField) => {
    return {
      title: formField.title,
      dataIndex: formField.id,
      dataType: formField.type,
      parentDataIndex,
      formField,
      render: renderMap["SUBFORM"],
    };
  });
}
