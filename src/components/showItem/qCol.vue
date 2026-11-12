<template>
  <a-col id="other" v-if="showEdit" :class="activeForm.id == comDes.id ? 'qCol active' : 'qCol'"
    @click.stop="handleClick" v-bind="comDes.props">
    <draggable class="drawing-board" @add="add" :clone="cloneComponent" draggable=".items" :list="comDes.children"
      :animation="340" group="componentsGroup">
      <div class="items" v-for="(item, index) in comDes.children" :key="index + 'i'">
        <showItem :deptList="deptList" :newIndex="index" :showEdit="showEdit" :list="comDes.children"
          :formConfs="formConfs" :activeForm="activeForm" :comDes="item" />
      </div>

    </draggable>
    <div class="box-btns field-actions" v-show="activeForm.id == comDes.id">
      <button type="button" title="上移" class="field-action-btn move" v-if="newIndex !== 0" @click.stop="onItem">
        <i class="fas fa-arrow-up" aria-hidden="true" />
      </button>
      <button type="button" title="下移" class="field-action-btn move" v-if="newIndex + 1 !== list.length"
        @click.stop="upItem">
        <i class="fas fa-arrow-down" aria-hidden="true" />
      </button>
      <button type="button" title="复制" class="field-action-btn move" @click.stop="copyItem">
        <i class="fas fa-copy" aria-hidden="true" />
      </button>
      <button type="button" title="删除" class="field-action-btn" @click.stop="deleteItem">
        <i class="fas fa-trash-alt" aria-hidden="true" />
      </button>
    </div>
  </a-col>
  <a-col id="other" v-if="!showEdit" class="qCols" v-bind="comDes.props">
    <div class="grid-column-fields">
      <div class="grid-field-item" v-for="(item, index) in comDes.children" :key="item.id || index">
        <showItem :deptList="deptList" :showEdit="showEdit" :newIndex="index" :list="comDes.children"
          :formConfs="formConfs" :activeForm="activeForm" :comDes="item" />
      </div>
    </div>
  </a-col>
</template>

<script lang="ts" setup>
import { ref, inject } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'
const props = defineProps<{
  comDes: any,
  activeForm: any,
  showEdit: any,
  deptList: any,
  formConfs: any,
  newIndex: any,
  list: any,
}>()
const provideState = inject("provideDesigner") as {
  handleClick: (...args: any) => void;
  copyItem: (...args: any) => void;
  deleteItem: (...args: any) => void;
  drawingItemon: (...args: any) => void;
  drawingItemup: (...args: any) => void;
};
const handleClick = () => {
  provideState.handleClick(props.comDes)
}
const add = () => {
  setData(props.comDes.children)
  // let formList = JSON.parse(JSON.stringify(props.formConfs.formList))
  // props.formConfs.formList = ''
  // setTimeout(() => {
  //   props.formConfs.formList = formList
  // })
}
const setData = (list: any) => {
  list.map((v: any) => {
    let item = v.id.split('.')
    if (item.length > 1) {
      v.id = item[1]
      v.props.field = v.id
    }
    if (v.children && v.type !== 'SUBFORM') {
      setData(v.children)
    }

  })
}

const copyItem = () => {
  provideState.copyItem(props.comDes, props.list)
}
const deleteItem = () => {
  provideState.deleteItem(props.newIndex, props.list)
}
const onItem = () => {
  provideState.drawingItemon(props.newIndex, props.list, props.comDes)
}
const upItem = () => {
  provideState.drawingItemup(props.newIndex, props.list, props.comDes)
}
const cloneComponent = (origin: any) => {
  return origin
}
</script>

<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

.qCol {
  min-height: 60px;
  height: 100%;
  padding: 15px 5px !important;
  border: 1px #00152914 dashed;

  .drawing-board {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 60px;
    height: 100%;
  }

  .drawing-board>.items> :deep(div > .box) {
    padding-top: 8px;
    padding-bottom: 8px;
  }

  position: relative;

  .box-btns {
    position: absolute;
    top: 5px;
    right: 8px;
    z-index: 110;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    padding: 0;
    background: transparent;
    box-shadow: none;
  }

  .field-action-btn {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: #fff;
    color: #64748b;
    cursor: pointer;
    font-size: 11px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    padding: 0;
    transition: all 0.15s;

    &.move:hover {
      color: rgb(var(--primary-6));
      background: #eff6ff;
    }

    &:not(.move):hover {
      color: #ef4444;
      background: #fef2f2;
    }
  }
}

.active {
  border: 1px solid textColor.$ThemeTextColor;
  background-color: textColor.$ThemeBgColor;
}

.grid-column-fields {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.grid-field-item+.grid-field-item {
  margin-top: 16px;
}
</style>
