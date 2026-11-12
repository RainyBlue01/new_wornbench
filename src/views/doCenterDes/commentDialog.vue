<template>
    <a-modal 
        v-model:visible="visible" 
        :title="'审批操作'" 
        @before-close="handleCancel" 
        :width="800" 
        :esc-to-close="false" 
        :append-to-body="true"
        :mask-closable="false" 
         @before-ok="handleApprove"
        class="approval-modal"
        :unmount-on-close="true"
    >
        <div class="approval-content">
            <a-form ref="refChangeForm" :style="{ width: '100%' }" :model="formData" :rules="rules" layout="vertical"
                scroll-to-first-error>
                <a-form-item field="approvalOpinion" label="审批意见" v-if="passData.comment">
                    <a-textarea v-model="formData.approvalOpinion" placeholder="请输入"
                        :auto-size="{ minRows: 3, maxRows: 6 }" class="approval-textarea" />
                </a-form-item>
                <a-form-item field="signatureImage" label="手写签名" v-if="passData.signature">
                    <div class="signature-container" ref="signatureContainer">
                        <VueSignaturePad
                            v-if="signaturePadMounted"
                            ref="signaturePad"
                            :options="signatureOptions"
                            :scale-to-device-pixel-ratio="false"
                            width="100%"
                            height="240px"
                        />
                        <div class="signature-actions">
                            <a-button size="small" @click="undoSignature">撤销</a-button>
                            <a-button size="small" @click="clearSignature">清屏</a-button>
                        </div>
                    </div>
                </a-form-item>
            </a-form>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from "vue";
import { Message } from "@arco-design/web-vue";
import { VueSignaturePad } from 'vue-signature-pad';
import { upload } from "@/api/user";

const visible = ref(false);
const formData = ref({
    approvalOpinion: '',
    signatureImage: ''
})
const passData = ref<any>({})
const rules = computed(() => {
    const r: Record<string, { required: boolean; message: string }[]> = {}
    if (passData.value?.comment) {
        r.approvalOpinion = [{ required: true, message: "请输入审批意见" }]
    }
    if (passData.value?.signature) {
        r.signatureImage = [{ required: true, message: "请完成手写签名" }]
    }
    return r
})
const classify = ref()
const refChangeForm = ref()
const signaturePad = ref<any>(null)
const signatureContainer = ref<HTMLDivElement>()
const signaturePadMounted = ref(false)
const emit = defineEmits(["approve", "cancel", "update:visible"]);

/** 与 signature_pad 默认策略一致：节流绘制 + 适度抽点，避免 throttle:0 造成卡顿 */
const signatureOptions = {
    penColor: "#000",
    minWidth: 2,
    maxWidth: 2,
    throttle: 16,
    minDistance: 4,
    dotSize: 1,
    velocityFilterWeight: 0,
    backgroundColor: "rgba(0,0,0,0)",
}

const mountSignaturePad = async () => {
    signaturePadMounted.value = false
    await nextTick()
    signaturePadMounted.value = true
    await nextTick()
    requestAnimationFrame(() => {
        signaturePad.value?.clearSignature?.()
    })
}

const unmountSignaturePad = () => {
    signaturePadMounted.value = false
    signaturePad.value = null
}

const props = defineProps<{
    modelValue?: boolean;
    signatureData?: string;
    sealData?: string;
}>();
const showItem = async (data: any, pass: any) => {
    passData.value = pass
    classify.value = data
    formData.value.approvalOpinion = ''
    formData.value.signatureImage = ''

    visible.value = true
    emit("update:visible", true)

    if (pass?.signature) {
        await mountSignaturePad()
    } else {
        unmountSignaturePad()
    }
};

const handleCancel = () => {
    visible.value = false;
    formData.value.approvalOpinion = ''
    formData.value.signatureImage = ''
    clearSignature()
    unmountSignaturePad()
    emit("update:visible", false);
    emit("cancel");
};
const handleApprove = (done: (closed?: boolean) => void) => {
    if (passData.value?.signature && signaturePad.value) {
        const { isEmpty, data } = signaturePad.value.saveSignature('image/png')

        if (isEmpty) {
            Message.warning('请完成手写签名')
            done(false)
            return
        }

        const file = base64ToFile(data)
        const formData1 = new FormData()
        const a = { folder: "appIcon" }
        const blobs = new Blob([JSON.stringify(a)], { type: "application/json" })
        formData1.append("fileProfile", blobs)
        formData1.append('file', file, 'signature.png')

        upload(formData1)
            .then((res: any) => {
                formData.value.signatureImage = res
                setData(done)
            })
            .catch(() => {
                Message.error('签名上传失败')
                done(false)
            })
        return
    }

    setData(done)
};
const setData = (done: (closed?: boolean) => void) => {
    refChangeForm.value?.validate((error: any) => {
        if (error) {
            done(false)
            return
        }
        emit("approve", classify.value, formData.value)
        formData.value.approvalOpinion = ''
        formData.value.signatureImage = ''
        clearSignature()
        unmountSignaturePad()
        emit("update:visible", false)
        done(true)
    })
};
// 撤销签名
const undoSignature = () => {
    if (signaturePad.value) {
        signaturePad.value.undoSignature()
    }
}

// 清除签名
const clearSignature = () => {
    if (signaturePad.value) {
        signaturePad.value.clearSignature()
    }
}

// Base64转File
const base64ToFile = (dataurl: string, filename = 'signature.png') => {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)?.[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n)

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([u8arr], filename, { type: mime || 'image/png' })
}

defineExpose({
    showItem,
    handleCancel,
});
</script>

<style lang="scss">
@use "../../styles/textColor.scss" as textColor;

.approval-modal {
    .arco-modal-header {
        padding: 16px 24px;
        border-bottom: 1px solid #e5e6eb;
    }

    .arco-modal-body {
        padding: 24px !important;
    }
}
</style>

<style lang="scss" scoped>
@use "../../styles/textColor.scss" as textColor;

.approval-content {
    width: 100%;

    .approval-section {
        margin-bottom: 24px;

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }

        .section-title {
            font-size: 14px;
            font-weight: 500;
            color: #1d2129;
            margin-bottom: 12px;
        }

        .section-actions {
            display: flex;
            gap: 8px;

            .arco-btn {
                font-size: 12px;
                padding: 4px 12px;
            }
        }

        .approval-textarea {
            width: 100%;
        }

        .signature-area {
            border: 1px solid #e5e6eb;
            border-radius: 4px;
            padding: 16px;
            min-height: 200px;
            background-color: #fafafa;

            .signature-canvas {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 160px;

                .signature-img {
                    max-width: 100%;
                    max-height: 160px;
                }

                .signature-placeholder {
                    color: #86909c;
                    font-size: 14px;
                }
            }
        }

        .seal-area {
            border: 1px solid #e5e6eb;
            border-radius: 4px;
            padding: 24px;
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #fafafa;

            .seal-img {
                max-width: 200px;
                max-height: 200px;
            }

            .seal-placeholder {
                color: #86909c;
                font-size: 14px;
            }
        }
    }

    .approval-note {
        font-size: 12px;
        color: #86909c;
        margin-bottom: 24px;
        line-height: 1.6;
    }
}

.signature-container {
    width: 100%;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;
     background-color: #fafafa;
    touch-action: none;
    isolation: isolate;

    :deep(canvas) {
        display: block;
        width: 100% !important;
        height: 240px !important;
        touch-action: none;
        cursor: crosshair;
    }

    .signature-actions {
        display: flex;
        gap: 8px;
        padding: 8px 12px;
        background-color: #f7f8fa;
        border-top: 1px solid #e5e6eb;
    }
}

.approval-footer {
    display: flex;
    width: 100%;
    justify-content: flex-end;

    button+button {
        margin-left: 10px;
    }
}
</style>