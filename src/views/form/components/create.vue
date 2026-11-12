<template>
  <div>
    <base-modal
      ref="modalRef"
      modal-class="condition-modal"
      :render-to-body="true"
      @handle-ok="formSubmit"
      @handle-cancel="handleCancel"
    >
      <div class="condition-page">
        <div
          v-if="formConfs.formLogics && formConfs.formLogics.length > 0"
          class="condition-rule-list"
        >
          <div
            v-for="(item, index) in formConfs.formLogics"
            :key="index"
            class="condition-rule-list__item"
          >
            <div class="condition-rule-list__content">
              <div
                class="condition-rule-list__block"
                v-for="(items, index1) in item.logicConditions"
                :key="index1 + 'i'"
              >
                <div
                  class="condition-rule-list__line"
                  v-if="items.inputType !== 'USER' && items.inputType !== 'DEPT' && items.inputType !== 'USER_MULTIPLE' && items.inputType !== 'DEPT_MULTIPLE'"
                >
                  当「{{ items.fileCodeName }}」
                  <span
                    v-if="items.inputType == 'SELECT_MULTIPLE' || items.inputType == 'CHECKBOX'"
                    v-for="(val, idx) in typeFlter"
                    :key="idx"
                    v-show="val.value == items.condition"
                  >{{ val.label }}</span>
                  <span
                    v-else-if="items.inputType == 'NUMBER' || items.inputType == 'RATE' || items.inputType == 'MONEY'"
                    v-for="(val, idx) in numTypeFlter"
                    :key="idx + 'z'"
                    v-show="val.value == items.condition"
                  >{{ val.label }}</span>
                  <span
                    v-else-if="items.inputType == 'DATE' || items.inputType == 'TIME'"
                    v-for="(val, idx) in typeFlter"
                    :key="idx + 'i'"
                    v-show="val.value == items.condition"
                  >{{ val.label }}</span>
                  <span
                    v-else
                    v-for="(val, idx) in typeFlter"
                    :key="idx + 'k'"
                    v-show="val.value == items.condition"
                  >{{ val.label }}</span>
                  {{
                    items.condition == 'DYNAMIC_BETWEEN'
                      ? items.value.num + (items.value.type == 'DAY' ? '天' : items.value.type == 'YEAR' ? '年' : '月')
                      : items.condition !== 'IS_NULL' && items.condition !== 'NOT_NULL'
                        ? setDataValue(items)
                        : ''
                  }}时
                </div>
                <div class="condition-rule-list__line" v-else>
                  当「{{ items.fileCodeName }}」
                  <span
                    v-for="(val, idx) in typeFlter"
                    :key="idx"
                    v-if="items.inputType == 'USER' || items.inputType == 'DEPT'"
                    v-show="val.value == items.condition"
                  >{{ val.label }}</span>
                  <span
                    v-for="(val, idx) in selectTypeFlter"
                    v-if="items.inputType == 'USER_MULTIPLE' || items.inputType == 'DEPT_MULTIPLE'"
                    :key="idx"
                    v-show="val.value == items.condition"
                  >{{ val.name }}</span>
                  <span v-if="items.inputType == 'USER' && (items.condition == 'EQ' || items.condition == 'NE')">
                    {{ items.default ? items.default[0].nickname : '' }}
                  </span>
                  <span v-if="items.inputType == 'DEPT' && (items.condition == 'EQ' || items.condition == 'NE')">
                    {{ items.default ? items.default[0].label : '' }}
                  </span>
                  <span
                    v-if="items.inputType == 'USER_MULTIPLE' || (items.inputType == 'USER' && (items.condition == 'IN' || items.condition == 'NOT_IN'))"
                    v-for="(vals, idx) in items.default"
                    :key="idx + 'j'"
                  >
                    {{ vals.nickname }}
                  </span>
                  <span
                    v-if="items.inputType == 'DEPT_MULTIPLE' || (items.inputType == 'DEPT' && (items.condition == 'IN' || items.condition == 'NOT_IN'))"
                    v-for="(vals, idx1) in items.default"
                    :key="idx1 + 'i'"
                  >
                    {{ vals.label }}
                  </span>
                  时
                </div>
                <div
                  class="condition-rule-list__join"
                  v-show="index1 + 1 !== item.logicConditions.length"
                >
                  {{ item.mode == 'all' ? '且' : '或' }}
                </div>
              </div>
              <div class="condition-rule-list__summary">
                显示
                <span v-for="(item2, index2) in item.fieldCodesName" :key="index2 + 'j'">
                  「{{ item2 }}」
                </span>
              </div>
            </div>
            <div class="condition-rule-list__actions">
              <button type="button" class="condition-rule-list__action" title="编辑" @click="edits(item, index)">
                <icon-edit />
              </button>
              <button
                type="button"
                class="condition-rule-list__action is-danger"
                title="删除"
                @click="deleteitems(index)"
              >
                <icon-delete />
              </button>
            </div>
          </div>
        </div>
        <div v-else class="condition-empty-box">
          <img src="../../../assets/zanwuneirong@2x.png" alt="">
          <div class="condition-empty-box__text">请配置逻辑规则</div>
        </div>

        <div class="condition-wrapper">
          <div class="condition-match">
            <a-radio-group v-model="form.mode">
              <a-radio value="all">满足全部条件</a-radio>
              <a-radio value="any">满足任一条件</a-radio>
            </a-radio-group>
          </div>

          <div class="condition-list">
            <div
              v-for="(items, index) in form.logicConditions"
              :key="index"
              class="condition-item"
            >
              <a-select
                allow-clear
                filterable
                v-model="items.fileCode"
                placeholder="选择字段"
                class="condition-field"
                @change="changeName($event, items)"
              >
                <a-option
                  :label="item.title"
                  :value="item.id"
                  v-for="item in DataFormList"
                  :key="item.id"
                />
              </a-select>
              <a-select
                allow-clear
                filterable
                v-model="items.condition"
                placeholder="选择规则"
                class="condition-rule"
                v-if="items.rulesOption && items.rulesOption.length > 0"
                @change="changeValue($event, items)"
              >
                <a-option
                  :label="item.name"
                  :value="item.value"
                  v-for="item in items.rulesOption"
                  :key="item.value"
                />
              </a-select>
              <formLogics
                :deptList="deptList"
                v-if="items.condition"
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
            新增逻辑规则
          </button>

          <div class="condition-show-fields">
            <div class="condition-show-fields__label">显示以下字段</div>
            <a-select
              filterable
              v-model="form.fieldCodes"
              placeholder="请选择"
              allow-clear
              multiple
              @change="changeSelectAll"
            >
              <a-option
                :label="item.title"
                :value="item.id"
                v-for="item in formList"
                :key="item.id"
              />
            </a-select>
          </div>
        </div>
      </div>
    </base-modal>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { serializeFormConditionValue, restoreFormConditionValue } from '@/utils/formConditionValue'
import { Message } from '@arco-design/web-vue';
import { typeFlter, selectTypeFlter, numTypeFlter, setFormValue, getDataForm, setDataForm, setDataFormList } from '@/data/data_form.js'
const modalRef = ref()
const edit = ref(false)
const indexs = ref(0)
interface FormDataType {
  logicConditions?: Array<any>;
  fieldCodes?: Array<any>;
  mode: string;
}
const form = reactive<FormDataType>({
  logicConditions: [{ fileCode: '', condition: '', value: '', rulesOption: [], inputType: '', default: [], valueShow: '' }],
  fieldCodes: [],
  mode: 'all',
})
const props = defineProps<{
  formList: any,
  formConfs: any,
  deptList: any,
}>()
const DataFormList = ref([])

const addItem = () => {
  form.logicConditions.push({ fileCode: '', condition: '', value: '', rulesOption: [], inputType: '', default: [], valueShow: '' })
}
const changeName = (val: any, item: any) => {
  setDataForm(val, item, DataFormList.value)
}
const setDataValue = (items: any) => {
  const value = restoreFormConditionValue(items.condition, items.value, items.default)
  if (!Array.isArray(items.default)) {
    return value
  }

  let datas = ''

  if (Array.isArray(value)) {
    const labels = value.map((v1: any) => {
      const matched = items.default.find((v: any) => v.value == v1)
      return matched ? matched.label : v1
    })
    datas = labels.join(',')
  } else {
    const matched = items.default.find((v: any) => v.value == value)
    datas = matched ? matched.label : value
  }

  return datas
}
const changeValue = (val: any, items: any) => {
  setFormValue(items)
}
const changeSelectAll = (val: any[]) => {
  const conditionFieldCodes = new Set(
    form.logicConditions
      .map((item: any) => item.fileCode)
      .filter((fieldCode: any) => fieldCode !== '' && fieldCode !== null && fieldCode !== undefined)
      .map((fieldCode: any) => String(fieldCode)),
  )
  const selectableFieldCodes = val.filter((fieldCode: any) => !conditionFieldCodes.has(String(fieldCode)))

  if (selectableFieldCodes.length !== val.length) {
    form.fieldCodes = selectableFieldCodes
    Message.error('条件字段不可隐藏')
  }
}
const emits = defineEmits([
  'init',
])
const edits = (val: any, index: any) => {
  let item = JSON.parse(JSON.stringify(val))
  item.logicConditions.map(v => {
    DataFormList.value.map(v1 => {
      if (v1.id == v.fileCode) {
        v.inputType = v1.type
        v.row = v1
        const dataForm = getDataForm(v1.type)
        if (v1.type == 'RADIO' || v1.type == 'CHECKBOX' || v1.type == 'SELECT' || v1.type == 'SELECT_MULTIPLE' || v1.type == 'SWITCH') {
          v.default = v1.type == 'SWITCH'
            ? [
                { label: '开启', value: v1.props?.['checked-value'] ?? true },
                { label: '关闭', value: v1.props?.['unchecked-value'] ?? false },
              ]
            : v1.props.options
        }
        if (v1.type == 'DATE' || v1.type == 'TIME' || v1.type == 'DATERANGE') {
          v.default = v1.format
        }
        if (v1.type == 'ADDRESS' || v1.type == 'LOCATION') {
          v.default = v1.props.level
        }
        v.rulesOption = dataForm?.default ?? []
        if (v.condition == 'DYNAMIC_BETWEEN' && v.inputType == 'DATE') {
          if (v.value.type == "DAY") {
            let a = ''
            a = v.value.num == 1 ? 1 : v.value.num == 3 ? 2 : v.value.num == 5 ? 3 : v.value.num == 7 ? 4 : 5
            v.value = a
          }
          if (v.value.type == "MONTH") {
            let a = ''
            a = v.value.num == 1 ? 6 : v.value.num == 3 ? 7 : v.value.num == 6 ? 8 : 6
            v.value = a
          }
          if (v.value.type == "YEAR") {
            let a = ''
            a = v.value.num == 1 ? 9 : v.value.num == 2 ? 10 : v.value.num == 3 ? 11 : 12
            v.value = a
          }
        }
      }
    })
  })

  item.logicConditions.forEach(v => {
    v.value = restoreFormConditionValue(v.condition, v.value, v.default)
  })
  form.logicConditions = JSON.parse(JSON.stringify(item.logicConditions))
  form.fieldCodes = JSON.parse(JSON.stringify(item.fieldCodes))
  form.mode = JSON.parse(JSON.stringify(item.mode))
  edit.value = true
  indexs.value = index

}
const deleteitems = (index: any) => {
  props.formConfs.formLogics.splice(index, 1)
  edit.value = false
}
const deleteItem = (index: number) => {
  form.logicConditions.splice(index, 1)

}

const showItem = (item: any) => {
  modalRef.value.handleClick({
    title: '表单逻辑规则',
    okText: '确认',
    cancelText: '取消',
    showBtn: true,
    width: '964px',
  })
  DataFormList.value = []
  setDataFormList(props.formList, DataFormList.value)
  props.formConfs.formLogics.map(v => {
    v.fieldCodesName = []
    v.fieldCodes.map(v1 => {
      props.formList.map(v2 => {
        if (v2.id == v1) {
          v.fieldCodesName.push(v2.title)
        }
      })
    })
    v.logicConditions.map((v1) => {
      v1.fileCodeName = ''
      props.formList.map(v2 => {
        if (v2.id == v1.fileCode) {
          v1.fileCodeName = v2.title
          v1.inputType = v2.type
          v1.row = v2
        }

      })
    })
  })
}


const handleCancel = () => {
  form.logicConditions = [{ fileCode: '', condition: '', value: '', rulesOption: [], inputType: '', valueShow: '', }]
  form.fieldCodes = []
  form.mode = 'all'
  edit.value = false
  indexs.value = false
  props.formConfs.formLogic = props.formConfs.formLogics.length > 0 ? '当前表单' + props.formConfs.formLogics.length + '个逻辑规则' : ''
  modalRef.value.handleClose()
}
const formSubmit = () => {
  let params = JSON.parse(JSON.stringify(form))
  if (params.fieldCodes.length > 0) {
    params.logicConditions.map((v: any) => {
      let value = {}
      if (v.condition == 'DYNAMIC_BETWEEN' && v.inputType == 'DATE') {
        if (v.value > 5 && v.value < 9) {
          value.type = "MONTH"
          let items = v.value == 6 ? 1 : v.value == 7 ? 3 : v.value == 8 ? 6 : 1
          value.num = JSON.parse(JSON.stringify(items))
          v.value = value
        }
        if (v.value < 6) {
          value.type = "DAY"
          let items = v.value == 1 ? 1 : v.value == 2 ? 3 : v.value == 3 ? 5 : v.value == 4 ? 7 : 15
          value.num = JSON.parse(JSON.stringify(items))
          v.value = value
        }
        if (v.value > 8) {
          value.type = "YEAR"
          let items = v.value == 9 ? 1 : v.value == 10 ? 2 : v.value == 11 ? 3 : 1
          value.num = JSON.parse(JSON.stringify(items))
          v.value = value
        }
      } else if (v.condition == 'BETWEEN' && v.inputType == 'NUMBER') {
        v.value = [v.min, v.max]
      }
      if ((v.inputType == 'DEPT' || v.inputType == 'USER') && (v.condition == 'EQ' || v.condition == 'NE')) {
        v.value = v.default[0].id
      }
      if (v.inputType == 'DEPT_MULTIPLE' || v.inputType == 'USER_MULTIPLE' || ((v.inputType == 'DEPT' || v.inputType == 'USER') && (v.condition == 'NOT_IN' || v.condition == 'IN'))) {
        v.value = v.default.map(v => { return v.id })
      }
      if ((v.inputType == 'ADDRESS' || v.inputType == 'LOCATION') && v.xsArea) {
        v.value.push(v.xsArea)
      }
      v.value = serializeFormConditionValue(v.condition, v.value)
      delete v.rulesOption
      delete v.row
      delete v.inputType
    })
    if (props.formConfs.formLogics && props.formConfs.formLogics.length > 0) {

    } else {
      props.formConfs.formLogics = []
    }
    if (edit.value) {
      props.formConfs.formLogics[indexs.value] = params
    } else {
      props.formConfs.formLogics.push(
        params
      )
    }

    props.formConfs.formLogic = '当前表单' + props.formConfs.formLogics.length + '个逻辑规则'
    handleCancel()
  } else {
    Message.error('请选择生效字段');
  }

}
defineExpose({
  showItem,
})
</script>
<style lang="scss" scoped>
@use "@/styles/condition-modal.scss" as conditionModal;

:deep(.condition-modal) {
  @include conditionModal.condition-modal-shell;
}

.condition-page {
  @include conditionModal.condition-rule-list;

  .condition-wrapper {
    @include conditionModal.condition-wrapper-styles;

    .condition-match {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
  }
}
</style>

