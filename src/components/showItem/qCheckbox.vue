<template>
  
    <a-checkbox-group :direction="comDes.props.direction" :disabled="comDes.props.disabled"
        v-model="comDes.props.value" :class="{ 'pic-mode': comDes.props.pic }">
        <template v-if="comDes.props.pic">
            <a-checkbox v-for="item in comDes.props.options" :key="item.value" :value="item.value">
                <div class="checkbox-pic-item">
                    <img v-if="item.path" :src="win.api.dowUrl + item.path + '&token=' + token" :alt="item.label"
                        class="checkbox-pic" />
                    <div class="checkbox-label">{{ item.label }}</div>
                </div>
            </a-checkbox>
        </template>
        <template v-else>
            <a-checkbox v-for="item in comDes.props.options" :key="item.value" :value="item.value">
                {{ item.label }}
            </a-checkbox>
        </template>
    </a-checkbox-group>
</template>

<script lang="ts" setup>
const token = localStorage.getItem("wornbench_token");
const win = window as any;
const props = defineProps<{
    comDes: any,
    formConfs: any,
}>()
const inputItem = () => {
    let val = props.comDes.defaultValue
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
    :deep(.arco-checkbox) {
        margin: 0 16px 16px 0;
    }

    :deep(.arco-checkbox .arco-checkbox-label) {
        padding: 0;
    }

    .checkbox-pic-item {
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

        .checkbox-pic {
            width: 56px;
            height: 56px;
            object-fit: cover;
            border-radius: 4px;
            margin-bottom: 6px;
        }

        .checkbox-label {
            font-size: 13px;
            color: rgba(0, 0, 0, 0.85);
        }
    }
}

:deep(.arco-checkbox-checked) {
    .checkbox-pic-item {
        border-color: textColor.$ThemeTextColor;
        background: rgba(var(--primary-6), 0.04);
        box-shadow: 0 2px 8px rgba(var(--primary-6), 0.2);
    }
}
</style>