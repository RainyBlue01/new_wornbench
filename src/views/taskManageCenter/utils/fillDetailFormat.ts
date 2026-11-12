import { h } from "vue"
import type { Ref } from 'vue'

export function createFillDetailFormatter({ formFieldMap }: {
  formFieldMap: Ref<Record<string, any>>
}) {


const SKIP_DETAIL_TYPES = ['ROW', 'TITLE', 'HR', 'SPLIT_LINE', 'EDITORS', 'RELATION_QUERY', 'COL', 'BUTTON_CONNECTOR'];

const findOptionLabel = (options: any[], value: any) => {
    if (!options?.length) return null;
    const opt = options.find(
        (item) => item.value === value || item.key === value || String(item.value) === String(value),
    );
    return opt?.label ?? opt?.text ?? null;
};

const DISPLAY_OBJECT_SKIP_KEYS = new Set(['id', 'value', 'key', 'labelValue']);

const getReadableObjectValue = (value: any) => {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value !== 'object') return String(value);

    const preferred = value.nickname || value.label || value.deptName || value.fileName || value.name || value.text || value.title;
    if (preferred) return String(preferred);

    const entry = Object.entries(value).find(([key, item]) => {
        if (DISPLAY_OBJECT_SKIP_KEYS.has(key)) return false;
        return item !== null && item !== undefined && item !== '' && typeof item !== 'object';
    });

    return entry ? String(entry[1]) : '';
};

const formatObjectArrayDisplayValue = (value: any[]) => {
    const values = value.map(getReadableObjectValue).filter(Boolean);
    return values.join('、') || '--';
};

const formatFieldDisplayValue = (field: any, rawValue?: any) => {
    const val = rawValue !== undefined ? rawValue : field?.props?.value;
    if (val === null || val === undefined || val === '') return '--';

    const type = field?.type;
    const options = field?.props?.options || field?.props?.optionList || [];

    if (type === 'USER' || type === 'DEPT') {
        if (Array.isArray(val)) {
            return val.map((item) => item?.nickname || item?.label || item?.deptName || item?.name).filter(Boolean).join('、') || '--';
        }
        return String(val);
    }
    if (type === 'USER_MULTIPLE' || type === 'DEPT_MULTIPLE') {
        if (!Array.isArray(val)) return String(val);
        return val.map((item) => item?.nickname || item?.label || item?.deptName || item?.name).filter(Boolean).join('、') || '--';
    }
    if (type === 'SELECT' || type === 'RADIO' || type === 'SWITCH') {
        return findOptionLabel(options, val) ?? String(val);
    }
    if (type === 'SELECT_MULTIPLE' || type === 'CHECKBOX') {
        const values = Array.isArray(val) ? val : String(val).split(',').filter(Boolean);
        const labels = values.map((item) => findOptionLabel(options, item) ?? String(item));
        return labels.join('、') || '--';
    }
    if (type === 'ATTACH' || type === 'PICTURE' || type === 'SIGNATURE') {
        if (Array.isArray(val)) {
            return val.map((item) => item?.fileName || item?.name || '附件').join('、') || '--';
        }
        return String(val);
    }
    if (type === 'DATE_INTERVAL' || type === 'TIME_INTERVAL') {
        if (typeof val === 'object' && val) {
            const start = val.start ?? '';
            const end = val.end ?? '';
            return [start, end].filter(Boolean).join(' ~ ') || '--';
        }
    }
    if (type === 'ADDRESS' && typeof val === 'object' && val) {
        return [val.prov, val.city, val.dist, val.det].filter(Boolean).join('') || '--';
    }
    if (Array.isArray(val)) {
        return formatObjectArrayDisplayValue(val);
    }
    if (typeof val === 'object') {
        return getReadableObjectValue(val) || JSON.stringify(val);
    }
    return String(val);
};

const getFieldDisplayTitle = (field: any) => {
    const title = String(field?.title ?? '').trim();
    if (title) return field.title;
    if (field?.type === 'SUBFORM') return '子表单';
    return field?.title || '--';
};

const getFieldTagClass = (_text: string) => {
    // if (text === '--' || text === '否' || text === '无') return 'fill-field-tag--muted';

    // const warnKeywords = ['咳嗽', '发热', '异常', '是'];
    // const successKeywords = ['正常', '良好'];

    // if (warnKeywords.some((word) => text.includes(word))) return 'fill-field-tag--warn';
    // if (successKeywords.some((word) => text.includes(word))) return 'fill-field-tag--success';
    return 'fill-field-tag--info';
};

const flattenDisplayFields = (formList: any[]) => {
    const result: any[] = [];
    const walk = (list: any[]) => {
        list?.forEach((item) => {
            if (item?.type === 'COL' && item.children) {
                walk(item.children);
            } else if (!SKIP_DETAIL_TYPES.includes(item?.type)) {
                result.push(item);
            } else if (item?.children && item.type !== 'SUBFORM') {
                walk(item.children);
            }
        });
    };
    walk(formList || []);
    return result;
};

const flattenSubFormFields = (formList: any[]) => {
    const result: any[] = [];
    const walk = (list: any[]) => {
        list?.forEach((item) => {
            if (item?.type === 'COL' && item.children) {
                walk(item.children);
            } else if (!SKIP_DETAIL_TYPES.includes(item?.type) && item?.type !== 'SUBFORM') {
                result.push(item);
            } else if (item?.children && item.type !== 'SUBFORM') {
                walk(item.children);
            }
        });
    };
    walk(formList || []);
    return result;
};

const getSubFormRowValue = (row: Record<string, any>, child: any) => {
    const keys = [
        child?.id,
        child?.field,
        child?.__vModel__,
        child?.props?.field,
        child?.props?.id,
        String(child?.id ?? '').split('.').pop(),
        String(child?.field ?? '').split('.').pop(),
        String(child?.__vModel__ ?? '').split('.').pop(),
        String(child?.props?.field ?? '').split('.').pop(),
    ].filter(Boolean);

    for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
            return row[key];
        }
    }

    return undefined;
};

const formatSubFormCellDisplayValue = (field: any, value: any) => {
    const text = formatFieldDisplayValue(field, value);
    return text === '--' ? '-' : text;
};

const getChineseRowIndex = (index: number) => {
    const numbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    return numbers[index] || String(index + 1);
};

const buildSubFormDetailLines = (field: any, rawValue?: any) => {
    const value = rawValue !== undefined ? rawValue : field?.props?.value;
    const childFields = flattenSubFormFields(field.children || []);

    if (!Array.isArray(value) || value.length === 0 || childFields.length === 0) {
        return [];
    }

    return value.map((row: Record<string, any>, index: number) => {
        const parts = childFields
            .map((child) => {
                const valueText = formatSubFormCellDisplayValue(child, getSubFormRowValue(row, child));
                return valueText === '-' ? '' : `${getFieldDisplayTitle(child)}：${valueText}`;
            })
            .filter(Boolean);

        return `第${getChineseRowIndex(index)}行${parts.length ? `：${parts.join('；')}` : '：-'}`;
    });
};

const buildViewDetailRows = (formList: any[], formData: Record<string, any> = {}) =>
    flattenDisplayFields(formList).map((field) => {
        if (field.type === 'SUBFORM') {
            const lines = buildSubFormDetailLines(field, formData[field.id]);
            return {
                id: String(field.id),
                title: getFieldDisplayTitle(field),
                text: lines.length ? lines.join('\n') : '--',
                tagClass: lines.length ? 'fill-field-tag--info' : 'fill-field-tag--muted',
                lines,
            };
        }

        const text = Object.prototype.hasOwnProperty.call(formData, field.id)
            ? formatFieldDisplayValue(field, formData[field.id])
            : formatFieldDisplayValue(field);
        return {
            id: String(field.id),
            title: getFieldDisplayTitle(field),
            text,
            tagClass: getFieldTagClass(text),
        };
    });

const formatCellValue = (value: any, dataIndex: string) => {
    const field = formFieldMap.value[dataIndex];
    if (field) return formatFieldDisplayValue(field, value);
    if (value === null || value === undefined || value === '') return '--';
    return String(value);
};

const getDisplayPartText = (item: any) => {
    if (item === null || item === undefined || item === '') return '';
    if (typeof item !== 'object') return String(item);
    return getReadableObjectValue(item) || JSON.stringify(item);
};

const getTableCellDisplayParts = (field: any, rawValue?: any): string[] => {
    const val = rawValue !== undefined ? rawValue : field?.props?.value;
    if (val === null || val === undefined || val === '') return [];

    const type = field?.type;
    const options = field?.props?.options || field?.props?.optionList || [];

    if (type === 'SELECT' || type === 'RADIO' || type === 'SWITCH') {
        const label = findOptionLabel(options, val);
        return [label ?? String(val)];
    }

    if (type === 'SELECT_MULTIPLE' || type === 'CHECKBOX') {
        const values = Array.isArray(val) ? val : String(val).split(',').filter(Boolean);
        return values.map((item) => findOptionLabel(options, item) ?? String(item)).filter(Boolean);
    }

    if (type === 'DATE_INTERVAL' || type === 'TIME_INTERVAL') {
        if (typeof val === 'object' && val) {
            const start = val.start ?? '';
            const end = val.end ?? '';
            return [[start, end].filter(Boolean).join(' ~ ')].filter(Boolean);
        }
    }

    if (type === 'ADDRESS' && typeof val === 'object' && val) {
        return [[val.prov, val.city, val.dist, val.det].filter(Boolean).join('')].filter(Boolean);
    }

    const values = Array.isArray(val) ? val : [val];
    return values.map(getDisplayPartText).filter(Boolean);
};

const renderTableCellDisplayValue = (field: any, rawValue?: any) => {
    const parts = getTableCellDisplayParts(field, rawValue);
    if (parts.length === 0) return '--';
    if (parts.length === 1) return parts[0];

    return h(
        'div',
        { class: 'fill-multi-value-cell' },
        parts.map((part, index) =>
            h(
                'span',
                {
                    class: 'fill-multi-value-cell__item',
                    key: `${part}-${index}`,
                    title: part,
                },
                part + (index < parts.length - 1 ? '，' : ''),
            ),
        ),
    );
};

const getResizeColumnKey = (column: any) => {
    const fieldKey = column.fieldDataIndex ?? column.dataIndex;
    return column.parentDataIndex && fieldKey ? `${column.parentDataIndex}.${fieldKey}` : fieldKey;
};

const wrapColumnRender = (column: any) => {
    const fieldDataIndex = column.fieldDataIndex ?? column.dataIndex;
    const formField = column.formField ?? formFieldMap.value[fieldDataIndex];
    const originalRender = column.render;
    return {
        ...column,
        align: 'center',
        minWidth: column.minWidth || 100,
        render: ({ record, column: renderColumn }: any) => {
            const raw = record?.[fieldDataIndex];
            const normalizedColumn = {
                ...renderColumn,
                ...column,
                dataIndex: fieldDataIndex,
                parentDataIndex: column.parentDataIndex ?? renderColumn?.parentDataIndex,
                formField,
                parent: column.parentDataIndex
                    ? { dataIndex: column.parentDataIndex }
                    : renderColumn?.parent,
            };

            if (originalRender) {
                return originalRender({ record, column: normalizedColumn });
            }

            if (formField) {
                return renderTableCellDisplayValue(formField, raw);
            }

            return formatCellValue(raw, fieldDataIndex);
        },
    };
};

const layoutColumnTypes = new Set(['ROW', 'COL']);

const flattenLayoutColumns = (sourceColumns: any[]): any[] =>
    sourceColumns.flatMap((column) => {
        if (layoutColumnTypes.has(column?.dataType) && Array.isArray(column.children)) {
            return flattenLayoutColumns(column.children);
        }

        return [column];
    });

const getColumnDisplayTitle = (column: any) => {
    const title = String(column?.title ?? '').trim();
    if (title) return column.title;

    if (column?.dataType === 'SUBFORM') {
        return '子表单';
    }

    return column?.title;
};

const mergeCompositeColumns = (sourceColumns: any[]) => {
    const mergedColumns: any[] = [];
    const seenParents = new Set<string>();

    for (const column of sourceColumns) {
        if (column.children?.length) {
            mergedColumns.push({
                ...column,
                title: getColumnDisplayTitle(column),
                render: undefined,
                children: column.children.map((child: any) => {
                    const resizeKey = getResizeColumnKey(child);
                    return wrapColumnRender({
                        ...child,
                        fieldDataIndex: child.fieldDataIndex ?? child.dataIndex,
                        dataIndex: resizeKey,
                        key: resizeKey,
                    });
                }),
            });
            continue;
        }

        if (column.parentFieldId) {
            if (seenParents.has(column.parentFieldId)) continue;
            seenParents.add(column.parentFieldId);
            const formField = formFieldMap.value[column.parentFieldId];

            mergedColumns.push({
                ...column,
                title: formField?.title || column.title,
                dataIndex: column.parentFieldId,
                key: column.parentFieldId,
                parentFieldId: undefined,
                fieldPart: undefined,
                width: column.width || 160,
                minWidth: column.minWidth || 120,
                render: ({ record }: any) => renderTableCellDisplayValue(formField, record?.[column.parentFieldId]),
            });
        } else {
            mergedColumns.push(wrapColumnRender({
                ...column,
                title: getColumnDisplayTitle(column),
            }));
        }
    }

    return mergedColumns;
};
  return { buildViewDetailRows, flattenLayoutColumns, getColumnDisplayTitle, mergeCompositeColumns }
}
