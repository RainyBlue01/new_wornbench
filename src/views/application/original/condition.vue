<template>
  <a-modal
    v-model:visible="visible"
    :render-to-body="true"
    unmount-on-close
    title-align="start"
    width="680px"
    :mask-closable="false"
    :align-center="true"
    class="condition-modal"
  >
    <template #title>数据筛选</template>

    <div class="condition-wrapper">
      <div class="condition-match">
        <a-radio-group v-model="form.match">
          <a-radio value="1">满足全部条件</a-radio>
          <a-radio value="0">满足任一条件</a-radio>
        </a-radio-group>
      </div>

      <div class="condition-list">
        <p v-if="!form.conditions.length" class="condition-empty">
          暂无筛选条件，点击「添加条件」
        </p>
        <div
          v-for="(items, index) in form.conditions"
          :key="index"
          class="condition-item"
        >
          <a-select
            v-model="items.fieldCode"
            allow-clear
            filterable
            placeholder="选择字段"
            class="condition-field"
            @change="changeName($event, items)"
          >
            <a-option
              v-for="item in columnList"
              v-show="
                item.type !== 'EDITORS' &&
                item.type !== 'ROW' &&
                item.type !== 'COL' &&
                item.type !== 'RELATION_DATA' &&
                item.type !== 'RELATION_QUERY'
              "
              :key="item.id"
              :label="item.title"
              :value="item.id"
            />
          </a-select>
          <a-select
            v-if="items.rulesOption.length > 0"
            v-model="items.condition"
            allow-clear
            filterable
            placeholder="等于"
            class="condition-rule"
            @change="changeValue($event, items)"
          >
            <a-option
              v-for="item in items.rulesOption"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            />
          </a-select>
          <formLogics
            v-if="items.condition"
            :deptList="deptLists"
            :datas="items"
            class="condition-value"
          />
          <button
            type="button"
            class="condition-remove"
            title="删除"
            @click="deleteItem(index)"
          >
            <icon-delete />
          </button>
        </div>
      </div>

      <button type="button" class="condition-add-btn" @click="addItem">
        <icon-plus />
        添加条件
      </button>
    </div>

    <template #footer>
      <div class="condition-footer">
        <button
          type="button"
          class="modal-btn modal-btn-ghost"
          @click="resetConditionHandler"
        >
          清空条件
        </button>
        <button
          type="button"
          class="modal-btn modal-btn-ghost"
          @click="visible = false"
        >
          取消
        </button>
        <button
          type="button"
          class="modal-btn modal-btn-primary"
          @click="filterClick"
        >
          查询
        </button>
      </div>
    </template>
  </a-modal>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { setFormValue, setDataForm, setDataFormList } from "@/data/data_form.js";

const columnList = ref([]);
const visible = ref(false);
const emits = defineEmits(["filter"]);
defineProps({ deptLists: Object });

interface FormDataType {
  conditions?: Array<any>;
  match: string;
}

const form = reactive<FormDataType>({
  conditions: [],
  match: "1",
});

const addItem = () => {
  form.conditions.push({
    custom: false,
    fieldCode: "",
    expression: "",
    condition: "",
    value: "",
    rulesOption: [],
    inputType: "",
    default: [],
    valueShow: "",
  });
};

const changeName = (val: any, item: any) => {
  setDataForm(val, item, columnList.value);
  if (item.inputType == "SELECT_MULTIPLE" || item.inputType == "CHECKBOX") {
    item.rulesOption = [
      {
        type: "in",
        value: "IN",
        name: "等于其中之一",
      },
      {
        type: "notIn",
        value: "NOT_IN",
        name: "不等于其中之一 ",
      },
      {
        type: "isNull",
        value: "IS_NULL",
        name: "为空",
      },
      {
        type: "notNull",
        value: "NOT_NULL",
        name: "不为空",
      },
    ];
  }
};

const changeValue = (val: any, items: any) => {
  setFormValue(items);
};

const deleteItem = (index: number) => {
  form.conditions.splice(index, 1);
};

const filterClick = () => {
  emits("filter", {
    match: form.match == "1" ? true : false,
    conditions: form.conditions.map((item) => {
      if (
        (item.inputType == "DEPT" || item.inputType == "USER") &&
        (item.condition == "EQ" || item.condition == "NE")
      ) {
        item.value = item.default[0].id;
      }
      if (
        item.inputType == "DEPT_MULTIPLE" ||
        item.inputType == "USER_MULTIPLE" ||
        ((item.inputType == "DEPT" || item.inputType == "USER") &&
          (item.condition == "NOT_IN" || item.condition == "IN"))
      ) {
        item.value = item.default.map((v) => {
          return v.id;
        });
      }
      return {
        field: item.fieldCode,
        symbol: item.condition,
        value: item.value,
        extra: {},
      };
    }),
  });
  visible.value = false;
};

const resetConditionHandler = () => {
  form.conditions = [];
};

const show = (formList: any, processId: any, formOnlyFields = false) => {
  visible.value = true;
  columnList.value.length = 0;
  setDataFormList(formList, columnList.value);
  if (formOnlyFields) return;
  columnList.value.push({
    custom: false,
    id: "id",
    fieldCode: "id",
    title: "主键",
    type: "INPUT",
    default: "",
  });
  columnList.value.push({
    custom: false,
    id: "create_user",
    fieldCode: "create_user",
    title: "创建人",
    type: "INPUT",
    default: "",
  });
  columnList.value.push({
    custom: false,
    id: "create_time",
    fieldCode: "create_time",
    title: "创建时间",
    type: "DATE",
    props: {
      format: "yyyy-MM-dd HH:mm:ss",
    },
    default: "",
  });
  columnList.value.push({
    custom: false,
    id: "update_user",
    fieldCode: "update_user",
    title: "修改人",
    type: "INPUT",
    default: "",
  });
  columnList.value.push({
    custom: false,
    id: "update_time",
    fieldCode: "update_time",
    title: "修改时间",
    type: "DATE",
    props: {
      format: "yyyy-MM-dd HH:mm:ss",
    },
    default: "",
  });
  columnList.value.push({
    custom: false,
    id: "submit_ip",
    fieldCode: "submit_ip",
    title: "提交ip",
    type: "INPUT",
    default: "",
  });

  columnList.value.push({
    custom: false,
    id: "input_source",
    fieldCode: "input_source",
    title: "数据来源",
    type: "SELECT",
    props: {
      options: [
        { value: 1, label: "填写" },
        { value: 2, label: "导入" },
      ],
    },
  });

  if (processId) {
    columnList.value.push({
      custom: false,
      id: "instance_id",
      fieldCode: "instance_id",
      title: "流程实例id",
      type: "INPUT",
      default: "",
    });

    columnList.value.push({
      custom: false,
      id: "instance_state",
      fieldCode: "instance_state",
      title: "流程状态",
      type: "SELECT",
      props: {
        options: [
          { value: 0, label: "已完成" },
          { value: 1, label: "运行中" },
        ],
      },
    });
  }
};

defineExpose({ show });
</script>

<style lang="scss" scoped>
$filter-border: #f1f5f9;
$filter-primary: rgb(var(--primary-6));

@mixin app-form-control {
  border-radius: 8px;
  border-color: #e2e8f0;
  background: #f8fafc;
  font-size: 13px;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
    border-color: #e2e8f0;
  }
}

@mixin app-form-control-focus {
  background: #fff;
  border-color: $filter-primary;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}

.condition-modal {
  :deep(.arco-modal) {
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }

  :deep(.arco-modal-header) {
    border-bottom: 1px solid $filter-border;
    padding: 20px 28px 16px;
  }

  :deep(.arco-modal-title) {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
  }

  :deep(.arco-modal-body) {
    padding: 24px 28px;
  }

  :deep(.arco-modal-footer) {
    border-top: 1px solid $filter-border;
    padding: 16px 28px 20px;
  }
}

.condition-wrapper {
  .condition-match {
    margin-bottom: 16px;

    :deep(.arco-radio-group) {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    :deep(.arco-radio-label) {
      font-size: 13px;
      color: #475569;
    }

    :deep(.arco-radio-checked .arco-radio-icon) {
      background-color: $filter-primary;
      border-color: $filter-primary;
    }
  }

  .condition-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
  }

  .condition-empty {
    margin: 0;
    font-size: 13px;
    color: #94a3b8;
    text-align: center;
    padding: 16px 0;
  }

  .condition-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 10px;
    border: 1px solid $filter-border;

    .condition-field {
      flex: 1;
      min-width: 140px;

      :deep(.arco-select-view) {
        @include app-form-control;

        &.arco-select-view-focus {
          @include app-form-control-focus;
        }
      }
    }

    .condition-rule {
      min-width: 130px;
      width: 130px;
      flex-shrink: 0;

      :deep(.arco-select-view) {
        @include app-form-control;

        &.arco-select-view-focus {
          @include app-form-control-focus;
        }
      }
    }

    .condition-value {
      flex: 1;
      min-width: 120px;

      :deep(.formLogics) {
        width: 100%;
        margin-left: 0;
      }

      :deep(.arco-select-view),
      :deep(.arco-input-wrapper) {
        @include app-form-control;
      }

      :deep(.arco-select-view-focus),
      :deep(.arco-input-wrapper:focus-within) {
        @include app-form-control-focus;
      }

      :deep(.inputLogics),
      :deep(.selectLogics),
      :deep(.dateLogics),
      :deep(.userLogics),
      :deep(.numberLogics),
      :deep(.timeLogics) {
        margin-left: 0 !important;
        width: 100%;
      }
    }

    .condition-remove {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      flex-shrink: 0;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: #94a3b8;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.2s;

      &:hover {
        background: #fee2e2;
        color: #ef4444;
      }
    }
  }

  .condition-add-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border-radius: 10px;
    border: 1px dashed #bfdbfe;
    background: #eff6ff;
    color: $filter-primary;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #dbeafe;
    }

    :deep(svg) {
      font-size: 14px;
    }
  }
}

.condition-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.modal-btn {
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  white-space: nowrap;
}

.modal-btn-ghost {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;

  &:hover {
    background: #f1f5f9;
    color: #475569;
  }
}

.modal-btn-primary {
  background: linear-gradient(135deg, rgb(var(--primary-6)), #6366f1);
  color: #fff;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);

  &:hover {
    opacity: 0.92;
  }
}
</style>
