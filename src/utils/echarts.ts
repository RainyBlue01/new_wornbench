/**
 * ECharts 按需加载配置
 * 根据项目实际使用的图表类型进行引入，减少打包体积
 */

// 核心模块
import * as echarts from 'echarts/core'

// 图表类型（根据项目实际使用情况添加）
import {
  LineChart,      // 折线图
  BarChart,       // 柱状图
  PieChart,       // 饼图
  RadarChart,     // 雷达图
  FunnelChart,    // 漏斗图
  GaugeChart,     // 仪表盘
} from 'echarts/charts'

// 组件
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
  DataZoomComponent,
  VisualMapComponent,
} from 'echarts/components'

// 渲染器
import {
  CanvasRenderer,
  SVGRenderer,
} from 'echarts/renderers'

// 注册必需的组件
echarts.use([
  // 图表
  LineChart,
  BarChart,
  PieChart,
  RadarChart,
  FunnelChart,
  GaugeChart,
  
  // 组件
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
  DataZoomComponent,
  VisualMapComponent,
  
  // 渲染器
  CanvasRenderer,
  SVGRenderer,
])

// 导出 echarts 实例
export default echarts

// 导出常用类型（方便 TypeScript 使用）
export type { ECharts } from 'echarts/core'
export type {
  EChartsOption,
  LineSeriesOption,
  BarSeriesOption,
  PieSeriesOption,
  RadarSeriesOption,
  FunnelSeriesOption,
  GaugeSeriesOption,
} from 'echarts'
