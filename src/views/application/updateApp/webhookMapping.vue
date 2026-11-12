<template>
  <div class="mapping-config-panel">
    <a-table
        :columns="columns"
        :data="mappingData"
        :pagination="false"
        :bordered="false"
    >
      <template #fieldCode="{ record }">
        <span class="readonly-field">{{ record.fieldCode }}</span>
      </template>

      <template #mappingCode="{ record, rowIndex }">
        <a-input
            v-model="record.mappingCode"
            :class="{
                'input-error': showValidation && !record.mappingCode,
                'input-warning': showValidation && checkDuplicateMappingCode(record,rowIndex)
              }"
            placeholder="请输入映射值"
            allow-clear
            @change="handleMappingChange(rowIndex, record)"
        />
        <div v-if="showValidation && checkDuplicateMappingCode(record, rowIndex)" class="duplicate-warning">
          映射编码重复
        </div>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue'
import {getDesignApp} from "@/api/form/index.js";

const props = defineProps({
  appId: {
    type: String,
    default: ""
  },
  mapping: {
    type: String,
    default: ""
  }
})

const emits = defineEmits(['change'])

const mappingData = ref([])
// 是否显示校验错误
const showValidation = ref(false)

const formConfs = ref({})

const columns = [
  {
    title: '字段名称',
    dataIndex: 'fieldName',
    minWidth: 150,
  },
  {
    title: '字段编码',
    dataIndex: 'fieldCode',
    slotName: 'fieldCode'
  },
  {
    title: '映射编码',
    dataIndex: 'mappingCode',
    slotName: 'mappingCode'
  }
]

const getAppForm = (id) => {
  getDesignApp(id).then(res => {
    formConfs.value = res.formConfig ? JSON.parse(res.formConfig) : {id: ''}
    mappingDataInit()
  })
}

const mappingDataInit = () => {
  const formList = formConfs.value.formList
  if (Array.isArray(formList)) {
    const newMappingData = []

    formList.forEach((v) => {
      const rowMapping = mappingData.value.find(m => m.fieldCode === v.props.field) || null
      // 处理普通字段
      const row = {
        fieldName: v.title,
        fieldCode: v.props.field,
        mappingCode: rowMapping != null ? rowMapping.mappingCode : '',
        isSubForm: v.type === 'SUBFORM'
      }

      // 如果是子表单，递归处理子字段
      if (v.type === 'SUBFORM' && v.children) {
        row.children = []
        v.children.forEach(child => {
          const subRowMapping = mappingData.value.find(m => m.fieldCode === v.props.field) || null
          const subRowChildMapping = subRowMapping?.children.find(m => m.fieldCode === child.props.field) || null
          // console.log({subRowMapping})
          // console.log({subRowChildMapping})
          row.children.push({
            fieldName: child.title,
            fieldCode: child.props.field,
            mappingCode: subRowChildMapping != null ? subRowChildMapping?.mappingCode : '',
            parentFieldCode: v.props.field,
          })
        })
      }

      newMappingData.push(row)
    })
    mappingData.value = newMappingData
  }
}

watch(() => props.appId, (newVal) => {
  if (!!newVal) {
    getAppForm(props.appId)
  }
}, {immediate: true})

watch(() => props.mapping, (newVal) => {
  if (!!newVal) {
    mappingData.value = JSON.parse(newVal)
    mappingDataInit()
  }
})


// 处理映射编码变更
const handleMappingChange = (index, record) => {
  // console.log(`第 ${index + 1} 行映射编码变更为:`, record.mappingCode)
  emits('change', mappingData.value)

}

// 处理子表单映射编码变更
const handleSubMappingChange = (parentIndex, subIndex, subRecord) => {
  // console.log(`子表单字段 [${parentIndex}-${subIndex}] 映射编码变更为:`, subRecord.mappingCode)
  emits('change', mappingData.value)
}

const validateMappingData = () => {
  showValidation.value = true;

  // 收集所有未填写的字段
  // const missingFields = [];
  // 收集重复的映射编码
  const duplicateFields = [];

  mappingData.value.forEach(item => {
    if (!item.mappingCode || item.mappingCode.trim() === '') {
      // missingFields.push(item.fieldName || item.fieldCode);
      item.mappingCode = ''
    }

    // 校验子表单字段
    if (item.children && item.children.length > 0) {
      // 检查子表单内是否有重复
      const subMappingCodeMap = new Map();
      item.children.forEach((child, index) => {
        if (child.mappingCode && child.mappingCode.trim() !== '') {
          if (subMappingCodeMap.has(child.mappingCode)) {
            duplicateFields.push(`${item.fieldName || item.fieldCode} > ${child.fieldName || child.fieldCode}`);
          } else {
            subMappingCodeMap.set(child.mappingCode, true);
          }
        } else {
          // missingFields.push(`${item.fieldName || item.fieldCode} > ${child.fieldName || child.fieldCode}`);
        }
      });
    }
  });

  // 检查主表单字段是否有重复
  const mappingCodeMap = new Map();
  mappingData.value.forEach((item, index) => {
    if (item.mappingCode && item.mappingCode.trim() !== '') {
      if (mappingCodeMap.has(item.mappingCode)) {
        duplicateFields.push(item.fieldName || item.fieldCode);
      } else {
        mappingCodeMap.set(item.mappingCode, true);
      }
    }
  });

  // 构建错误信息
  let errorMessages = [];
  // if (missingFields.length > 0) {
  //   errorMessages.push(`以下字段的映射编码未填写：${missingFields.join('、')}`);
  // }
  if (duplicateFields.length > 0) {
    // 去重重复字段的显示
    const uniqueDuplicates = [...new Set(duplicateFields)];
    errorMessages.push(`以下字段的映射编码存在重复：${uniqueDuplicates.join('、')}`);
  }

  if (errorMessages.length > 0) {
    return {
      valid: false,
      message: errorMessages.join('；')
    };
  }

  return {
    valid: true,
    message: ''
  };
};

// 检查同级字段映射编码是否重复（主表单）
const checkDuplicateMappingCode = (currentRecord, currentIndex) => {
  if (!currentRecord.mappingCode || currentRecord.mappingCode.trim() === '') {
    return false;
  }

  // 子表单校验
  if (currentRecord.parentFieldCode) {
    const parentRecord = mappingData.value.find(m => m.fieldCode === currentRecord.parentFieldCode) || null
    return checkSubDuplicateMappingCode(parentRecord, currentRecord, currentIndex)
  }

  // 只检查同级的非空映射编码
  return mappingData.value.some((item, index) => {
    return index !== currentIndex &&
        item.mappingCode &&
        item.mappingCode.trim() !== '' &&
        item.mappingCode === currentRecord.mappingCode;
  });
};

// 检查子表单内同级字段映射编码是否重复
const checkSubDuplicateMappingCode = (parentRecord, currentSubRecord, currentSubIndex) => {
  if (!currentSubRecord.mappingCode || currentSubRecord.mappingCode.trim() === '') {
    return false;
  }

  // 只检查同一子表单内的同级字段
  return parentRecord.children.some((subItem, index) => {
    return index !== currentSubIndex &&
        subItem.mappingCode &&
        subItem.mappingCode.trim() !== '' &&
        subItem.mappingCode === currentSubRecord.mappingCode;
  });
};

// 获取所有重复的映射编码（用于校验）
const getDuplicateMappingCodes = () => {
  const duplicates = [];
  const mappingCodeCount = new Map();

  // 统计主表单字段
  mappingData.value.forEach(item => {
    if (item.mappingCode && item.mappingCode.trim() !== '') {
      const count = mappingCodeCount.get(item.mappingCode) || 0;
      mappingCodeCount.set(item.mappingCode, count + 1);
    }
  });

  // 找出重复的编码
  mappingCodeCount.forEach((count, code) => {
    if (count > 1) {
      duplicates.push(code);
    }
  });

  return duplicates;
};

// 暴露方法给父组件
defineExpose({
  validateMappingData
});
</script>

<style scoped lang="scss">
.mapping-config-panel {
  width: 100%;
  background-color: var(--color-bg-2);
  border-radius: 4px;
}

:deep(.arco-table) {
  width: 100%;
  table-layout: fixed;
  border: 0 !important;
      white-space: nowrap;
  border-radius: 0 !important;
}


 :deep(.arco-table-container,.arco-table-content) {
    border: none;
    border-radius: 0;
  }



  :deep(.arco-table-th) {
    background: #f8fafc !important;
    color: #475569 !important;
    font-size: 13px !important;
    font-weight: 600 !important;;
    border-bottom: 1px solid #e2e8f0 !important;
    border-right: none !important;
    border-left: none !important;
    border-top: none !important;
  }

  :deep(.arco-table-td) {
    color: #334155!important;
    font-size: 13px!important;
    border-bottom: 1px solid #f1f5f9!important;
    border-right: none !important;
    border-left: none !important;
    border-top: none !important;
    vertical-align: middle!important;
  }


  :deep(.arco-table-tr:hover .arco-table-td) {
    background: #f8fafc;
  }

  :deep(.arco-table-cell) {
    padding: 12px !important;
  }

  :deep(.arco-table-th .arco-table-cell) {
    padding: 10px 12px !important;
  }

.readonly-field {
  color: var(--color-text-3);
  background-color: var(--color-fill-2);
  padding: 4px 8px;
  border-radius: 2px;
  display: inline-block;
  width: 100%;
  font-family: "Alibaba PuHuiTi 2.0-55 Regular";
  box-sizing: border-box;
}

/* 输入框错误样式 */
.input-error {
  :deep(.arco-input) {
    border-color: #f53f3f;
  }

  :deep(.arco-input-wrapper) {
    border-color: #f53f3f;
  }

  :deep(.arco-input-wrapper:hover) {
    border-color: #f53f3f;
  }

  :deep(.arco-input-wrapper:focus) {
    border-color: #f53f3f;
    box-shadow: 0 0 0 2px rgba(245, 63, 63, 0.2);
  }
}

/* 输入框警告样式（重复） */
.input-warning {
  :deep(.arco-input) {
    border-color: #ff7d00;
  }

  :deep(.arco-input-wrapper) {
    border-color: #ff7d00;
  }

  :deep(.arco-input-wrapper:hover) {
    border-color: #ff7d00;
  }

  :deep(.arco-input-wrapper:focus) {
    border-color: #ff7d00;
    box-shadow: 0 0 0 2px rgba(255, 125, 0, 0.2);
  }
}

.duplicate-warning {
  color: #ff7d00;
  font-size: 12px;
  margin-top: 2px;
  position: absolute;
  left: 16px;
  white-space: nowrap;
}
</style>
