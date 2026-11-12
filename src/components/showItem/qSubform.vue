<template>
    <!-- 设计态：横向 -->
    <div class="subform" v-if="showEdit && !isVerticalLayout">
        <draggable class="drawing-board" id="other" @end="end" :sort="true" draggable=".table-line" :options="options"
            :list="comDes.children" @add="handleSubformAdd" :animation="340" group="componentsGroup">

            <div :class="activeForm.id == item.id ? 'table-line active' : 'table-line'" @click.stop="handleClick(item)"
                v-for="(item, index) in comDes.children" :key="item.renderKey"
                :style="item.type == 'ADDRESS' || item.type == 'DATE_INTERVAL' || item.type == 'TIME_INTERVAL' ? 'width:450px' : ''">
                <div class="table-title"
                    :style="item.type == 'ADDRESS' || item.type == 'DATE_INTERVAL' || item.type == 'TIME_INTERVAL' ? 'width:430px' : ''">
                    <div class="titles">
                        <span class="redHreat">{{ item.props.required ? '*' : '' }}</span> {{ item.title }}
                    </div>
                    <div class="icons">
                        <button type="button" title="复制" class="field-action-btn copy" @click.stop="copyItem(item)">
                            <i class="fas fa-copy" aria-hidden="true" />
                        </button>
                        <button type="button" title="删除" class="field-action-btn delete"
                            @click.stop="deleteItem(index)">
                            <i class="fas fa-trash-alt" aria-hidden="true" />
                        </button>
                    </div>
                </div>
                <div class="table-body"
                    :style="item.type == 'ADDRESS' || item.type == 'DATE_INTERVAL' || item.type == 'TIME_INTERVAL' ? 'max-width:450px' : ''">
                    <component :is="item.component" :deptList="deptList" @change="inputItem(item)" :showEdit="showEdit"
                        :formConfs="formConfs" :newIndex="index" :list="comDes.children" :activeForm="activeForm"
                        :comDes="item" />
                </div>
            </div>
            <div v-show="!comDes.children || !comDes.children.length" class="empty-item">从左侧拖拽字段来构建</div>
        </draggable>
    </div>

    <!-- 设计态：竖向 -->
    <div class="subform subform--vertical" style="width: 100%;" v-else-if="showEdit && isVerticalLayout">

        <draggable class="drawing-board drawing-board--vertical" id="other" :sort="true"
            draggable=".table-line-vertical" :options="options" :list="comDes.children" @add="handleSubformAdd"
            :animation="340" group="componentsGroup">
            <div :class="activeForm.id == item.id ? 'table-line-vertical active' : 'table-line-vertical'"
                @click.stop="handleClick(item)" v-for="(item, index) in comDes.children" :key="item.renderKey">
                <div class="table-title">
                    <div class="titles">
                        <span class="redHreat">{{ item.props.required ? '*' : '' }}</span> {{ item.title }}
                    </div>
                    <div class="icons">
                        <a-tooltip content="复制" position="top">
                            <button type="button" class="field-action-btn copy" @click.stop="copyItem(item)">
                                <i class="fas fa-copy" aria-hidden="true" />
                            </button>
                        </a-tooltip>
                        <a-tooltip content="删除" position="top">
                            <button type="button" class="field-action-btn delete" @click.stop="deleteItem(index)">
                                <i class="fas fa-trash-alt" aria-hidden="true" />
                            </button>
                        </a-tooltip>
                    </div>
                </div>
                <div class="table-body">
                    <component :is="item.component" :deptList="deptList" @change="inputItem(item)" :showEdit="showEdit"
                        :formConfs="formConfs" :newIndex="index" :list="comDes.children" :activeForm="activeForm"
                        :comDes="item" />
                </div>
            </div>
            <div v-if="!comDes.children || !comDes.children.length" class="empty-item empty-item--vertical">
                从左侧拖拽字段来构建
            </div>
        </draggable>
    </div>

    <!-- 填写态：横向 -->
    <div class="tables" v-else-if="!showEdit && !isVerticalLayout">
        <div class="table-other">
            <div class="table-title">
                <div class="left-top"></div>
                <div class="titles" v-for="(item, index) in comDes.list[0]" :key="index + 'j'" v-show="!item.showItem"
                    :style="item.type == 'ADDRESS' || item.type == 'DATE_INTERVAL' || item.type == 'TIME_INTERVAL' ? 'width:400px' : ''">
                    <span class="redHreat">{{ item.props.required ? '*' : '' }}</span> {{ item.title }}
                </div>
                <div class="right-top" v-if="comDes.props.addRow"></div>
            </div>
            <div class="table-body">
                <div class="table-body-item" v-for="(line, index1) in comDes.list" :key="index1 + 'itemsa'">
                    <div class="left-bottom">{{ index1 + 1 }} </div>
                    <div class="table-bodys" v-for="(item, index1a) in line" :key="index1a + 'itemsaa'"
                        v-show="!item.showItem"
                        :style="item.type == 'ADDRESS' || item.type == 'DATE_INTERVAL' || item.type == 'TIME_INTERVAL' ? 'width:400px;' : ''">
                        <!-- <a-form-item label="" :field="item.id" :hide-label="true">
                            <component :is="item.component" @change="inputItem(item)" :formConfs="formConfs"
                                :deptList="deptList" :showEdit="showEdit" :activeForm="activeForm" :comDes="item" />
                        </a-form-item> -->
                        <showSubItem :comDes="item" :comDesList="comDes" :activeForm="activeForm" :deptList="deptList"
                            :showEdit="showEdit" :formConfs="formConfs" />
                    </div>
                    <div class="right-bottom" v-if="comDes.props.addRow && !comDes.props.disabled"> <a-button
                            @click="deleteLine(index1)"> <template #icon>
                                <i class="fas fa-trash-alt" aria-hidden="true" />
                            </template></a-button></div>
                </div>
            </div>
        </div>
        <div class="bottom" v-if="comDes.props.addRow && !comDes.props.disabled">
            <a-button class="btn-form-items" type="primary" @click="addLine">新增</a-button>
        </div>
    </div>

    <!-- 填写态：竖向 -->
    <div class="tables tables--vertical" v-else>
        <div class="table-other table-other--vertical">
            <div class="table-body">
                <div class="table-body-item table-body-item--vertical" v-for="(line, index1) in comDes.list"
                    :key="index1 + 'itemsa'">
                    <div class="left-bottom">{{ index1 + 1 }}</div>
                    <div class="table-vertical-fields">
                        <div class="table-vertical-field" v-for="(item, index1a) in line" :key="index1a + 'itemsaa'"
                            v-show="!item.showItem">
                            <div class="table-vertical-label">
                                <span class="redHreat">{{ item.props.required ? '*' : '' }}</span>
                                {{ item.title }}
                            </div>
                            <div class="table-vertical-body">
                                <showSubItem :comDes="item" :comDesList="comDes" :activeForm="activeForm"
                                    :deptList="deptList" :showEdit="showEdit" :formConfs="formConfs" />
                            </div>
                        </div>
                    </div>
                    <div class="right-bottom" v-if="comDes.props.addRow && !comDes.props.disabled">
                        <a-button @click="deleteLine(index1)">
                            <template #icon>
                                <i class="fas fa-trash-alt" aria-hidden="true" />
                            </template>
                        </a-button>
                    </div>
                </div>
            </div>
        </div>
        <div class="bottom" v-if="comDes.props.addRow && !comDes.props.disabled">
            <a-button class="btn-form-items" type="primary" @click="addLine">新增</a-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import { inject, computed } from 'vue'
import { Message } from '@arco-design/web-vue';
import { executeFieldScript } from '@/utils/fieldScriptExecutor'
const props = defineProps<{
    comDes: any,
    activeForm: any,
    deptList: any,
    showEdit: any,
    formConfs: any,
    newIndex?: number,
    list?: any[]
}>()
const SUBFORM_DISABLED_MESSAGE = '子表单不能添加栅格布局,标题，分割线,按钮,业务组件及子表单组件'
const SUBFORM_DISABLED_TYPES = new Set([
    'ROW',
    'COL',
    'SUBFORM',
    'SPLIT_LINE',
    'TITLE',
    'BUTTON_CONNECTOR',
    'JSON_SCHEMA',
    'USER',
    'USER_MULTIPLE',
    'DEPT',
    'DEPT_MULTIPLE',
])

const isSubformDisallowedType = (type: string) => SUBFORM_DISABLED_TYPES.has(type)

const getSourceListFromEvent = (event: any) => {
    return event?.from?.__draggable_component__?.realList || null
}

const restoreDraggedItem = (event: any, item: any) => {
    if (!event || event.pullMode === 'clone' || !item) {
        return false
    }
    const sourceList = getSourceListFromEvent(event)
    if (!Array.isArray(sourceList)) {
        return false
    }
    const insertIndex = typeof event.oldIndex === 'number' ? event.oldIndex : sourceList.length
    sourceList.splice(insertIndex, 0, item)
    return true
}

const findDraggedItemIndex = (draggedItem: any, fallbackIndex: number) => {
    const matchedIndex = props.comDes.children.findIndex((child: any) =>
        child === draggedItem || (!!child?.id && child.id === draggedItem?.id),
    )
    return matchedIndex > -1 ? matchedIndex : fallbackIndex
}

const removeDisallowedChild = (event: any) => {
    const fallbackIndex = typeof event?.newIndex === 'number' ? event.newIndex : props.comDes.children.length - 1
    const draggedItem = event?.item?._underlying_vm_ || props.comDes.children[fallbackIndex]
    if (!isSubformDisallowedType(draggedItem?.type)) {
        return false
    }
    const targetIndex = findDraggedItemIndex(draggedItem, fallbackIndex)
    props.comDes.children.splice(targetIndex, 1)
    restoreDraggedItem(event, draggedItem)
    return true
}

const isVerticalLayout = computed(() => props.comDes.props?.freezingColumn === 'last')
const addLine = () => {
    let children = JSON.parse(JSON.stringify(props.comDes.children))
    children.map((v: { id: any; field: any; }) => {
        let id = JSON.parse(JSON.stringify(v.id))
        v.field = JSON.parse(JSON.stringify(v.id))
        v.id = id + props.comDes.list.length

    })
    props.comDes.list.push(children)

    provideState.setRulesItem(children)
}

const options = {
    scroll: true,
}
const inputItem = async (item: any) => {
    if (item.method.input) {
        try {
            await executeFieldScript(item.method.input, {
                field: item,
                formConfs: props.formConfs,
                value: item.props?.value,
                oldValue: undefined,
                provideState,
            })
        } catch (error) {
            console.error('代码执行出错:', error);
        }
    }
    if (!props.showEdit) {
        let values = {}
        props.comDes.list.map((v: any[]) => {
            v.map((v1: { id: string; props: { value: any; }; }) => {
                let id = v1.id.split('.')
                values[id[1]] = v1.props.value
            })
        })
        props.comDes.props.value = values
        provideState.filterData(props.comDes)
        // provideState.filterData(item)
    }

}
const deleteLine = (index: any) => {
    props.comDes.list.splice(index, 1)
}
const provideState = inject("provideDesigner") as {
    handleClick: (...args: any) => void;
    copyItem: (...args: any) => void;
    deleteItem: (...args: any) => void;
    drawingItemon: (...args: any) => void;
    drawingItemup: (...args: any) => void;
    filterData: (...args: any) => void;
    setRulesItem: (...args: any) => void;
};
const handleClick = (item: any) => {
    provideState.handleClick(item)
}
const copyItem = (item: any) => {
    provideState.copyItem(item, props.comDes.children)
}
const deleteItem = (index: any) => {
    provideState.deleteItem(index, props.comDes.children)
}
const end = (e: any) => {
    console.log(e.to, e.item)
}

const handleSort = (e: any) => {
    console.log(e.to, e.item)
}

const handleSubformAdd = (event: any) => {
    if (removeDisallowedChild(event)) {
        Message.error(SUBFORM_DISABLED_MESSAGE)
        return
    }
    if (props.comDes.children && props.comDes.children.length > 0) {
        props.comDes.children.map((v: { id: string; props: { field: any; }; }) => {
            let item = v.id.split('.')
            if (item.length == 1) {
                v.id = props.comDes.id + '.' + v.id
                v.props.field = v.id
            }
        })
    }
}

// watch(() => props.comDes, (newVal, oldVal) => {
//     props.comDes.children.map((v: any, index: any) => {
//         console.log(v.type, 'v.type')
//         if (v.type == 'ROW' || v.type == 'SUBFORM' || v.type == 'COL' || v.type == 'SPLIT_LINE' || v.type == 'TITLE' || v.type == 'BUTTON_CONNECTOR' || v.type == 'JSON_SCHEMA') {
//             Message.error('子表单不能添加栅格布局,标题，分割线,按钮,业务组件及子表单组件')
//             props.comDes.children.splice(index, 1)
//             // let formList = JSON.parse(JSON.stringify(props.formConfs.formList))
//             // props.formConfs.formList = ''
//             // setTimeout(() => {
//             //     props.formConfs.formList = formList
//             // })

//         }
//     }
//     )
// }, { deep: true })
const add = (e: any) => {

    if (e.to.id == e.item.id) {
        Message.error('子表单不能添加栅格布局,标题，分割线,按钮,业务组件及子表单组件')
        props.comDes.children.map((v: any, index: any) => {
            if (v.type == 'ROW' || v.type == 'SUBFORM' || v.type == 'COL' || v.type == 'SPLIT_LINE' || v.type == 'TITLE' || v.type == 'BUTTON_CONNECTOR' || v.type == 'JSON_SCHEMA') {
                props.comDes.children.splice(index, 1)
                // let formList = JSON.parse(JSON.stringify(props.formConfs.formList))
                // props.formConfs.formList = ''
                // setTimeout(() => {
                //     props.formConfs.formList = formList
                // })

            }
        }
        )
    } else {
        if (props.comDes.children && props.comDes.children.length > 0) {
            props.comDes.children.map((v: { id: string; props: { field: any; }; }, index: any) => {
                let item = v.id.split('.')
                if (item.length == 1) {
                    v.id = props.comDes.id + '.' + v.id
                    v.props.field = v.id
                }
            });
            // let formList = JSON.parse(JSON.stringify(props.formConfs.formList))
            // props.formConfs.formList = ''
            // setTimeout(() => {
            //     props.formConfs.formList = formList
            // }, 100)
        }
    }


}
</script>

<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

.bottom {
    display: flex;
}

.subform {
    border: 1px solid #DCE0E7;
    display: inline-flex;
    border-radius: 8px;
    max-width: 100%;
    min-width: 220px;

    .drawing-board {
        width: calc(100%);
        display: flex;
        overflow-x: auto;
    }

    .left {
        width: 53px;

        .left-top {
            width: 100%;
            height: 34px;
            border-bottom: 1px solid #DCE0E7;
            border-radius: 8px 8px 0 0;
            background: #f8fafc !important;
            color: #64748b;
            font-size: 12px;
            font-weight: 600;
        }

        .left-bottom {
            width: 100%;
            height: 48px;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
    }

    .table-line {
        width: 220px;
        flex-shrink: 0;

        .table-title {
            width: calc(100% - 20px);
            height: 34px;
            line-height: 34px;
            padding: 0 10px;
            border-bottom: 1px solid #DCE0E7;
            display: flex;
            justify-content: space-between;
            background: #f8fafc !important;
            color: #64748b;
            font-size: 12px;
            font-weight: 600;
            border-radius: 8px 8px 0 0;

            i {
                cursor: pointer;
            }
        }

        .table-body {
            min-height: 48px;
            display: flex;
            padding: 5px 10px;
            align-items: center;
        }
    }
}

.subform--vertical {
    display: inline-flex;
    min-width: 280px;

    .drawing-board--vertical {
        width: calc(100%);
        display: flex;
        border-radius: 8px;
        flex-direction: column;
        overflow-x: hidden;
        overflow-y: auto;
    }

    .left {
        border-right: 1px solid #e2e8f0;

        .left-top {
            background: rgba(0, 0, 0, 0) !important;
            border-bottom: 0;
        }
    }

    .table-line-vertical {
        width: 100%;
        border-left: 3px solid rgba(0, 0, 0, 0);
        border-bottom: 1px solid #e2e8f0;

        &:last-child {
            border-bottom: 0;
        }


        .table-title {
            width: auto;
            height: 34px;
            line-height: 34px;
            padding: 0 10px;
            border-bottom: 0px solid #DCE0E7;
            display: flex;
            justify-content: space-between;
            color: #64748b;
            font-size: 12px;
            font-weight: 600;
        }

        .table-body {
            min-height: 48px;
            padding: 8px 10px 12px;
        }
    }

    .empty-item--vertical {
        width: 100%;
        height: auto;
        min-height: 82px;
    }
}

.empty-item {
    width: calc(100% - 53px);
    display: flex;
    align-items: center;
    height: 82px;
    padding: 0 10px;
}

.icons {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}

.field-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 26px;
    padding: 0;
    border: none;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0);
    color: #64748b;
    // box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    font-size: 11px;
    transition: all 0.15s;
}

.field-action-btn.copy:hover {
    // background: #eff6ff;
    color: rgb(var(--primary-6));
}

.field-action-btn.delete:hover {
    //  background: #fef2f2;
    color: #ef4444;
}

.active {
    background: #eff6ff !important;
    border-left: 3px solid rgb(var(--primary-6)) !important;
}

.bottom {
    //  margin-top: 10px;
}

.btn-form-items {
    color: #fff;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background-color: #f8fafc !important;
    color: #64748b !important;
    border: 1px solid #e2e8f0 !important;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    line-height: 1;
    border-radius: 8px;

    position: relative;
    overflow: hidden;

    &:hover {
        background-color: #E5E6EB !important;
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.5s ease;
    }
}

.tables {
    margin-bottom: 15px;
    max-width: 100%;

}

.table-other {
    margin: 10px 0;
    border: 1px solid #DCE0E7;
    flex-wrap: nowrap;
    border-radius: 8px;
    overflow-x: auto;
    max-width: 100%;
    display: inline-block;

    .table-title {
        display: flex;
        width: 100%;

        color: #64748b;
        font-size: 12px;
        font-weight: 600;

        .left-top {
            width: 53px;
            height: 34px;
            flex-shrink: 0;
            background: #f8fafc !important;
        }

        .titles {
            width: 220px;
            height: 34px;
            flex-shrink: 0;
            line-height: 34px;
            padding: 0 10px;
            background: #f8fafc !important;
            // display: flex;
            // justify-content: space-between;
            flex-shrink: 0;

        }

        .right-top {
            width: 53px;
            background: #f8fafc !important;

            height: 34px;
            flex-shrink: 0;
        }
    }

    .table-body {
        .table-body-item {
            display: flex;

            .left-bottom {
                width: 53px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                border-top: 1px solid #e2e8f0;
            }

            .table-bodys {
                width: 220px;
                min-height: 32px;
                display: flex;
                border-top: 1px solid #e2e8f0;
                padding: 10px;
                // align-items: center;
                display: flex;
                // align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .right-bottom {
                width: 33px;
                padding: 10px;
                flex-shrink: 0;
                display: flex;
                border-top: 1px solid #e2e8f0;
                justify-content: center;
            }
        }
    }

    .table-last {
        .last-titles {
            width: 100%;
            height: 34px;
            line-height: 34px;
            padding: 0 10px;
            border-bottom: 1px solid #DCE0E7;
            display: flex;
            justify-content: space-between;

            i {
                cursor: pointer;
            }
        }

        .table-last-item+.table-last-item {
            border-top: 1px solid #DCE0E7;
        }

        .table-last-item {

            .left-bottom {
                width: 53px;
                border-right: 1px solid #DCE0E7;
                flex-shrink: 0;
                border-top: 1px solid #DCE0E7;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .table-lasts {
                width: 100%;

                .drawing-item {
                    min-height: 48px;
                    display: flex;
                    padding: 5px 10px;
                }
            }

            .right-bottom {
                width: 53px;
                padding: 10px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
    }
}

.tables--vertical {
    .table-other--vertical {
        display: block;
        width: 100%;
        max-width: 100%;
        overflow-x: hidden;

        .table-body-item--vertical {
            display: flex;
            align-items: stretch;
            border-top: 1px solid #e2e8f0;

            &:first-child {
                border-top: none;
            }

            .left-bottom {
                width: 53px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                border-right: 1px solid #e2e8f0;
                border-top: 0;
            }

            .table-vertical-fields {
                flex: 1;
                min-width: 0;
            }

            .table-vertical-field {
                padding: 10px 12px;
                border-bottom: 1px solid #e2e8f0;

                &:last-child {
                    border-bottom: none;
                }
            }

            .table-vertical-label {
                margin-bottom: 6px;
                color: #64748b;
                font-size: 12px;
                font-weight: 600;
                line-height: 1.4;
            }

            .table-vertical-body {
                min-height: 36px;
            }

            .right-bottom {
                width: 53px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                border-left: 1px solid #e2e8f0;
                border-top: 0;
            }
        }
    }
}

.redHreat {
    display: inline-flex;
    font-size: 14px;
    line-height: 1;
    vertical-align: middle;
    color: rgb(var(--danger-6))
}
</style>
