<template>
    <div class="items"
        :id="comDes.type == 'ROW' || comDes.type == 'SUBFORM' ? 'other' : comDes.type == 'ROW' ? 'others' : ''">
        <div class="box" :style="comDes.type === 'SPLIT_LINE' || comDes.type === 'BUTTON_CONNECTOR' ? 'padding:0 ' : ''" @click.stop="handleClick"
            :id="comDes.type == 'ROW' || comDes.type == 'SUBFORM' ? 'other' : comDes.type == 'ROW' ? 'others' : ''">
            <a-form-item :required="comDes.props.required" :hide-label="formConfs.titleStyle == 'hide' ? true : false"
                v-if="comDes.type !== 'ROW' && comDes.type !== 'EDITORS' && comDes.type !== 'TITLE' && comDes.type !== 'SPLIT_LINE' && comDes.type !== 'BUTTON_CONNECTOR'"
                :label="comDes.title">
                <component :is="comDes.component" :showEdit="false" :formConfs="formConfs" :newIndex="newIndex" :list="list"
                    :activeForm="activeForm" :comDes="comDes" />
            </a-form-item>
            <component v-else :is="comDes.component" :showEdit="false" :formConfs="formConfs" :newIndex="newIndex" :list="list"
                :activeForm="activeForm" :comDes="comDes" />
            <div class="des" v-if="comDes.type !== 'EDITORS' && comDes.type !== 'SPLIT_LINE' && comDes.type !== 'BUTTON_CONNECTOR'" v-html="safeDescription"></div>

        </div>
    </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
import { sanitizeHtml } from '@/utils/sanitizeHtml';
const props = defineProps<{
    comDes: any,
    newIndex: any,
    list: any,
    formConfs: any,
    activeForm: any,
}>()
const safeDescription = computed(() => sanitizeHtml(props.comDes?.props?.desc))
</script>
<style lang="scss" scoped>
@use "@/styles/textColor.scss" as textColor;

.box::v-deep {
    .arco-form-item {
        margin-bottom: 0;
    }
}

.box {
    padding: 12px 22px;
    border: 1px solid #fff;
    position: relative;

    .items {
        background-color: rgba(0, 0, 0, 0);

        .box {
            border-color: rgba(0, 0, 0, 0);
        }
    }

    .box-btns {
        position: absolute;
        right: -39px;
        top: 0;
        padding: 7px;
        z-index: 110;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0px 3px 14px 1px rgba(0, 0, 0, 0.06);

        :deep(.drawing-item-copy),
        :deep(.drawing-item-delete),
        :deep(.drawing-item-on),
        :deep(.drawing-item-up) {
            width: 24px;
            height: 24px;
            cursor: pointer;
            flex-shrink: 0;
        }

        :deep(.drawing-item-on) {
            margin-bottom: 14px;
            background-image: url("@/assets/designer/icon_shangyi.svg");
            background-repeat: no-repeat;
            background-size: 100% 100%;
        }

        :deep(.drawing-item-on:hover) {
            background-image: url("@/assets/designer/icon_shangyis.svg");
        }

        :deep(.drawing-item-up) {
            margin-bottom: 14px;
            background-image: url("@/assets/designer/icon_xiayi.svg");
            background-repeat: no-repeat;
            background-size: 100% 100%;
        }

        :deep(.drawing-item-up:hover) {
            background-image: url("@/assets/designer/icon_xiayis.svg");
        }

        :deep(.drawing-item-copy) {
            margin-bottom: 14px;
            background-image: url("@/assets/designer/icon_fuzhi.svg");
            background-repeat: no-repeat;
            background-size: 100% 100%;
        }

        :deep(.drawing-item-copy:hover) {
            background-image: url("@/assets/designer/icon_fuzhis.svg");
        }

        :deep(.drawing-item-delete) {
            background-image: url("@/assets/designer/icon_shanchu.svg");
            background-repeat: no-repeat;
            background-size: 100% 100%;
        }

        :deep(.drawing-item-delete:hover) {
            background-image: url("@/assets/designer/icon_shanchus.svg");
        }
    }
}

.active {
    border: 1px solid textColor.$ThemeTextColor !important;
    background-color: textColor.$ThemeBgColor;
}

.items {
    background-color: #fff;
}
</style>
