<template>
    <div class="area">
        <a-row :gutter="10">
            <a-col :span="8">
                <a-select placeholder="请选择省" :disabled="comDes.props.disabled" allow-clear @change="changeProvince"
                    v-model="comDes.props.prov" :options="area"></a-select>
            </a-col>
            <a-col :span="8">
                <a-select placeholder="请选择市" :disabled="comDes.props.disabled" allow-clear @change="changeCity"
                    v-model="comDes.props.city" :options="comDes.props.cityList"></a-select>
            </a-col>
            <a-col :span="8" v-show="comDes.props.option !== 'prov-city'">
                <a-select placeholder="请选择区" :disabled="comDes.props.disabled" allow-clear @change="changeDist"
                    v-model="comDes.props.dist" :options="comDes.props.District"></a-select>
            </a-col>
        </a-row>
        <div class="bottom" v-show="comDes.props.option === 'prov-city-dist-det'">
            <a-textarea :show-word-limit="true" :disabled="comDes.props.disabled" :max-length="100" @change="inputItem"
                v-model="comDes.props.value.det" placeholder="请输入详细地址"></a-textarea>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { pca, pcaa } from 'area-data'; // v5 或更高版本
import { ref, defineExpose, watch, inject, onBeforeUnmount, onDeactivated } from 'vue'
const area = ref([])
const city = ref([])
const District = ref([])
const datas = pcaa[86]
area.value = Object.keys(datas).map(key => ({ value: key, label: datas[key] }))
const props = defineProps<{
    comDes: any,
    showEdit: any,
    formConfs: any,
}>()

const ensureAreaValue = () => {
    const value = props.comDes.props.value
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        props.comDes.props.value = { prov: '', city: '', dist: '', det: '' }
    }
    return props.comDes.props.value
}

ensureAreaValue()

const resetAreaValue = () => {
    props.comDes.props.value = { prov: '', city: '', dist: '', det: '' }
    props.comDes.props.prov = ''
    props.comDes.props.city = ''
    props.comDes.props.dist = ''
    props.comDes.props.cityList = []
    props.comDes.props.District = []
}

defineExpose({ resetAreaValue })
onDeactivated(resetAreaValue)
onBeforeUnmount(resetAreaValue)

watch(() => props.comDes.props.value, (newVal) => {
    ensureAreaValue()

    if (props.comDes.props.value.prov && props.comDes.props.value.city) {
        area.value.map(v => {
            if (v.label == props.comDes.props.value.prov) {
                props.comDes.props.prov = v.value
                const cityS = pcaa[props.comDes.props.prov]

                props.comDes.props.cityList = Object.keys(cityS).map(key => ({ value: key, label: cityS[key] }))
                props.comDes.props.cityList.map(v1 => {
                    if (v1.label == props.comDes.props.value.city) {
                        props.comDes.props.city = v1.value
                        if (props.comDes.props.value.dist) {
                            const Province = pcaa[props.comDes.props.city]

                            props.comDes.props.District = Object.keys(Province).map(key => ({ value: key, label: Province[key] }))
                            props.comDes.props.District.map(v => {
                                if (props.comDes.props.value.dist == v.label) {
                                    props.comDes.props.dist = v.value
                                }

                            })
                        }
                    }
                })

            }
        })
    }
})


const changeProvince = () => {
    ensureAreaValue()
    if (props.comDes.props.prov) {
        const Province = pcaa[props.comDes.props.prov]
        props.comDes.props.cityList = Object.keys(Province).map(key => ({ value: key, label: Province[key] }))
        area.value.map(v => {
            if (props.comDes.props.prov == v.value) {
                props.comDes.props.value.prov = v.label
            }

        })
    } else {
        props.comDes.props.cityList = []

    }
    inputItem()
    props.comDes.props.District = []
    props.comDes.props.city = ''
    props.comDes.props.dist = ''
    props.comDes.props.value.city = ''
    props.comDes.props.value.dist = ''
    props.comDes.props.value.det = ''
}
const changeCity = () => {
    ensureAreaValue()
    if (props.comDes.props.city) {
        const Province = pcaa[props.comDes.props.city]
        props.comDes.props.District = Object.keys(Province).map(key => ({ value: key, label: Province[key] }))
        props.comDes.props.cityList.map(v => {
            if (props.comDes.props.city == v.value) {
                props.comDes.props.value.city = v.label
            }

        })

    } else {
        props.comDes.props.District = []
    }
    inputItem()
    props.comDes.props.dist = ''
    props.comDes.props.value.dist = ''
    props.comDes.props.value.det = ''
}
const changeDist = () => {
    ensureAreaValue()
    if (props.comDes.props.dist) {
        props.comDes.props.District.map(v => {
            if (props.comDes.props.dist == v.value) {
                props.comDes.props.value.dist = v.label
            }

        })

    }
    inputItem()
    props.comDes.props.value.det = ''
}
const provideState = inject("provideDesigner") as {
    filterData: (...args: any) => void;
};
const inputItem = () => {
    ensureAreaValue()
    if (props.comDes.method.input) {
        try {
            // eval(props.comDes.method.input);
        } catch (error) {
            console.error('代码执行出错:', error);
        }
    }
    if (!props.showEdit) {
        provideState.filterData(props.comDes)
    }

}
</script>

<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

.area {
    width: 100%;
}

.bottom {
    margin-top: 10px;
}
</style>
