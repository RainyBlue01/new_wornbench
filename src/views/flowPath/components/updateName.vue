<template>
    <base-modal ref="modalRef" @handle-ok="formSubmit" @handle-cancel="handleCancel">
        <div class="dia">
            <div class="dia-item" v-if="formItem.pass">
                <div class="dia-item-left">
                    <a-button type="primary" class="pass">{{ formItem.pass.label }}</a-button>
                </div>
                <a-input v-model="formItem.pass.label" placeholder="通过"></a-input>
            </div>
            <div class="dia-item" v-if="formItem.refuse">
                <div class="dia-item-left">
                    <a-button type="primary" class="refuse">{{ formItem.refuse.label }}</a-button>
                </div>
                <a-input v-model="formItem.refuse.label" placeholder="拒绝"></a-input>
            </div>
            <div class="dia-item" v-if="formItem.delegate">
                <div class="dia-item-left">
                    <a-button type="primary" class="delegate">{{ formItem.delegate.label }}</a-button>
                </div>
                <a-input v-model="formItem.delegate.label" placeholder="转交"></a-input>
            </div>
            <div class="dia-item" v-if="formItem.back">
                <div class="dia-item-left">
                    <a-button type="primary" class="back">{{ formItem.back.label }}</a-button>
                </div>

                <a-input v-model="formItem.back.label" placeholder="退回"></a-input>
            </div>
        </div>
    </base-modal>
</template>
<script setup lang="ts">
import { ref } from 'vue'

interface FormItem {
    pass?: {
        label: string
    }
    refuse?: {
        label: string
    }
    delegate?: {
        label: string
    }
    back?: {
        label: string
    }
}

const formItem = ref<FormItem>({})
const modalRef = ref()
const emits = defineEmits([
    'setNames',
])
const showItem = (item: any) => {
    formItem.value = JSON.parse(JSON.stringify(item))
    modalRef.value.handleClick({
        title: '操作按钮别名配置',
        okText: '确认',
        cancelText: '取消',
        showBtn: true,
        width: '500px',
    })
}
const handleCancel = () => {
    modalRef.value.handleClose()
}
const formSubmit = () => {
    emits('setNames', formItem.value)
    handleCancel()
}
defineExpose({
    showItem,
})
</script>
<style lang="scss" scoped>
@use "@/styles/textColor.scss" as textColor;

.dia {
    .dia-item+.dia-item {
        margin-top: 10px;
    }

    &-item {
        width: 100%;
        display: flex;

        &-left {
            min-width: 64px;
            margin-right: 10px;

            div {
                min-height: 18px;
                line-height: 18px;
                padding: 6px 14px;
                font-size: 12px;
                border-radius: 3px;
                margin-right: 10px;
                color: #fff;

            }
        }

    }
}
</style>