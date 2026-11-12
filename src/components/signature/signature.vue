<template>
    <a-modal width="1040px" v-model:visible="visible">
        <template #title>
            <div class="title">
                手写签名
            </div>
        </template>
        <div class="body" ref="signatureContainer">
            <VueSignaturePad 
                :options="signatureOptions" 
                width="100%" 
                height="300px" 
                ref="signaturePad" 
            />
        </div>

        <template #footer>
            <a-space>
                <a-button @click="undo">撤销</a-button>
                <a-button @click="clear">清屏</a-button>
                <a-button @click="save">保存</a-button>
            </a-space>

        </template>
    </a-modal>
</template>
<script lang="ts" setup>
import { ref, inject, nextTick } from 'vue'
import { upload } from "@/api/user";
import { VueSignaturePad } from 'vue-signature-pad'
const props = defineProps<{
    comDes: any,
    showEdit: any,
}>()
const provideState = inject("provideDesigner") as {
    setPropsItem: (...args: any) => void;
    filterData: (...args: any) => void;
};
const provideItem = inject("provideSignatureImage") as {
    setPropsItem: (...args: any) => void;
};
const visible = ref(false)
const signatureContainer = ref<HTMLDivElement>()
// 深度优化签名配置，最大化绘制流畅度
const signatureOptions = {
    penColor: "#000",
    minWidth: 1, // 固定笔触宽度，减少计算开销
    maxWidth: 1, // 与 minWidth 相同，避免动态宽度计算
    throttle: 0, // 移除节流，使用原生性能
    dotSize: 1, // 减小点的大小
    velocityFilterWeight: 0.7, // 降低速度过滤权重，提高响应速度
    minDistance: 12, // 进一步增大最小距离，大幅减少绘制点数量
}


const signaturePad = ref<any>(null)

const undo = () => {
    signaturePad.value.undoSignature()
}
const save = () => {
    const { isEmpty, data } = signaturePad.value.saveSignature('image/png')

    if (!isEmpty) {
        let file = base64ToFile(data)
        const formData1 = new FormData();
        const a = {
            folder: "appIcon",
        };
        const json = JSON.stringify(a);
        // 将 json 字符串转化为 Blob 对象
        const blobs = new Blob([json], {
            type: "application/json",
        });
        formData1.append("fileProfile", blobs);
        formData1.append('file', file, 'signature.png');
        upload(formData1).then((res) => {
            if(props.comDes.id){
 provideState.setPropsItem(props.comDes.id, 'value', res)
            }else{
                provideItem.setPropsItem(res) 
            }
            visible.value = false
            clear()
            if (!props.showEdit) {
                provideState.filterData(props.comDes)
            }
        });
    }
}
const clear = () => {
    signaturePad.value.clearSignature()
}
const base64ToFile = (dataurl, filename = 'signature.png') => {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n)

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([u8arr], filename, { type: mime })
}
const showItem = (item: any) => {
    visible.value = true
    // 使用 nextTick 确保 DOM 更新后再设置 canvas 尺寸
    nextTick(() => {
        setTimeout(() => {
            const canvasElements = document.getElementsByTagName('canvas')
            if (canvasElements && canvasElements.length > 0) {
                const lastCanvas = canvasElements[canvasElements.length - 1]
                // 直接设置尺寸，避免 requestAnimationFrame 的额外开销
                lastCanvas.width = 1000
                lastCanvas.height = 300
                // 重置签名板以确保配置生效
                signaturePad.value?.clearSignature()
                
                // 强制重绘 Canvas，解决某些浏览器的渲染问题
                lastCanvas.style.display = 'none'
                lastCanvas.offsetHeight // 触发重排
                lastCanvas.style.display = 'block'
            }
        }, 50)
    })
}
defineExpose({
    showItem,
})
</script>
<style lang="scss" scoped>
@use "../../styles/textColor.scss" as textColor;

.body {
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    width: calc(100% - 2px);
    height: 300px;
    // 启用硬件加速
    transform: translateZ(0);
    will-change: auto;
    // 防止触摸事件延迟
    touch-action: none;
}

.title {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
}
</style>