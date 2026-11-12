<template>
  <div class="dashboard-container">
    <grid-layout
      v-model:layout="layout"
      :col-num="12"
      :row-height="80"
      :is-draggable="true"
      :is-resizable="true"
      :vertical-compact="true"
      :use-css-transforms="true"
    >
      <grid-item
        v-for="item in layout"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        :key="item.i"
        drag-allow-from=".drag-handle"
        drag-ignore-from=".no-drag"
      >
        <div class="grid-item-content">
          <!-- 统计卡片 -->
          <div v-if="item.type === 'stat-card'" class="stat-card">
            <div class="stat-header">
              <div class="stat-icon">
                <img v-if="item.icon" :src="item.icon as string" alt="" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ item.value }}</div>
                <div class="stat-label">{{ item.label }}</div>
              </div>
            </div>
            <!-- 筛选条件 -->
            <div class="filter-bar no-drag">
              <a-input
                v-model="item.filterValue"
                placeholder="请输入"
                size="small"
                style="width: 120px"
              />
            </div>
          </div>

          <!-- 图表卡片 -->
          <div v-else-if="item.type === 'chart'" class="chart-card">
            <div class="chart-header drag-handle">
              <div class="chart-title">{{ item.chartTitle }}</div>
              <div class="chart-actions no-drag">
                <icon-edit size="14" style="cursor: pointer; margin-right: 8px" />
                <icon-delete size="14" style="cursor: pointer" />
              </div>
            </div>
            <div class="chart-body" :ref="el => setChartRef(el, item.i)">
              <div v-if="item.chartType === 'line'" class="chart-placeholder">
                <!-- 折线图 -->
                <div ref="lineChartRef" style="width: 100%; height: 100%"></div>
              </div>
              <div v-else-if="item.chartType === 'bar'" class="chart-placeholder">
                <!-- 柱状图 -->
                <div ref="barChartRef" style="width: 100%; height: 100%"></div>
              </div>
              <div v-else-if="item.chartType === 'funnel'" class="chart-placeholder">
                <!-- 漏斗图 -->
                <div ref="funnelChartRef" style="width: 100%; height: 100%"></div>
              </div>
              <div v-else-if="item.chartType === 'horizontalBar'" class="chart-placeholder">
                <!-- 横向条形图 -->
                <div ref="horizontalBarChartRef" style="width: 100%; height: 100%"></div>
              </div>
              <div v-else-if="item.chartType === 'gauge'" class="chart-placeholder">
                <!-- 仪表盘 -->
                <div ref="gaugeChartRef" style="width: 100%; height: 100%"></div>
              </div>
              <div v-else-if="item.chartType === 'radar'" class="chart-placeholder">
                <!-- 雷达图 -->
                <div ref="radarChartRef" style="width: 100%; height: 100%"></div>
              </div>
            </div>
          </div>

          <!-- 表格卡片 -->
          <div v-else-if="item.type === 'table'" class="table-card">
            <div class="table-header drag-handle">
              <div class="table-title">{{ item.tableTitle }}</div>
              <div class="table-actions no-drag">
                <a-button type="text" size="small">
                  <template #icon><icon-edit /></template>
                </a-button>
                <a-button type="text" size="small">
                  <template #icon><icon-delete /></template>
                </a-button>
              </div>
            </div>
            <div class="table-body no-drag">
              <a-table
                :columns="tableColumns"
                :data="tableData"
                :pagination="false"
                size="small"
                :scroll="{ y: 400 }"
              >
                <template #index="{ rowIndex }">
                  {{ rowIndex + 1 }}
                </template>
                <template #action="{ record }">
                  <a-space>
                    <a-button type="text" size="small">修改</a-button>
                    <a-button type="text" size="small" status="danger">删除</a-button>
                  </a-space>
                </template>
              </a-table>
            </div>
          </div>
        </div>
      </grid-item>
    </grid-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { GridLayout, GridItem } from 'vue-grid-layout'
import {
  IconEdit,
  IconDelete,
} from '@arco-design/web-vue/es/icon'
import echarts from '@/utils/echarts'

// 布局配置
const layout = ref([
  // 第一行：4 个统计卡片
  { x: 0, y: 0, w: 3, h: 2, i: '1', type: 'stat-card', value: '100', label: '指标名称名称', icon: '', filterValue: '' },
  { x: 3, y: 0, w: 3, h: 2, i: '2', type: 'stat-card', value: '100', label: '指标名称名称', icon: '', filterValue: '' },
  { x: 6, y: 0, w: 3, h: 2, i: '3', type: 'stat-card', value: '100', label: '指标名称名称', icon: '', filterValue: '' },
  { x: 9, y: 0, w: 3, h: 2, i: '4', type: 'stat-card', value: '100', label: '指标名称名称', icon: '', filterValue: '' },
  
  // 第二行：图表
  { x: 0, y: 2, w: 3, h: 3, i: '5', type: 'chart', chartType: 'line', chartTitle: '统计图形标题' },
  { x: 3, y: 2, w: 3, h: 3, i: '6', type: 'chart', chartType: 'bar', chartTitle: '统计图形标题' },
  { x: 6, y: 2, w: 3, h: 3, i: '7', type: 'chart', chartType: 'funnel', chartTitle: '统计图形标题' },
  { x: 9, y: 2, w: 3, h: 3, i: '8', type: 'chart', chartType: 'horizontalBar', chartTitle: '统计图形标题' },
  
  // 第三行：表格 + 图表
  { x: 0, y: 5, w: 9, h: 6, i: '9', type: 'table', tableTitle: '标题' },
  { x: 9, y: 5, w: 3, h: 3, i: '10', type: 'chart', chartType: 'gauge', chartTitle: '统计图形标题' },
  { x: 9, y: 8, w: 3, h: 3, i: '11', type: 'chart', chartType: 'radar', chartTitle: '统计图形标题' },
])

// 表格列配置
const tableColumns = reactive([
  { title: '序号', slotName: 'index', width: 60 },
  { title: '申请人', dataIndex: 'applicant', width: 100 },
  { title: '申请时间', dataIndex: 'applyTime', width: 160 },
  { title: '是否高校', dataIndex: 'isUniversity', width: 80 },
  { title: '申请理由', dataIndex: 'reason', width: 120 },
  { title: '提交时间', dataIndex: 'submitTime', width: 160 },
  { title: '身份证', dataIndex: 'idCard', width: 180 },
  { title: '操作', slotName: 'action', width: 120, fixed: 'right' },
])

// 表格数据
const tableData = ref([
  { id: 1, applicant: '肖川', applyTime: '2025-08-01 17:44:05', isUniversity: '是', reason: '校外数据', submitTime: '2025-08-01 17:44:05', idCard: '2323541254785487596' },
  { id: 2, applicant: '肖川', applyTime: '2025-08-01 17:44:05', isUniversity: '是', reason: '校外数据', submitTime: '2025-08-01 17:44:05', idCard: '2323541254785487596' },
  { id: 3, applicant: '肖川', applyTime: '2025-08-01 17:44:05', isUniversity: '是', reason: '校外数据', submitTime: '2025-08-01 17:44:05', idCard: '2323541254785487596' },
  { id: 4, applicant: '肖川', applyTime: '2025-08-01 17:44:05', isUniversity: '是', reason: '校外数据', submitTime: '2025-08-01 17:44:05', idCard: '2323541254785487596' },
  { id: 5, applicant: '肖川', applyTime: '2025-08-01 17:44:05', isUniversity: '是', reason: '校外数据', submitTime: '2025-08-01 17:44:05', idCard: '2323541254785487596' },
  { id: 6, applicant: '肖川', applyTime: '2025-08-01 17:44:05', isUniversity: '是', reason: '校外数据', submitTime: '2025-08-01 17:44:05', idCard: '2323541254785487596' },
  { id: 7, applicant: '肖川', applyTime: '2025-08-01 17:44:05', isUniversity: '是', reason: '校外数据', submitTime: '2025-08-01 17:44:05', idCard: '2323541254785487596' },
  { id: 8, applicant: '肖川', applyTime: '2025-08-01 17:44:05', isUniversity: '是', reason: '校外数据', submitTime: '2025-08-01 17:44:05', idCard: '2323541254785487596' },
  { id: 9, applicant: '肖川', applyTime: '2025-08-01 17:44:05', isUniversity: '是', reason: '校外数据', submitTime: '2025-08-01 17:44:05', idCard: '2323541254785487596' },
])

// 图表引用存储
const chartRefs = ref<any>({})
const chartInstances = ref<any>({})

// 设置图表引用
const setChartRef = (el: any, key: string) => {
  if (el) {
    chartRefs.value[key] = el
    nextTick(() => {
      initChart(key)
    })
  }
}

// 初始化图表
const initChart = (key: string) => {
  const item = layout.value.find(l => l.i === key)
  if (!item || !chartRefs.value[key]) return

  const chart = echarts.init(chartRefs.value[key])
  chartInstances.value[key] = chart

  let option: any = {}

  switch (item.chartType) {
    case 'line':
      option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['系列 1', '系列 2'], right: 10, top: 0 },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '20%', containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['1 月', '2 月', '3 月', '4 月', '5 月']
        },
        yAxis: { type: 'value' },
        series: [
          {
            name: '系列 1',
            type: 'line',
            smooth: true,
            areaStyle: {},
            data: [120, 132, 101, 134, 90]
          },
          {
            name: '系列 2',
            type: 'line',
            smooth: true,
            areaStyle: {},
            data: [220, 182, 191, 234, 290]
          }
        ]
      }
      break

    case 'bar':
      option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['系列 1', '系列 2'], right: 10, top: 0 },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '20%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['1 月', '2 月', '3 月', '4 月', '5 月']
        },
        yAxis: { type: 'value' },
        series: [
          {
            name: '系列 1',
            type: 'bar',
            data: [120, 200, 150, 80, 70]
          },
          {
            name: '系列 2',
            type: 'bar',
            data: [220, 182, 191, 234, 290]
          }
        ]
      }
      break

    case 'funnel':
      option = {
        tooltip: { trigger: 'item' },
        series: [
          {
            type: 'funnel',
            left: '10%',
            top: 20,
            bottom: 20,
            width: '80%',
            min: 0,
            max: 100,
            minSize: '0%',
            maxSize: '100%',
            sort: 'descending',
            gap: 2,
            label: {
              show: true,
              position: 'left'
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1
            },
            data: [
              { value: 100, name: '指标' },
              { value: 80, name: '指标' },
              { value: 60, name: '指标' },
              { value: 40, name: '指标' },
              { value: 20, name: '指标' }
            ]
          }
        ]
      }
      break

    case 'horizontalBar':
      option = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '3%', containLabel: true },
        xAxis: { type: 'value' },
        yAxis: {
          type: 'category',
          data: ['1 月', '2 月', '3 月', '4 月', '5 月']
        },
        series: [
          {
            name: '系列 1',
            type: 'bar',
            data: [182, 234, 290, 104, 135],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#83bff6' },
                { offset: 0.5, color: '#188df0' },
                { offset: 1, color: '#188df0' }
              ])
            }
          }
        ]
      }
      break

    case 'gauge':
      option = {
        series: [
          {
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            splitNumber: 5,
            itemStyle: { color: '#58D9F9' },
            progress: { show: true, width: 18 },
            pointer: { show: false },
            axisLine: { lineStyle: { width: 18 } },
            axisTick: { show: false },
            splitLine: { length: 15, lineStyle: { width: 2, color: '#999' } },
            axisLabel: { distance: 25, color: '#999', fontSize: 10 },
            anchor: { show: false },
            title: { show: false },
            detail: {
              valueAnimation: true,
              width: '60%',
              lineHeight: 40,
              borderRadius: 8,
              offsetCenter: [0, '-15%'],
              fontSize: 20,
              fontWeight: 'bolder',
              formatter: '{value}',
              color: 'auto'
            },
            data: [{ value: 70 }]
          }
        ]
      }
      break

    case 'radar':
      option = {
        tooltip: {},
        radar: {
          indicator: [
            { name: '1 月', max: 100 },
            { name: '2 月', max: 100 },
            { name: '3 月', max: 100 },
            { name: '4 月', max: 100 },
            { name: '5 月', max: 100 }
          ]
        },
        series: [
          {
            name: '预算 vs 开销',
            type: 'radar',
            areaStyle: {},
            data: [
              {
                value: [42, 30, 20, 35, 50],
                name: '预算分配'
              },
              {
                value: [50, 14, 28, 26, 42],
                name: '实际开销'
              }
            ]
          }
        ]
      }
      break
  }

  chart.setOption(option)
}

const handleChartResize = () => {
  Object.values(chartInstances.value).forEach((chart: any) => chart.resize())
}

// 监听窗口大小变化
onMounted(() => {
  window.addEventListener('resize', handleChartResize)

  // 初始化所有图表
  layout.value.forEach(item => {
    if (item.type === 'chart') {
      nextTick(() => {
        initChart(item.i)
      })
    }
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleChartResize)
  Object.values(chartInstances.value).forEach((chart: any) => chart.dispose?.())
  chartInstances.value = {}
})
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;

  .vue-grid-layout {
    background: #f5f5f5;
  }

  .vue-grid-item {
    transition: all 0.2s ease;
  }

  .grid-item-content {
    width: 100%;
    height: 100%;
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  // 统计卡片样式
  .stat-card {
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;

    .stat-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;

        img {
          width: 24px;
          height: 24px;
        }
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          line-height: 1;
        }

        .stat-label {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }
      }
    }

    .filter-bar {
      margin-top: auto;
    }
  }

  // 图表卡片样式
  .chart-card {
    height: 100%;
    display: flex;
    flex-direction: column;

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      cursor: move;

      .chart-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }

      .chart-actions {
        display: flex;
        align-items: center;
      }
    }

    .chart-body {
      flex: 1;
      padding: 16px;
      min-height: 200px;
    }
  }

  // 表格卡片样式
  .table-card {
    height: 100%;
    display: flex;
    flex-direction: column;

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      cursor: move;

      .table-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }

      .table-actions {
        display: flex;
        align-items: center;
      }
    }

    .table-body {
      flex: 1;
      overflow: hidden;
      padding: 16px;
    }
  }
}
</style>
