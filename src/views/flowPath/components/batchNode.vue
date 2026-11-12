

<template>
  <base-modal ref="modalRef" @handle-ok="formSubmit" @handle-cancel="handleCancel">
    <div class="dia">
      <div class="dia-title">
        当前节点：<span>{{ activeFlew.nodeName }}</span>
      </div>
      <div class="dia-btns">
        <div class="dia-btns-set">
          <div class="set-title">请配置审批操作</div>
          <div class="set-btn" @click="updateNames">配置别名</div>
        </div>
        <div class="checkbox-item">
          <a-space>
            <a-checkbox v-model="formItem.pass.config" v-if="formItem.pass.enable">通过</a-checkbox>
            <a-checkbox v-model="formItem.refuse.config" v-if="activeFlew.type == 'APPROVE' && formItem.refuse.enable">拒绝</a-checkbox>
            <a-checkbox v-model="formItem.delegate.config" v-if="formItem.delegate.enable">提交</a-checkbox>
            <a-checkbox v-model="formItem.back.config" v-if="activeFlew.type == 'APPROVE' && formItem.back.enable">打回重填(退回)</a-checkbox>
          </a-space>

        </div>
      </div>
      <div class="dia-next">
        <div class="next-title">
          当触发以上操作后，填写：
        </div>
        <div class="next-bottom">
          <div class="next-bottom-item">
            <a-switch v-model="formItem.pass.comment" />
            <span>处理意见</span>
          </div>
          <div class="next-bottom-item">
            <a-switch v-model="formItem.pass.signature" />
            <span>手写签名</span>
          </div>
          <div class="next-bottom-item">
            <a-switch :model-value="false" disabled />
            <span>电子签章</span>
          </div>
        </div>
      </div>
      <div class="dia-bottom" v-if="activeFlew.type == 'APPROVE' && formItem.back.enable && formItem.back.config">
        <div class="bottom-item">
          <span>退回到：</span>
          <a-select allow-clear placeholder="请选择自动返回方案" v-model="formItem.back.back" :options="optionsCommit"></a-select>
        </div>
        <div class="bottom-item">
          <span>重新提交后：</span>
          <a-select allow-clear placeholder="请选择重新提交方案" v-model="formItem.back.resubmit"
            :options="optionsBack"></a-select>
        </div>
      </div>
      <updateName ref="updateNameRef" @setNames="setNames" />
    </div>
  </base-modal>
</template>
<script setup lang="ts">
import { ref} from 'vue'
import updateName from './updateName.vue'
const props = defineProps<{
  activeFlew: any,
}>()

const optionsCommit = [
  { label: '根节点', value: 0 },
  { label: '上一节点', value: 1 }
]
const optionsBack = [
  { label: '按流程审批', value: 0 },
  { label: '直达当前节点', value: 1 }
]
const formItem = ref({
  pass: {
     config:true,
    enable: true,
    label: "通过",
    comment: false,
    signature: false,
    seal: false
  },
  refuse: {
     config:true,
    enable: true,
    label: "拒绝",
    comment: false,
    signature: false,
    seal: false
  },
  delegate: {
     config:true,
    enable: true,
    label: "转交",
    comment: false,
    signature: false,
    seal: false
  },
  back: {
     config:true,
    enable: true,
    label: "退回",
    back: 0,
    resubmit: 0
  }
})
const modalRef = ref()
const updateNameRef = ref()
const electronicSealActionKeys = ['pass', 'refuse', 'delegate'] as const

const resetElectronicSeal = (value: any) => {
  electronicSealActionKeys.forEach((key) => {
    if (value?.[key]) {
      value[key].seal = false
    }
  })
}

const updateNames = () => {
  updateNameRef.value.showItem(formItem.value)
}
const setNames = (val: any) => {
  formItem.value = JSON.parse(JSON.stringify(val))
  resetElectronicSeal(formItem.value)
}
const showItem = () => {
  formItem.value = JSON.parse(JSON.stringify(props.activeFlew))
  resetElectronicSeal(formItem.value)
  modalRef.value.handleClick({
    title: '节点操作批量配置',
    okText: '确认',
    cancelText: '取消',
    showBtn: true,
    width: '860px',
  })
}


const handleCancel = () => {
  modalRef.value.handleClose()
}
const emits = defineEmits([
  'setBtns',
])
const formSubmit = () => {
  resetElectronicSeal(formItem.value)
  if (formItem.value.refuse) {
    formItem.value.refuse.comment = formItem.value.pass.comment
    formItem.value.refuse.signature = formItem.value.pass.signature
    formItem.value.refuse.seal = formItem.value.pass.seal
  }
  if (formItem.value.delegate) {
    formItem.value.delegate.comment = formItem.value.pass.comment
    formItem.value.delegate.signature = formItem.value.pass.signature
    formItem.value.delegate.seal = formItem.value.pass.seal
  }
  props.activeFlew.pass = JSON.parse(JSON.stringify(formItem.value.pass))
  props.activeFlew.delegate = JSON.parse(JSON.stringify(formItem.value.delegate))
  if(props.activeFlew.refuse){
    props.activeFlew.refuse = JSON.parse(JSON.stringify(formItem.value.refuse))
    props.activeFlew.back = JSON.parse(JSON.stringify(formItem.value.back))

  }


  handleCancel()
}
defineExpose({
  showItem,
})
</script>
<style lang="scss" scoped>
.dia {
  &-title {
    font-size: 14px;
    margin-bottom: 10px;

    span {
      font-size: 16px;
    }
  }

  &-btns {
    &-set {
      display: flex;
      align-items: center;
      margin-bottom: 10px;

      .set-btn {
        margin-left: 18px;
        font-size: 14px;
        color: #3894FF;
        cursor: pointer;
      }
    }

    .checkbox-item {
      margin-bottom: 10px;
    }
  }

  &-next {
    .next-title {
      display: flex;
      margin-bottom: 10px;
    }

    .next-bottom {
      display: flex;
      margin-bottom: 10px;

      .next-bottom-item+.next-bottom-item {
        margin-left: 40px;
      }

      &-item {
        display: flex;
        align-items: center;

        span {
          margin-left: 10px;
        }
      }
    }
  }

  &-bottom {
    display: flex;

    .bottom-item+.bottom-item {
      margin-left: 10px;
    }

    .bottom-item {
      width: calc(50% - 10px);

      span {
        display: inline-block;
        margin-bottom: 5px;
      }
    }
  }
}
</style>
