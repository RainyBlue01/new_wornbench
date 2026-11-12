<template>
    <div class="area">
        <a-row :gutter="10">
            <a-col :span="8">
                <a-select placeholder="请选择省" allow-clear @change="changeProvince" v-model="comDes.props.prov"
                    :options="area"></a-select>
            </a-col>
            <a-col :span="8">
                <a-select placeholder="请选择市" allow-clear @change="changeCity" v-model="comDes.props.city"
                    :options="comDes.props.cityList"></a-select>
            </a-col>
            <a-col :span="8" v-show="comDes.props.option !== 'prov-city'">
                <a-select placeholder="请选择区" allow-clear @change="changeDist" v-model="comDes.props.dist"
                    :options="comDes.props.District"></a-select>
            </a-col>
        </a-row>
        <div class="bottom" v-show="comDes.props.option === 'prov-city-dist-det'">
            <a-textarea :show-word-limit="true" :max-length="100" v-model="comDes.props.defaultValue.det"
                placeholder="请输入详细地址"></a-textarea>
        </div>
    </div>
</template>
  
<script lang="ts" setup>
import { pca, pcaa } from 'area-data'; // v5 或更高版本
import { ref, defineExpose, watch } from 'vue'
const area = ref([])
const city = ref([])
const District = ref([])
const datas = pcaa[86]
area.value = Object.keys(datas).map(key => ({ value: key, label: datas[key] }))
const props = defineProps<{
    comDes: any,
    formConfs: any,
}>()
if (props.comDes.props.defaultValue.prov && props.comDes.props.defaultValue.city) {
    area.value.map(v => {
        if (v.label == props.comDes.props.defaultValue.prov) {
            props.comDes.props.prov = v.value
            const cityS = pcaa[props.comDes.props.prov]

            props.comDes.props.cityList = Object.keys(cityS).map(key => ({ value: key, label: cityS[key] }))
            props.comDes.props.cityList.map(v1 => {
                if (v1.label == props.comDes.props.defaultValue.city) {
                    props.comDes.props.city = v1.value
                    if (props.comDes.props.defaultValue.dist) {
                        const Province = pcaa[props.comDes.props.city]

                        props.comDes.props.District = Object.keys(Province).map(key => ({ value: key, label: Province[key] }))
                        props.comDes.props.District.map(v => {
                            if (props.comDes.props.defaultValue.dist == v.label) {
                                props.comDes.props.dist = v.value
                            }

                        })
                    }
                }
            })

        }
    })
}

const changeProvince = () => {
    if (props.comDes.props.prov) {
        const Province = pcaa[props.comDes.props.prov]
        props.comDes.props.cityList = Object.keys(Province).map(key => ({ value: key, label: Province[key] }))
        area.value.map(v => {
            if (props.comDes.props.prov == v.value) {
                props.comDes.props.defaultValue.prov = v.label
            }

        })
    } else {
        props.comDes.props.cityList = []

    }
    props.comDes.props.District = []
    props.comDes.props.city = ''
    props.comDes.props.dist = ''
    props.comDes.props.defaultValue.city = ''
    props.comDes.props.defaultValue.dist = ''
    props.comDes.props.defaultValue.det = ''
}
const changeCity = () => {
    if (props.comDes.props.city) {
        const Province = pcaa[props.comDes.props.city]
        props.comDes.props.District = Object.keys(Province).map(key => ({ value: key, label: Province[key] }))
        props.comDes.props.cityList.map(v => {
            if (props.comDes.props.city == v.value) {
                props.comDes.props.defaultValue.city = v.label
            }

        })
    } else {
        props.comDes.props.District = []
    }

    props.comDes.props.dist = ''
    props.comDes.props.defaultValue.dist = ''
    props.comDes.props.defaultValue.det = ''
}
const changeDist = () => {
    if (props.comDes.props.dist) {
        props.comDes.props.District.map(v => {
            if (props.comDes.props.dist == v.value) {
                props.comDes.props.defaultValue.dist = v.label
            }

        })
    }
    props.comDes.props.defaultValue.det = ''
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
  