<template>
  <div class="flowCenter">
    <UserBanner url="/taskManageCenter" title="任务管理"/>
    <a-row class="flowCenter-row">
      <a-col :span="16">
        <div class="box">
          <div class="title">
            填报任务
          </div>
          <div class="box-body">
            <div class="box-body-item">
              <div class="num">{{ taskInfo.total }}</div>
              <div class="text">全部任务</div>
            </div>
            <div class="box-body-item">
              <div class="num">{{ taskInfo.ongoingTotal }}</div>
              <div class="text">进行中的任务</div>
            </div>
            <div class="box-body-item">
              <div class="num">{{ taskInfo.appNum }}</div>
              <div class="text">应用数量</div>
            </div>
            <div class="box-body-item">
              <div class="num">{{ taskInfo.finishTotal }}</div>
              <div class="text">已结束的任务</div>
            </div>
            <div class="box-body-item">
              <div class="num">{{ taskInfo.fillTotal }}</div>
              <div class="text">填报人次</div>
            </div>
          </div>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="box">
          <div class="title">
            任务批次
          </div>
          <div class="box-text">
            <div class="box-text-item">
              <div class="num">{{ taskBatch.ongoingTotal }}</div>
              <div class="text">进行中的批次</div>
            </div>
            <div class="box-text-item">
              <div class="num">{{ taskBatch.finishTotal }}</div>
              <div class="text">已结束的批次</div>
            </div>
          </div>
        </div>
      </a-col>
      <a-col :span="24" style="margin-top:12px;">
        <div class="box">
          <div class="title">
            <div class="title-left">
              填报任务人次
            </div>
            <a-range-picker @change="getAuto" v-model="times1" :shortcuts="pickerOptions"/>
          </div>
          <div class="box-body">
            <div ref="lineEcharts" class="echarts"></div>
          </div>
        </div>
      </a-col>
      <a-col :span="24" style="margin-top:12px;">
        <div class="box">
          <div class="title">
            <div class="title-left">
              填报任务频次({{ nowday.name.length }})
            </div>
            <a-range-picker @change="getAutoFrequency" v-model="times2" :shortcuts="pickerOptionsData"/>
          </div>
          <div class="box-body">
            <div ref="barEcharts" class="echarts"></div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import {nextTick, onMounted, onUnmounted, ref} from 'vue'
import dayjs from 'dayjs';
import echarts from '@/utils/echarts'
import UserBanner from "@/components/banner/userBanner.vue";
import {
  statisticAotuFill,
  statisticAutoFrequencyFill,
  statisticTaskBatch,
  statisticTaskInfo
} from "@/api/taskChartCenter";

// 状态变量
const taskInfo = ref({
  total: 0,
  ongoingTotal: 0,
  finishTotal: 0,
  fillTotal: 0,
  appNum: 0
})
const taskBatch = ref({
  finishTotal: 0,
  ongoingTotal: 0
})
const week = ref({})
const times1 = ref([])
const times2 = ref([])
const nowday = ref({
  name: [],
  data: []
})

// ECharts 实例引用
const lineEcharts = ref(null)
const barEcharts = ref(null)
let lineChart = null
let barChart = null

// 日期快捷选项
const pickerOptions = [
  {
    label: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 6)
      return [start, end]
    }
  },
  {
    label: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    label: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

const pickerOptionsData = [
  {
    label: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 6)
      return [start, end]
    }
  },
  {
    label: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    label: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 初始化日期
const initDates = () => {
  const end = new Date()
  const start = new Date()
  start.setTime(start.getTime() - 3600 * 1000 * 24 * 6)
  times1.value = [start, end]
  times2.value = [start, end]
}

// 获取数据
const getData = () => {
  statisticTaskInfo().then(res => {
    taskInfo.value = res
  })
  statisticTaskBatch().then(res => {
    taskBatch.value = res
  })
  getAuto()
  getAutoFrequency()
}

// 获取填报任务人次数据
const getAuto = () => {
  if (!times1.value || times1.value.length < 2) return

  const params = {
    startDate: dayjs(times1.value[0]).format('YYYY-MM-DD'),
    endDate: dayjs(times1.value[1]).format('YYYY-MM-DD')
  }
  statisticAotuFill(params).then(res => {
    const name = []
    const fillTotal = []
    const appNum = []
    const fillNum = []

    res.forEach(v => {
      name.push(v.reportDate)
      fillTotal.push(v.appNum)
      appNum.push(v.fillTotal)
      fillNum.push(v.fillNum)
    })

    week.value = {
      name,
      fillTotal,
      appNum,
      fillNum
    }
    initLineChart()
  })
}

// 获取填报任务频次数据
const getAutoFrequency = () => {
  if (!times2.value || times2.value.length < 2) return

  const params = {
    startDate: dayjs(times2.value[0]).format('YYYY-MM-DD'),
    endDate: dayjs(times2.value[1]).format('YYYY-MM-DD')
  }
  statisticAutoFrequencyFill(params).then(res => {
    const name = []
    const data = []

    res.forEach(v => {
      name.push(v.taskName)
      data.push(v.fillTotal)
    })

    nowday.value = {
      name,
      data
    }
    initBarChart()
  })
}

// 初始化折线图
const initLineChart = () => {
  if (!lineEcharts.value) return

  if (lineChart) {
    lineChart.dispose()
  }

  lineChart = echarts.init(lineEcharts.value)
  lineChart.setOption({
    tooltip: {
      trigger: "axis"
    },
    legend: {
      data: ['填报数', '应用数量', '填报人数'],
      top: 0,
    },
    grid: {
      left: "14",
      right: "14",
      top: "24",
      bottom: "14",
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: week.value.name || []
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        data: week.value.fillTotal || [],
        name: '填报数',
        type: 'line'
      },
      {
        data: week.value.appNum || [],
        name: '应用数量',
        type: 'line'
      },
      {
        data: week.value.fillNum || [],
        name: '填报人数',
        type: 'line'
      }
    ]
  })
}

// 初始化柱状图
const initBarChart = () => {
  if (!barEcharts.value) return

  if (barChart) {
    barChart.dispose()
  }

  barChart = echarts.init(barEcharts.value)
  barChart.setOption({
    tooltip: {
      trigger: "axis"
    },
    legend: {
      data: []
    },
    grid: {
      left: "14",
      right: "14",
      top: "14",
      bottom: "14",
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: nowday.value.name || []
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        data: nowday.value.data || [],
        type: 'bar'
      }
    ]
  })
}

// 窗口大小变化时重置图表
const handleResize = () => {
  lineChart?.resize()
  barChart?.resize()
}

// 生命周期
onMounted(() => {
  initDates()
  getData()

  nextTick(() => {
    window.addEventListener('resize', handleResize)
  })
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  lineChart?.dispose()
  barChart?.dispose()
})
</script>

<style lang="scss" scoped>
.flowCenter {
  overflow: hidden;
}

.flowCenter-row {
  box-sizing: border-box;
  padding: 20px 14px;
  height: calc(100vh - 60px);
  overflow-y: auto;

  .box {
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 1);
    color: rgba(16, 16, 16, 1);
    font-size: 14px;
    padding: 20px 23px;

    .title {
      color: rgba(48, 49, 51, 1);
      font-size: 16px;
      text-align: left;
      font-family: SourceHanSansSC-regular;
      margin-bottom: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &-body {
      display: flex;

      &-item {
        padding: 32px 0;
        width: 25%;
        text-align: center;
        border: 1px solid rgba(220, 223, 230, 1);
        border-radius: 4px;

        .num {
          color: rgba(48, 49, 51, 1);
          font-size: 36px;
        }

        .text {
          color: rgba(153, 153, 153, 1);
          font-size: 14px;
        }
      }

      .box-body-item + .box-body-item {
        margin-left: 32px;
      }
    }

    &-text {
      display: flex;

      &-item {
        padding: 32px 0;
        width: 50%;
        text-align: center;
        border: 1px solid rgba(220, 223, 230, 1);
        border-radius: 4px;

        .num {
          color: rgba(48, 49, 51, 1);
          font-size: 36px;
        }

        .text {
          color: rgba(153, 153, 153, 1);
          font-size: 14px;
        }
      }

      .box-text-item + .box-text-item {
        margin-left: 32px;
      }
    }
  }
}

.echarts {
  height: 300px;
  width: 100%;
}
</style>
