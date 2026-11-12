<template>
    <div class="set-connector">
        <a-select :options="options" placeholder="请选择连接器" @change="changeConnector" v-model="activeFlew.connectorId">
        </a-select>
        <div class="form-item">
            <div class="form-item-title">
                <div class="form-item-title-left">
                    动作
                </div>
            </div>
            <div class="form-item-body">
                <a-select :options="actionOptions"  placeholder="请选择动作"
                    v-model="activeFlew.sceneId">
                </a-select>
            </div>
        </div>
        <div class="form-item">
            <div class="form-item-title">
                <div class="form-item-title-left">
                    变量
                </div>
            </div>
            <div class="form-item-body">
                <a-button long type="primary" @click="upDateDatas">修改变量</a-button>
            </div>
        </div>
        <!-- <div class="form-item">
            <div class="form-item-title">
                <div class="form-item-title-left">
                    入参变量
                </div>
            </div>
            <div class="form-item-body">
                <a-button long @click="addInput" v-show="activeFlew.input && activeFlew.input.length == 0">+</a-button>
                <div class="input-box">
                    <a-space class="input-item" v-for="(item, index) in activeFlew.input">
                        <div class="input-select">
                            <a-select v-model="item.name" placeholder="请选择业务场景">
                            </a-select>
                        </div>
                        <div class="type-select">
                            <a-select :options="electType" v-model="item.type" placeholder="名称类型">
                            </a-select>
                        </div>
                        <div class="name-select">
                            <a-select v-if="item.type == 0" :options="formList" v-model="item.fieldCode"
                                placeholder="变量名称">
                            </a-select>
                            <a-input v-if="item.type == 1" placeholder="请输入变量名称" v-model="item.customValue">
                            </a-input>
                        </div>
                        <div class="icon" @click="deleteInput(index)">
                            <icon-close-circle />
                        </div>
                    </a-space>
                    <a-button @click="addInput" class="addBtn" v-show="activeFlew.input.length > 0">新增</a-button>
                </div>
            </div>
        </div>
        <div class="form-item">
            <div class="form-item-title">
                <div class="form-item-title-left">
                    出参变量
                </div>
                <div class="form-item-title-right">
                    <a-switch v-model="activeFlew.enableOutput" />
                </div>
            </div>
            <div class="form-item-body">
                <a-button @click="addOutput" v-show="activeFlew.output.length == 0 && activeFlew.enableOutput"
                    long>+</a-button>
                <div class="input-box" v-show="activeFlew.enableOutput">
                    <a-space class="input-item" v-for="(item, index) in activeFlew.output">
                        <div class="input-select">
                            <a-select v-model="item.variableName" placeholder="请选择业务场景">
                            </a-select>
                        </div>
                        <div class="outputname-select">
                            <a-select v-model="item.fieldCode" :options="formList" placeholder="变量名称">
                            </a-select>
                        </div>
                        <div class="icon" @click="deleteOutput(index)">
                            <icon-close-circle />
                        </div>
                        <div class="icon" >+</div>
                    </a-space>

                    <a-button @click="addOutput" class="addBtn" v-show="activeFlew.output.length > 0">新增</a-button>
                </div>
            </div>
        </div> -->
        <variable :actions="actions" @refresh="refresh" :activeFlew="activeFlew" ref="variableRef" />
    </div>
</template>

<script setup lang="ts">
import { getConnectorList, getScene } from '@/api/connector/index'
import { Message } from '@arco-design/web-vue'

import { ref } from 'vue'
import variable from './variable.vue';

const props = defineProps<{
    activeFlew: any,
    formData: any,
}>()
const variableRef = ref()
const options = ref([])
const actions = ref([])
const actionOptions = ref([])
const upDateDatas = () => {
    if (!props.activeFlew.sceneId) {
        Message.warning('请先选择动作')
        return
    }
    actions.value = actionOptions.value.find(item => item.value === props.activeFlew.sceneId);
    if (!actions.value) {
        Message.warning('当前动作不存在，请重新选择')
        return
    }
    variableRef.value.showModal(props.activeFlew)
}
const getList = () => {
    let params = {
        type: 1
    }
    getConnectorList(params).then(res => {
        options.value = res.map((v => {
            const { id, name } = v
            return {
                label: name,
                value: id
            }
        }))
        if (props.activeFlew.connectorId) {
            changeConnector()
        }
    })
}
getList()
const changeConnector = () => {
    getScene(props.activeFlew.connectorId).then(res => {
        actionOptions.value = res.map((v => {
            const { id, name, input, output } = v
            return {
                output: output,
                input: input,
                label: name,
                value: id
            }
        }))
    })
}
const refresh = (item:any) =>{
    props.activeFlew.output = item.output
     props.activeFlew.enableOutput = item.enableOutput
      props.activeFlew.input = item.input
}
</script>

<style lang="scss" scoped>
@use "@/styles/textColor.scss" as textColor;

.form-item {
    margin-top: 18px;
}

.form-item-title {
    color: #949495;
    font-size: 12px;
    line-height: 32px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.approveBlank {
    .approveBlank-item {
        margin-top: 10px;
    }

    .select {
        width: 120px;
    }

    .ratio {
        width: 200px;
    }
}

.form-item-title-right {
    cursor: pointer;
    color: textColor.$ThemeTextColor;
}

.numRange {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .left {
        width: 135px;
    }
}

.top {
    display: flex;
}

.top+.top {
    margin-top: 10px;
}

.des {
    margin-top: 10px;
    font-size: 12px;
    color: #949495;
}

.input-box {
    margin: 20px 0;

    .input-item {
        width: 100%;
        display: flex;
        align-items: center;

        .but {
            width: 60px;
            margin: 0 5px;
        }

        .input-select {
            width: 100px;
        }

        .icon {
            margin: 0 5px;
            display: flex;
            align-items: center;
            cursor: pointer;
        }

        .type-select {
            width: 88px;
            margin-right: 5px;
        }

        .name-select {
            width: 90px;
        }

        .outputname-select {
            width: 196px;
        }
    }

    .input-item+.input-item {
        margin-top: 10px;
    }

    .addBtn {
        margin-top: 10px;
    }

}
</style>