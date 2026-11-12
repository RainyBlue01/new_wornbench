<template>
  <div class="report-center">


    <!-- 核心指标卡片 -->
    <div class="stats-row">
      <!-- 卡片 1 -->
      <div class="stat-card">
        <div class="stat-icon bg-blue">
          <icon-bar-chart />
        </div>
        <div class="stat-content">
          <div class="stat-label">本月审批总量</div>
          <div class="stat-value">156</div>
          <div class="stat-trend up">
            <icon-arrow-rise />
            较上月增长 12%
          </div>
        </div>
      </div>

      <!-- 卡片 2 -->
      <div class="stat-card">
        <div class="stat-icon bg-green">
          <icon-clock-circle />
        </div>
        <div class="stat-content">
          <div class="stat-label">平均审批时长</div>
          <div class="stat-value">2.3<span class="unit">天</span></div>
          <div class="stat-trend down">
            <icon-arrow-fall />
            较上月缩短 0.5天
          </div>
        </div>
      </div>

      <!-- 卡片 3 -->
      <div class="stat-card">
        <div class="stat-icon bg-orange">
          <icon-exclamation-circle />
        </div>
        <div class="stat-content">
          <div class="stat-label">待处理积压</div>
          <div class="stat-value">23</div>
          <div class="stat-trend up text-red">
            <icon-arrow-rise />
            较上月增加 5件
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 1: 审批类型分布 -->
    <div class="chart-card">
      <h3 class="chart-title">审批类型分布</h3>
      <div class="bar-chart-list">
        <div v-for="(item, index) in typeData" :key="index" class="bar-item">
          <div class="bar-label">{{ item.name }}</div>
          <div class="bar-track">
            <div 
              class="bar-fill" 
              :style="{ width: item.percent + '%', background: item.color }"
            ></div>
          </div>
          <div class="bar-value">{{ item.percent }}%</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 2: 最近30天审批趋势 -->
    <div class="chart-card">
      <h3 class="chart-title">最近30天审批趋势</h3>
      <div class="bar-chart-trend">
        <div v-for="(item, index) in trendData" :key="index" class="trend-col">
          <div class="trend-bar" :style="{ height: item.height + '%' }"></div>
          <div class="trend-date">{{ item.date }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 审批类型分布数据
const typeData = ref([
  { name: '学生请假', percent: 35, color: 'rgb(var(--primary-6))' },
  { name: '经费报销', percent: 28, color: '#f97316' },
  { name: '设备采购', percent: 20, color: '#8b5cf6' },
  { name: '教师调课', percent: 12, color: '#22c55e' },
  { name: '其他', percent: 5, color: '#94a3b8' },
]);

// 审批趋势数据（模拟最近14天）
const trendData = ref([
  { date: '4/10', height: 30 },
  { date: '4/11', height: 45 },
  { date: '4/12', height: 35 },
  { date: '4/13', height: 50 },
  { date: '4/14', height: 60 },
  { date: '4/15', height: 40 },
  { date: '4/16', height: 55 },
  { date: '4/17', height: 70 },
  { date: '4/18', height: 65 },
  { date: '4/19', height: 80 },
  { date: '4/20', height: 75 },
  { date: '4/21', height: 90 },
  { date: '4/22', height: 85 },
  { date: '4/23', height: 80 },
]);
</script>

<style lang="scss" scoped>
@use '@/styles/workbench-home.scss' as home;

.report-center {
//   padding: 24px;
  background: #f8fafc;
//   min-height: 100vh;

  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .title {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 4px 0;
    }

    .desc {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: white;
      border: 1px solid #e2e8f0;
      color: #475569;
      
      &:hover {
        border-color: rgb(var(--primary-6));
        color: rgb(var(--primary-6));
      }
    }
  }

  // 统计卡片行
  .stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 24px;

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        flex-shrink: 0;

        &.bg-blue {
          background: #eff6ff;
          color: rgb(var(--primary-6));
        }

        &.bg-green {
          background: #f0fdf4;
          color: #22c55e;
        }

        &.bg-orange {
          background: #fff7ed;
          color: #f97316;
        }
      }

      .stat-content {
        flex: 1;

        .stat-label {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
          margin-bottom: 8px;

          .unit {
            font-size: 16px;
            font-weight: 500;
            color: #64748b;
            margin-left: 4px;
          }
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 500;

          &.up {
            color: #16a34a;
          }

          &.down {
            color: #16a34a;
          }
          
          &.text-red {
            color: #dc2626;
          }
        }
      }
    }
  }

  // 图表卡片
  .chart-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    .chart-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 20px 0;
    }

    // 水平条形图
    .bar-chart-list {
      .bar-item {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        gap: 16px;

        &:last-child {
          margin-bottom: 0;
        }

        .bar-label {
          width: 80px;
          font-size: 14px;
          color: #475569;
          flex-shrink: 0;
        }

        .bar-track {
          flex: 1;
          height: 10px;
          background: #f1f5f9;
          border-radius: 5px;
          overflow: hidden;

          .bar-fill {
            height: 100%;
            border-radius: 5px;
            transition: width 0.8s ease;
          }
        }

        .bar-value {
          width: 40px;
          text-align: right;
          font-size: 14px;
          color: #64748b;
          flex-shrink: 0;
        }
      }
    }

    // 趋势柱状图
    .bar-chart-trend {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      height: 200px;
      padding-top: 20px;
      gap: 8px;

      .trend-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
        justify-content: flex-end;

        .trend-bar {
          width: 100%;
          background: linear-gradient(180deg, #93c5fd 0%, #dbeafe 100%);
          border-radius: 6px 6px 0 0;
          min-height: 4px;
          transition: height 0.5s ease;
          
          &:hover {
            background: linear-gradient(180deg, rgb(var(--primary-6)) 0%, #60a5fa 100%);
          }
        }

        .trend-date {
          margin-top: 10px;
          font-size: 12px;
          color: #94a3b8;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
