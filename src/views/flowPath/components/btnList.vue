<template>
    <div class="btnList">
        <div
            :class="['form-designer-btn-list-item', { active: inputButton.pass.enable }]"
        >
            <div class="item-left">
                <a-checkbox v-model="inputButton.pass.enable">{{ inputButton.pass.label }}</a-checkbox>
            </div>
            <div class="item-right">
                <icon-settings />
            </div>
        </div>
        <div
            v-if="inputButton.refuse"
            :class="['form-designer-btn-list-item', { active: inputButton.refuse.enable }]"
        >
            <div class="item-left">
                <a-checkbox v-model="inputButton.refuse.enable">{{ inputButton.refuse.label }}</a-checkbox>
            </div>
            <div class="item-right">
                <icon-settings />
            </div>
        </div>
        <div
            :class="['form-designer-btn-list-item', { active: inputButton.delegate.enable }]"
        >
            <div class="item-left">
                <a-checkbox v-model="inputButton.delegate.enable">{{ inputButton.delegate.label }}</a-checkbox>
            </div>
            <div class="item-right">
                <icon-settings />
            </div>
        </div>
        <div
            v-if="inputButton.back"
            :class="['form-designer-btn-list-item', { active: inputButton.back.enable }]"
        >
            <div class="item-left">
                <a-checkbox v-model="inputButton.back.enable">{{ inputButton.back.label }}</a-checkbox>
            </div>
            <div class="item-right">
                <icon-settings />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
defineProps<{
    inputButton: any,
}>()
</script>

<style lang="scss" scoped>
@use "@/styles/form-designer.scss";
</style>
