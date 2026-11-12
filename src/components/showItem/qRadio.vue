<template>
    <a-radio-group :direction="comDes.props.direction" :disabled="comDes.props.disabled"  @change="inputItem" v-model="comDes.props.value" :class="{ 'pic-mode': comDes.props.pic }">
        <div v-if="comDes.props.pic">
            <a-radio v-for="item in comDes.props.options" :key="item.value" :value="item.value">
                <div class="radio-pic-item">
                    <img v-if="item.path" :src="win.api.dowUrl + item.path + '&token=' + token" :alt="item.label" class="radio-pic" />
                    <div class="radio-label">{{ item.label }}</div>
                </div>
            </a-radio>
        </div>
           <div v-else>
            <a-radio v-for="item in comDes.props.options" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-radio>
        </div>
    </a-radio-group>
</template>
  
<script lang="ts" setup>
const props = defineProps<{
    comDes: any,
    formConfs: any,
}>()
const token = localStorage.getItem("wornbench_token");
const win = window as any;
const inputItem = () => {
    let val = props.comDes.value
    if (props.comDes.method.input) {
        try {
            // eval(props.comDes.method.input);
        } catch (error) {
            console.error('代码执行出错:', error);
        }
    }
}
</script>
  
<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

.pic-mode {
    :deep(.arco-radio) {
        margin: 0 16px 16px 0;
    }

    :deep(.arco-radio .arco-radio-label) {
        padding: 0;
    }

    .radio-pic-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 8px;
        border: 1px solid #e8e8e8;
        border-radius: 8px;
        transition: all 0.3s;
        min-width: 80px;

        &:hover {
            border-color: textColor.$ThemeTextColor;
            box-shadow: 0 2px 8px rgba(var(--primary-6), 0.15);
        }

        .radio-pic {
            width: 56px;
            height: 56px;
            object-fit: cover;
            border-radius: 4px;
            margin-bottom: 6px;
        }

        .radio-label {
            margin-top: 4px;
            font-size: 13px;
            color: rgba(0, 0, 0, 0.85);
        }
    }
}

:deep(.arco-radio-checked) {
    .radio-pic-item {
        border-color: textColor.$ThemeTextColor;
        background: rgba(var(--primary-6), 0.04);
        box-shadow: 0 2px 8px rgba(var(--primary-6), 0.2);
    }
}
</style>
  