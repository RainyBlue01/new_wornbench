/**
 * ECharts 导入语句批量替换脚本
 * 
 * 使用方法：
 * node scripts/migrate-echarts.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const srcDir = path.join(__dirname, '..', 'src')

// 需要替换的文件列表（根据实际扫描结果）
const filesToMigrate = [
  'views/dashboard/index.vue',
  'views/taskChartCenter/index.vue',
  'components/basic/text_cup.vue',
  'views/targets/index.vue',
  'views/designer/index.vue',
]

/**
 * 替换文件中的 ECharts 导入语句
 */
function migrateFile(filePath) {
  const fullPath = path.join(srcDir, filePath)
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  文件不存在: ${filePath}`)
    return false
  }
  
  let content = fs.readFileSync(fullPath, 'utf-8')
  const originalContent = content
  
  // 替换全量引入为按需引入
  const patterns = [
    {
      from: /import \* as echarts from ['"]echarts['"]/g,
      to: "import echarts from '@/utils/echarts'"
    },
    {
      from: /import \* as echarts from ["']echarts["']/g,
      to: "import echarts from '@/utils/echarts'"
    }
  ]
  
  let changed = false
  patterns.forEach(pattern => {
    if (pattern.from.test(content)) {
      content = content.replace(pattern.from, pattern.to)
      changed = true
    }
  })
  
  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf-8')
    console.log(`✅ 已更新: ${filePath}`)
    return true
  } else {
    console.log(`⏭️  无需更新: ${filePath}`)
    return false
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始迁移 ECharts 导入语句...\n')
  
  let successCount = 0
  let skipCount = 0
  
  filesToMigrate.forEach(file => {
    const result = migrateFile(file)
    if (result) {
      successCount++
    } else {
      skipCount++
    }
  })
  
  console.log('\n' + '='.repeat(50))
  console.log(`✨ 迁移完成！`)
  console.log(`   ✅ 成功: ${successCount} 个文件`)
  console.log(`   ⏭️  跳过: ${skipCount} 个文件`)
  console.log('='.repeat(50))
  console.log('\n📝 下一步：')
  console.log('   1. 运行 npm run build 测试构建')
  console.log('   2. 检查所有图表是否正常显示')
  console.log('   3. 如有问题，查看 ECHARTS_MIGRATION.md')
}

main()
