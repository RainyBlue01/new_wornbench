import { fontSplit } from '@konghayao/cn-font-split'
import path from 'path'
import fs from 'fs-extra'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const fontMap = [
  {
    file: 'Alibaba_PuHuiTi_2.0_55_Regular_55_Regular.ttf',
    family: 'Alibaba PuHuiTi 2.0-55 Regular',
  },
  {
    file: 'Alibaba_PuHuiTi_2.0_65_Medium_65_Medium.ttf',
    family: 'Alibaba PuHuiTi 2.0-65 Medium',
  },
  {
    file: 'Alibaba_PuHuiTi_2.0_75_SemiBold_75_SemiBold.ttf',
    family: 'Alibaba PuHuiTi 2.0-75 SemiBold',
  },
  {
    file: 'Alibaba_PuHuiTi_2.0_85_Bold_85_Bold.ttf',
    family: 'Alibaba PuHuiTi 2.0-85 Bold',
  },
]

const inputDir = path.resolve(__dirname, '../src/styles/fontFamily')
const outputDir = path.resolve(__dirname, '../public/fonts')
const finalCssPath = path.join(outputDir, 'fonts.css')

if (fs.existsSync(outputDir)) {
  fs.emptyDirSync(outputDir)
} else {
  fs.mkdirSync(outputDir, { recursive: true })
}

let allCss = ''

const processFonts = async () => {
  for (const font of fontMap) {
    // 使用临时目录避免文件名冲突
    const tempDir = path.join(outputDir, font.family.replace(/[\s\.]/g, '_'))

    await fontSplit({
      FontPath: path.join(inputDir, font.file),
      destFold: tempDir,
      targetType: 'woff2',
      chunkSize: 50 * 1024, // 50kb 切片大小
      css: {
        fontFamily: font.family,
        fontDisplay: 'swap',
        fontWeight: 'normal',
      },
    })

    // 移动文件并合并 CSS
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir)
      let cssContent = fs.readFileSync(path.join(tempDir, 'result.css'), 'utf-8')

      // 将分片文件移动到根 outputDir
      for (const file of files) {
        if (file.endsWith('.woff2')) {
          const sourcePath = path.join(tempDir, file)
          const destPath = path.join(outputDir, file)

          // 如果文件已存在（哈希相同），则不需要移动
          if (!fs.existsSync(destPath)) {
            fs.moveSync(sourcePath, destPath)
          }
        }
      }

      // 追加 CSS 内容
      allCss += `/* ${font.family} */\n${cssContent}\n`

      // 删除临时目录
      fs.removeSync(tempDir)
    }
  }

  // 写入最终的 CSS 文件
  fs.writeFileSync(finalCssPath, allCss)
}

processFonts().catch(err => {
  process.exit(1)
})
