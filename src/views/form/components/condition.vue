<template>
  <div class="create">
    <a-modal
      v-model:visible="dialogVisible"
      :title="formData.title"
      title-align="start"
      :render-to-body="true"
      unmount-on-close
      width="964px"
      :mask-closable="false"
      :align-center="true"
      class="condition-modal"
    >
      <div class="condition-wrapper">
        <div class="condition-match">
          <a-radio-group v-model="form.mode">
            <a-radio value="and">满足全部条件</a-radio>
            <a-radio value="or">满足任一条件</a-radio>
          </a-radio-group>
        </div>

        <div class="condition-list">
          <p v-if="!form.logicConditions.length" class="condition-empty">
            暂无逻辑规则，点击「新增逻辑规则」
          </p>
          <div
            v-for="(items, index) in form.logicConditions"
            :key="index"
            class="condition-item"
          >
            <a-select
              v-model="items.relationField"
              placeholder="选择字段"
              class="condition-field"
              @change="changeName($event, items)"
            >
              <a-option
                :label="item.title"
                :value="item.id"
                v-for="item in drawingList"
                :key="item.id"
              />
            </a-select>
            <a-select
              v-model="items.symbol"
              placeholder="选择规则"
              class="condition-rule"
              v-if="items.rulesOption.length > 0"
              @change="changeValue($event, items)"
            >
              <a-option
                :label="item.name"
                :value="item.value"
                v-for="item in items.rulesOption"
                :key="item.value"
              />
            </a-select>
            <a-select
              v-model="items.field"
              filterable
              allow-create
              placeholder="请设置表单字段"
              class="condition-value"
              v-if="items.symbol && items.symbol !== 'NOT_NULL' && items.symbol !== 'IS_NULL'"
            >
              <a-option
                v-show="items.inputType == itema.type"
                v-for="itema in DataFormList"
                :key="itema.id"
                :label="itema.title"
                :value="itema.id"
              />
            </a-select>
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
          新增逻辑规则
        </button>
      </div>

      <template #footer>
        <div class="condition-footer">
          <button type="button" class="modal-btn modal-btn-ghost" @click="handleClose">
            取消
          </button>
          <button type="button" class="modal-btn modal-btn-primary" @click="next">
            确定
          </button>
        </div>
      </template>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { setDataForm, setDataFormList } from '@/data/data_form.js'
import { getFormById } from '@/utils/form';
import { useRoute } from 'vue-router';
const route = useRoute()

interface LogicCondition {
  field: string;
  symbol: string;
  relationField: string;
  rulesOption: any[];
  inputType: string;
  default: any[];
  valueShow: string;
  format?: string;
  types?: string;
  row?: any;
}

interface FormDataType {
  logicConditions: LogicCondition[];
  mode: string;
}

const props = defineProps<{
  drawingList: any[];
  tableList: any;
  activeForm: any;
  formData: any;
  category: any;
}>()
const emit = defineEmits<{
  (e: 'addData', data: FormDataType): void;
}>()
const DataFormList = ref([])
const dialogVisible = ref(false);

const form = reactive<FormDataType>({
  logicConditions: [],
  mode: 'and',
});


const addItem = () => {
  form.logicConditions.push({
    field: '',
    symbol: '',
    relationField: '',
    rulesOption: [],
    inputType: '',
    default: [],
    valueShow: ''
  });
};

const deleteItem = (index: number) => {
  form.logicConditions.splice(index, 1);
};

const showItem = (val: any) => {
  dialogVisible.value = true;
  form.logicConditions = JSON.parse(JSON.stringify( props.activeForm.props.conditionList || []))  
  form.mode =JSON.parse(JSON.stringify( props.activeForm.props.conditionType || 'and'))   
  let formConfig = getFormById(route.query.id)
  setDataFormList(formConfig.formList, DataFormList.value)
console.log(formConfig.formList)
};

const changeName = (val: any, item: any) => {
  setDataForm(val, item, props.drawingList)
  if (item.inputType == 'SELECT_MULTIPLE' || item.inputType == 'CHECKBOX') {
    item.rulesOption = [
      {
        type: 'in',
        value: 'IN',
        name: '等于其中之一'
      },
      {
        type: 'notIn',
        value: 'NOT_IN',
        name: '不等于其中之一 '
      },
      {
        type: 'isNull',
        value: 'IS_NULL',
        name: '为空'
      },
      {
        type: 'notNull',
        value: 'NOT_NULL',
        name: '不为空'
      },
    ]
  }
};

const changeValue = (val: any, items: any) => {
  items.field = '';
};

const handleClose = () => {
  form.logicConditions = [];
  form.mode = 'and';
  DataFormList.value = []
  dialogVisible.value = false;
};

const next = () => {
  emit('addData', { ...form });
  handleClose();
};

defineExpose({
  showItem
});
</script>
<style lang="scss" scoped>
@use "@/styles/condition-modal.scss" as conditionModal;

.condition-modal {
  :deep(.arco-modal) {
    @include conditionModal.condition-modal-shell;
  }
}

.condition-wrapper {
  @include conditionModal.condition-wrapper-styles;

  .condition-match {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
}

@include conditionModal.condition-footer-styles;
</style>
