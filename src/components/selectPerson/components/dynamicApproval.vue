<template>
    <div class="dynamicApproval">
        <div class="left">
            <div @click="setDynamic(item.value)" :class="active == item.value ? 'left-item active' : 'left-item'"
                v-for="(item, index) in leftList" :key="index">{{ item.label }}</div>
        </div>
        <div class="center">
            <div class="center-body" v-if="active == 1">
                <a-checkbox-group direction="vertical" v-model="dynamic.deptFields" @change="changeDeptFields">
                    <a-checkbox :value="item.id" :key="item.id" v-for="item in deptFildList">{{ item.title
                        }}</a-checkbox>
                </a-checkbox-group>
                <div class="empty-box" v-show="deptFildList.length == 0">
                    <div class="img">
                        <img src="../../../assets/zanwuneirong@2x.png" alt="">
                    </div>
                    <div class="tit">
                        暂无部门字段
                    </div>
                </div>
            </div>
            <div class="center-body" v-if="active == 2">
                <a-checkbox-group direction="vertical" v-model="dynamic.userFields" @change="changeUserFields">
                    <a-checkbox :value="item.id" :key="item.id" v-for="item in userFildList">{{ item.title
                        }}</a-checkbox>
                </a-checkbox-group>
                <div class="empty-box" v-show="userFildList.length == 0">
                    <div class="img">
                        <img src="../../../assets/zanwuneirong@2x.png" alt="">
                    </div>
                    <div class="tit">
                        暂无成员字段
                    </div>
                </div>
            </div>
            <div class="center-body" v-if="active == 3">
                <div class="center-body-center">
                    <div @click="setItem('deptLeader')"
                        :class="dynamicDes.deptLeader.applyUser ? 'center-item active' : 'center-item'">
                        流程发起人
                    </div>
                    <div v-for="item in deptFildList"
                        :class="dynamicDes.deptLeader.deptField == item.id ? 'center-item active' : 'center-item'"
                        @click="setDeptField('deptLeader', item)">
                        {{ item.title }}
                    </div>
                    <div v-for="item in userFildList"
                        :class="dynamicDes.deptLeader.userField == item.id ? 'center-item active' : 'center-item'"
                        @click="setUserField('deptLeader', item)">
                        {{ item.title }}
                    </div>
                </div>
                <div class="center-body-right"
                    v-if="dynamicDes.deptLeader.applyUser || dynamicDes.deptLeader.userField || dynamicDes.deptLeader.deptField">
                    <a-checkbox-group @change="handleDeptLeaderChange" v-model="dynamic.deptLeaderLevel"
                        direction="vertical">
                        <a-checkbox :value="item.value" :key="item.value" v-for="item in deptT">{{ item.label
                            }}</a-checkbox>
                    </a-checkbox-group>
                </div>
            </div>
            <div class="center-body" v-if="active == 4">
                <div class="center-body-item">
                    <a-checkbox @change="handleCheckbox" v-model="dynamicDes.applyUser">
                        流程发起人
                    </a-checkbox>
                </div>

            </div>
            <div class="center-body" v-if="active == 5">
                <div class="center-body-center">
                    <div @click="setItem('chargeLeader')"
                        :class="dynamicDes.chargeLeader.applyUser ? 'center-item active' : 'center-item'">
                        流程发起人
                    </div>
                    <div v-for="item in deptFildList"
                        :class="dynamicDes.chargeLeader.deptField == item.id ? 'center-item active' : 'center-item'"
                        @click="setDeptField('chargeLeader', item)">
                        {{ item.title }}
                    </div>
                    <div v-for="item in userFildList"
                        :class="dynamicDes.chargeLeader.userField == item.id ? 'center-item active' : 'center-item'"
                        @click="setUserField('chargeLeader', item)">
                        {{ item.title }}
                    </div>
                </div>
                <div class="center-body-right"
                    v-if="dynamicDes.chargeLeader.applyUser || dynamicDes.chargeLeader.userField || dynamicDes.chargeLeader.deptField">
                    <a-checkbox-group @change="handleDeptLeaderChange" v-model="dynamic.chargeLeaderLevel"
                        direction="vertical">
                        <a-checkbox :value="item.value" :key="item.value" v-for="item in leaderList">{{ item.label
                            }}</a-checkbox>
                    </a-checkbox-group>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, inject, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getFormById } from '@/utils/form'
const route = useRoute()
const deptT = [
    { label: '直接部门负责人', value: 0 },
    { label: '上级部门负责人', value: 1 },
    { label: '三级部门负责人', value: 2 },
    { label: '四级部门负责人', value: 3 },
    { label: '五级部门负责人', value: 4 }
]
const leaderList = [
    { label: '直接部门分管领导', value: 0 },
    { label: '上级部门分管领导', value: 1 },
    { label: '三级部门分管领导', value: 2 },
    { label: '四级部门分管领导', value: 3 },
    { label: '五级部门分管领导', value: 4 }
]
const dynamic = ref(
    {
        deptFields: [],
        userFields: [],
        deptLeaderLevel: [],
        chargeLeaderLevel: [],
    }
)
const dynamicDes = ref(
    {
        deptFields: [],
        userFields: [],
        deptLeader: {
            deptField: '',
            userField: '',
            applyUser: false,
            level: []
        },
        applyUser: false,
        chargeLeader: {
            deptField: '',
            userField: '',
            applyUser: false,
            level: []
        }
    }
)

const leftList = ref([
    { label: '部门字段', value: 1 },
    { label: '成员字段', value: 2 },
    { label: '部门负责人', value: 3 },
    { label: '流程发起人', value: 4 },
    { label: '分管领导', value: 5 },
])
const userFildList = ref([])
const active = ref()
const deptFildList = ref([])
const provideState = inject("provideDesigner") as {
    setForms: (...args: any) => void;
};
const handleDeptLeaderChange = () => {
    dynamicDes.value.deptLeader.level = []
    dynamic.value.deptLeaderLevel.map(v => {
        deptT.map(v1 => {
            if (v == v1.value) {
                dynamicDes.value.deptLeader.level.push(v1)
            }
        })
    })
    dynamicDes.value.chargeLeader.level = []
    dynamic.value.chargeLeaderLevel.map(v => {
        leaderList.map(v1 => {
            if (v == v1.value) {
                dynamicDes.value.chargeLeader.level.push(v1)
            }
        })
    })
    provideState.setForms('dynamic', dynamicDes.value)
}
const changeDeptFields = () => {
    dynamicDes.value.deptFields = []
    dynamic.value.deptFields.map(v => {
        deptFildList.value.map(v1 => {
            if (v == v1.id) {
                dynamicDes.value.deptFields.push(v1)
            }
        })
    })

    // provideState.setForms('dynamic', dynamicDes.value)
}
const changeUserFields = () => {
    dynamicDes.value.userFields = []
    dynamic.value.userFields.map(v => {
        userFildList.value.map(v1 => {
            if (v == v1.id) {
                dynamicDes.value.userFields.push(v1)
            }
        })
    })

    // provideState.setForms('dynamic', dynamicDes.value)
}
const handleCheckbox = () => {
    provideState.setForms('dynamic', dynamicDes.value)
}
const setItem = (val: any) => {
    if (dynamicDes.value[val].applyUser) {
        dynamicDes.value[val].applyUser = ''
        dynamicDes.value[val].deptField = ''
        dynamicDes.value[val].userField = ''
    } else {
        dynamicDes.value[val].applyUser = 1
        dynamicDes.value[val].deptField = ''
        dynamicDes.value[val].userField = ''
    }

}
const setDeptField = (val: any, item: any) => {
    if(dynamicDes.value[val].deptField  === item.id){
dynamicDes.value[val].deptField = ''
    }else{
        dynamicDes.value[val].deptField = item.id
    }
    
    dynamicDes.value[val].applyUser = ''
    dynamicDes.value[val].userField = ''
}
const setUserField = (val: any, item: any) => {
    dynamicDes.value[val].deptField = ''
    dynamicDes.value[val].applyUser = ''
       if(dynamicDes.value[val].userField  === item.id){
dynamicDes.value[val].userField = ''
    }else{
        dynamicDes.value[val].userField = item.id
    }
    

}
const fields = getFormById(route.query.id)
fields.formList.map(v => {
    if (v.type == 'USER' || v.type == 'USER_MULTIPLE') {
        let params = {
            id: v.id,
            title: v.title
        }
        userFildList.value.push(params)
    }
    if (v.type == 'DEPT_MULTIPLE' || v.type == 'DEPT') {
        let params = {
            id: v.id,
            title: v.title
        }
        deptFildList.value.push(params)
    }
})
const setDynamic = (val: any) => {
    active.value = val
}
const updateItem = (val: any) => {
    dynamicDes.value = val
    dynamic.value.chargeLeaderLevel = []
    dynamic.value.deptLeaderLevel = []
    dynamic.value.deptFields = []
    dynamic.value.userFields = []
    dynamicDes.value.deptLeader.level.map(v => {
        dynamic.value.deptLeaderLevel.push(v.value)
    })
    if (!dynamicDes.value.chargeLeader) {
        dynamicDes.value.chargeLeader = {
            deptField: '',
            userField: '',
            applyUser: false,
            level: []
        }
    }
    dynamicDes.value.chargeLeader.level.map(v => {
        dynamic.value.chargeLeaderLevel.push(v.value)
    })
    dynamicDes.value.deptFields.map(v => {
        dynamic.value.deptFields.push(v.id)
    })
    dynamicDes.value.userFields.map(v => {
        dynamic.value.userFields.push(v.id)
    })

}
const setData = (datas: any) => {

}
defineExpose({
    updateItem, setData
})
</script>

<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

.dynamicApproval {
    display: flex;
    justify-content: flex-start;
    height: 297px;
    overflow-y: auto;

    .left {
        width: 30%;
        height: 100%;
        border-right: 1px solid #e4e7ed;

        &-item {
            width: 100%;
            height: 33px;
            padding: 0 10px;
            cursor: pointer;
        }

        .active {
            color: rgb(var(--primary-6));
        }
    }

    .center {
        width: 70%;
        height: 100%;

        .center-body {
            width: 100%;
            height: 100%;
            display: flex;

            &-item {
                width: 100%;
                padding: 0 10px;
                height: 100%;
            }

            .center-body-center {
                width: 35%;
                height: 100%;
                padding: 0 10px;
                border-right: 1px solid #e4e7ed;

                .active {
                    color: rgb(var(--primary-6));
                }

                .center-item {
                    width: 100%;
                    height: 33px;
                    padding: 0 10px;
                    cursor: pointer;
                }
            }

            .center-body-right {
                width: 35%;
                padding: 0 10px;
                height: 100%;
            }
        }
    }
}

.empty-box {
    width: 100%;
    background-color: #fff;
    min-height: 200px;
    display: flex;
    margin: 10px auto 0;
    border-radius: 10px;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .img {
        img {
            width: 148px;
        }
    }

    .tit {
        font-size: 16px;
        color: #999;
    }
}
</style>