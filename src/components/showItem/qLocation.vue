<script lang="ts" setup>
import { computed, inject, nextTick, reactive, shallowRef, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getMap } from '@/api/map'

interface LocationValue {
  address: string
  longitude: string | number
  latitude: string | number
  radius?: string | number
  accuracy?: number
  addressAlias?: string
  alias?: boolean
}

interface RangeItem {
  address?: string
  longitude?: string | number
  latitude?: string | number
  lng?: string | number
  lat?: string | number
  radius?: string | number
  addressAlias?: string
  alias?: boolean
}

const MAP_TOKEN = '423c0efc19572e94524173b9bad2c7eb'
const FALLBACK_LOCATION = { latitude: 30.67, longitude: 104.06 }

const props = defineProps<{
  comDes: any
  showEdit?: boolean
  formConfs?: any
}>()

const provideState = inject<{ filterData?: (...args: any) => void } | null>('provideDesigner', null)

const locating = shallowRef(false)
const pickerVisible = shallowRef(false)
const mapReady = shallowRef(false)
const rangeMessage = shallowRef('')
const mapMessage = shallowRef('')

const locationValue = reactive<LocationValue>({
  address: '',
  longitude: '',
  latitude: '',
  radius: '',
  addressAlias: '',
  alias: false,
})

const pickerForm = reactive<LocationValue>({
  address: '',
  longitude: '',
  latitude: '',
  radius: '',
  addressAlias: '',
  alias: false,
})

let tdtMap: any = null
let marker: any = null
let circle: any = null

const isDisabled = computed(() => Boolean(props.comDes?.props?.disabled || props.formConfs?.disabled))
const isReadonly = computed(() => Boolean(props.comDes?.props?.readonly))
const canUseMap = computed(() => typeof window !== 'undefined' && Boolean((window as any).T))
const coordinateText = computed(() => {
  if (!locationValue.longitude || !locationValue.latitude) return ''
  return `经度 ${locationValue.longitude}，纬度 ${locationValue.latitude}`
})
const allowedRanges = computed<RangeItem[]>(() => {
  const list = props.comDes?.props?.locationList
  return Array.isArray(list) ? list : []
})

const normalizeLocation = (value: any): LocationValue => {
  if (!value) return { address: '', longitude: '', latitude: '', radius: '', addressAlias: '', alias: false }
  if (typeof value === 'string') return { address: value, longitude: '', latitude: '', radius: '', addressAlias: '', alias: false }
  return {
    address: value.address || value.det || '',
    longitude: value.longitude || value.lng || '',
    latitude: value.latitude || value.lat || '',
    radius: value.radius || '',
    accuracy: value.accuracy,
    addressAlias: value.addressAlias || '',
    alias: Boolean(value.alias),
  }
}

const assignLocation = (target: LocationValue, source: LocationValue) => {
  target.address = source.address || ''
  target.longitude = source.longitude || ''
  target.latitude = source.latitude || ''
  target.radius = source.radius || ''
  target.accuracy = source.accuracy
  target.addressAlias = source.addressAlias || ''
  target.alias = Boolean(source.alias)
}

const distanceBetween = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const radius = 6371000
  const toRad = (degree: number) => degree * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const checkLocationRange = () => {
  rangeMessage.value = ''
  if (!props.comDes?.props?.locationSetting || allowedRanges.value.length === 0) return true

  const currentLat = Number(locationValue.latitude)
  const currentLng = Number(locationValue.longitude)
  if (!Number.isFinite(currentLat) || !Number.isFinite(currentLng)) return true

  const matched = allowedRanges.value.find((item) => {
    const lat = Number(item.latitude || item.lat)
    const lng = Number(item.longitude || item.lng)
    const radius = Number(item.radius || 0)
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(radius) || radius <= 0) return false
    return distanceBetween(currentLat, currentLng, lat, lng) <= radius
  })

  if (matched?.addressAlias) {
    locationValue.addressAlias = matched.addressAlias
    locationValue.alias = Boolean(matched.alias || matched.addressAlias)
  }
  if (!matched) {
    rangeMessage.value = '当前位置不在允许定位范围内'
    return false
  }
  return true
}

const syncValue = () => {
  props.comDes.props.value = { ...locationValue }
  checkLocationRange()
  if (!props.showEdit) {
    provideState?.filterData?.(props.comDes)
  }
}

const formatNumber = (value: number) => Number(value.toFixed(6))

const applyPoint = async (longitude: number, latitude: number, options: { updateAddress?: boolean } = {}) => {
  pickerForm.longitude = formatNumber(longitude)
  pickerForm.latitude = formatNumber(latitude)
  drawPoint(longitude, latitude)
  if (options.updateAddress !== false) {
    await reverseGeocode(longitude, latitude)
  }
}

const getMapPoint = (longitude: number, latitude: number) => {
  const T = (window as any).T
  return new T.LngLat(longitude, latitude)
}

const clearMapLayers = () => {
  if (!tdtMap) return
  if (typeof tdtMap.clearOverLays === 'function') {
    tdtMap.clearOverLays()
    return
  }
  if (typeof tdtMap.clearLayers === 'function') {
    tdtMap.clearLayers()
  }
}

const drawPoint = (longitude: number, latitude: number) => {
  if (!tdtMap || !canUseMap.value) return

  const T = (window as any).T
  const point = getMapPoint(longitude, latitude)
  clearMapLayers()

  const icon = new T.Icon({
    iconSize: new T.Point(27, 27),
    iconAnchor: new T.Point(10, 25),
  })
  marker = new T.Marker(point, icon)
  tdtMap.addOverLay(marker)
  marker.enableDragging?.()
  marker.addEventListener?.('drag', (event: any) => {
    const nextPoint = getMapPoint(event.lnglat.getLng(), event.lnglat.getLat())
    updateCircle(nextPoint)
  })
  marker.addEventListener?.('dragend', (event: any) => {
    applyPoint(event.lnglat.getLng(), event.lnglat.getLat())
  })

  updateCircle(point)
}

const updateCircle = (point?: any) => {
  if (!tdtMap || !canUseMap.value) return
  const radius = Number(pickerForm.radius || 0)
  if (!Number.isFinite(radius) || radius <= 0) return

  const T = (window as any).T
  const center = point || getMapPoint(Number(pickerForm.longitude), Number(pickerForm.latitude))
  if (circle?.setCenter) {
    circle.setCenter(center)
    circle.setRadius(radius)
    return
  }

  circle = new T.Circle(center, radius, {
    color: 'blue',
    weight: 5,
    opacity: 0.5,
    fillColor: '#FFFFFF',
    fillOpacity: 0.5,
    lineStyle: 'solid',
  })
  tdtMap.addOverLay(circle)
}

const initMap = (latitude: number, longitude: number) => {
  if (!canUseMap.value) {
    mapReady.value = false
    mapMessage.value = '未检测到天地图 SDK，可使用浏览器定位或手动填写经纬度'
    return
  }

  const T = (window as any).T
  if (!tdtMap) {
    tdtMap = new T.Map('qLocationTdtMap')
    if ((window as any).TMAP_NORMAL_MAP && (window as any).TMAP_SATELLITE_MAP && T.Control?.MapType) {
      const ctrl = new T.Control.MapType([
        {
          title: '地图',
          icon: 'http://api.tianditu.gov.cn/v4.0/image/map/maptype/vector.png',
          layer: (window as any).TMAP_NORMAL_MAP,
        },
        {
          title: '卫星',
          icon: 'http://api.tianditu.gov.cn/v4.0/image/map/maptype/satellite.png',
          layer: (window as any).TMAP_SATELLITE_MAP,
        },
      ])
      tdtMap.addControl(ctrl)
    }
    tdtMap.addEventListener('click', (event: any) => {
      applyPoint(event.lnglat.getLng(), event.lnglat.getLat())
    })
  }

  const point = getMapPoint(longitude, latitude)
  tdtMap.centerAndZoom(point, 12)
  mapReady.value = true
  mapMessage.value = ''
  drawPoint(longitude, latitude)
}

const reverseGeocode = async (longitude: number, latitude: number) => {
  try {
    const res: any = await getMap({
      tk: MAP_TOKEN,
      type: 'geocode',
      postStr: `{\'lon\':${longitude},\'lat\':${latitude},\'ver\':1}`,
    })
    const component = res?.result?.addressComponent
    if (component) {
      pickerForm.address = `${component.province || ''}${component.city || ''}${component.county || ''}${component.address || ''}`
    }
  } catch {
    Message.warning('地址反查失败，请手动填写地址')
  }
}

const searchAddress = async () => {
  if (!pickerForm.address) return
  try {
    const res: any = await getMap({
      tk: MAP_TOKEN,
      ds: `{\'keyWord\':\'${pickerForm.address}\'}`,
    })
    const longitude = Number(res?.location?.lon)
    const latitude = Number(res?.location?.lat)
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      Message.warning('未找到该地址对应的位置')
      return
    }
    await applyPoint(longitude, latitude, { updateAddress: false })
    tdtMap?.centerAndZoom?.(getMapPoint(longitude, latitude), 18)
  } catch {
    Message.warning('地址查询失败，请尝试手动点击地图选点')
  }
}

const locateCurrentPosition = (usePicker = false) => {
  if (!navigator.geolocation) {
    Message.error('当前浏览器不支持定位')
    if (usePicker) initMap(FALLBACK_LOCATION.latitude, FALLBACK_LOCATION.longitude)
    return
  }

  locating.value = true
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const longitude = formatNumber(position.coords.longitude)
      const latitude = formatNumber(position.coords.latitude)
      if (usePicker) {
        pickerForm.accuracy = Math.round(position.coords.accuracy || 0)
        await applyPoint(longitude, latitude)
        initMap(latitude, longitude)
      } else {
        locationValue.longitude = longitude
        locationValue.latitude = latitude
        locationValue.accuracy = Math.round(position.coords.accuracy || 0)
        locationValue.address = locationValue.address || `${latitude},${longitude}`
        syncValue()
      }
      locating.value = false
    },
    (error) => {
      const messages: Record<number, string> = {
        1: '用户拒绝了定位授权',
        2: '位置信息不可用',
        3: '定位请求超时',
      }
      Message.error(messages[error.code] || '定位失败')
      locating.value = false
      if (usePicker) initMap(FALLBACK_LOCATION.latitude, FALLBACK_LOCATION.longitude)
    },
    {
      enableHighAccuracy: Boolean(props.comDes?.props?.enableHighAccuracy),
      timeout: Number(props.comDes?.props?.locationTimeout || 10000),
      maximumAge: 0,
    },
  )
}

const openPicker = async () => {
  assignLocation(pickerForm, normalizeLocation(props.comDes?.props?.value || locationValue))
  pickerVisible.value = true
  await nextTick()

  const latitude = Number(pickerForm.latitude || FALLBACK_LOCATION.latitude)
  const longitude = Number(pickerForm.longitude || FALLBACK_LOCATION.longitude)
  initMap(latitude, longitude)
  if (!pickerForm.latitude || !pickerForm.longitude) {
    locateCurrentPosition(true)
  }
}

const closePicker = () => {
  pickerVisible.value = false
  tdtMap = null
  marker = null
  circle = null
  mapReady.value = false
}

const confirmPicker = () => {
  assignLocation(locationValue, pickerForm)
  syncValue()
  closePicker()
}

watch(
  () => props.comDes?.props?.value,
  (value) => {
    assignLocation(locationValue, normalizeLocation(value))
    checkLocationRange()
  },
  { immediate: true, deep: true },
)
</script>

<template>
  <div class="q-location">
    <a-input
      v-model="locationValue.address"
      :disabled="isDisabled"
      :readonly="isReadonly"
      :placeholder="comDes.props.placeholder || '点击定位或选择当前位置'"
      allow-clear
      @input="syncValue"
    >
      <template #append>
        <a-space :size="0">
          <a-button :loading="locating" :disabled="isDisabled || isReadonly" @click="locateCurrentPosition(false)">
            定位
          </a-button>
          <a-button :disabled="isDisabled || isReadonly" @click="openPicker">
            选点
          </a-button>
        </a-space>
      </template>
    </a-input>

    <div v-if="coordinateText" class="q-location__meta">{{ coordinateText }}</div>
    <div v-if="locationValue.alias && locationValue.addressAlias" class="q-location__meta">
      定位别名：{{ locationValue.addressAlias }}
    </div>
    <div v-if="rangeMessage" class="q-location__warning">{{ rangeMessage }}</div>

    <a-modal
      v-model:visible="pickerVisible"
      title="设置位置定位中心"
      width="720px"
      :mask-closable="false"
      :unmount-on-close="true"
      @cancel="closePicker"
      @ok="confirmPicker"
    >
      <div class="q-location__dialog-desc">定位中心范围内的地点才会被认可</div>
      <div v-if="pickerVisible" id="qLocationTdtMap" class="q-location__map">
        <div v-if="!mapReady" class="q-location__map-placeholder">{{ mapMessage || '地图初始化中...' }}</div>
      </div>

      <a-form :model="pickerForm" layout="vertical" class="q-location__form">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="定位中心">
              <a-input v-model="pickerForm.address" allow-clear @blur="searchAddress" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="偏移距离">
              <a-input-number
                v-model="pickerForm.radius"
                :min="0"
                :precision="0"
                placeholder="米"
                class="q-location__full"
                @change="updateCircle()"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="经度">
              <a-input-number v-model="pickerForm.longitude" :precision="6" class="q-location__full" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="纬度">
              <a-input-number v-model="pickerForm.latitude" :precision="6" class="q-location__full" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item>
              <a-checkbox v-model="pickerForm.alias">开启定位别名</a-checkbox>
              <a-input v-model="pickerForm.addressAlias" :disabled="!pickerForm.alias" allow-clear class="q-location__alias" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<style lang="scss" scoped>
.q-location {
  display: grid;
  gap: 6px;
  width: 100%;
}

.q-location__meta {
  color: #86909c;
  font-size: 12px;
  line-height: 18px;
}

.q-location__warning {
  color: #f53f3f;
  font-size: 12px;
  line-height: 18px;
}

.q-location__dialog-desc {
  color: #86909c;
  font-size: 13px;
  line-height: 20px;
  margin: -4px 0 12px;
}

.q-location__map {
  align-items: center;
  background: #f2f3f5;
  display: flex;
  height: 280px;
  justify-content: center;
  margin-bottom: 16px;
  position: relative;
  width: 100%;
}

.q-location__map-placeholder {
  color: #86909c;
  font-size: 13px;
  padding: 0 16px;
  text-align: center;
}

.q-location__form {
  :deep(.arco-form-item) {
    margin-bottom: 12px;
  }
}

.q-location__full {
  width: 100%;
}

.q-location__alias {
  margin-top: 8px;
}
</style>
