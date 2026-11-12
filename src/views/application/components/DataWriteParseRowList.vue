<template>
  <div class="dw-parse-row-list">
    <template v-for="(row, index) in rows" :key="row._key">
      <div class="dw-parse-row">
        <div class="dw-parse-select">
          <a-select
            v-model="row.field"
            placeholder="请选择"
            allow-search
            @change="(val: string) => onFieldChange(row, val)"
          >
            <a-option
              v-for="opt in optionsForRow(row)"
              :key="opt.field"
              :value="opt.field"
              :label="opt.name"
            />
          </a-select>
        </div>
        <span class="dw-parse-text">等于</span>
        <span class="dw-parse-text">JSON PATH</span>
        <a-input v-model="row.path" class="dw-parse-input" placeholder="请输入" />
        <div class="dw-parse-select dw-parse-classify">
          <a-select
            v-model="row.classify"
            placeholder="类型"
            :disabled="!!row.parentField"
            @change="(val: ClassifyType) => onClassifyChange(row, val)"
          >
            <a-option value="any">任意</a-option>
            <a-option value="object">对象</a-option>
            <a-option value="array">列表</a-option>
          </a-select>
        </div>
        <a-button type="text" status="danger" @click="removeRow(row, index)">
          <icon-close-circle />
        </a-button>
      </div>

      <template v-if="row.classify === 'object' || row.classify === 'array'">
        <div class="dw-parse-child-actions">
          <button type="button" class="dw-add-btn" @click="addChild(row)">
            <icon-plus />
            新增子项
          </button>
        </div>
        <div v-if="row.children?.length" class="dw-parse-children">
          <DataWriteParseRowList
            v-model:rows="row.children"
            :form-list="formList"
            :top-field-options="topFieldOptions"
          />
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import DataWriteParseRowList from './DataWriteParseRowList.vue';
import {
  createEmptyParseRow,
  getChildFieldOptions,
  type ClassifyType,
  type FieldOption,
  type ParseRow,
} from './dataWriteParseUtils';

const rows = defineModel<ParseRow[]>('rows', { required: true });

const props = defineProps<{
  formList: any[];
  topFieldOptions: FieldOption[];
}>();

const optionsForRow = (row: ParseRow): FieldOption[] => {
  if (row.parentField) {
    return getChildFieldOptions(props.formList, row.parentField);
  }
  return props.topFieldOptions;
};

const onFieldChange = (row: ParseRow, field: string) => {
  const opt = optionsForRow(row).find((o) => o.field === field);
  if (opt) {
    row.name = opt.name;
  }
  if (!row.parentField) {
    delete row.children;
  }
};

const onClassifyChange = (row: ParseRow, val: ClassifyType) => {
  if (val === 'any') {
    delete row.children;
  } else if (!row.children) {
    row.children = [];
  }
};

const addChild = (parent: ParseRow) => {
  if (!parent.field) return;
  if (!parent.children) {
    parent.children = [];
  }
  parent.children.push(createEmptyParseRow(parent.field));
};

const removeRow = (_row: ParseRow, index: number) => {
  rows.value.splice(index, 1);
};
</script>

<style lang="scss" scoped>
@use '@/styles/app-integration-panel.scss';

.dw-parse-classify {
  width: 90px;
  min-width: 90px;
}
</style>
