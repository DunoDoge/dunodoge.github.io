import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const docsDir = path.join(rootDir, 'docs')
const outputFile = path.join(rootDir, 'latest.md')

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}

async function getLatestMarkdownFile() {
  const markdownFiles = await walk(docsDir)
  if (markdownFiles.length === 0) {
    return null
  }

  const filesWithStats = await Promise.all(markdownFiles.map(async (file) => {
    const stat = await fs.stat(file)
    return { file, mtimeMs: stat.mtimeMs }
  }))

  filesWithStats.sort((a, b) => b.mtimeMs - a.mtimeMs)
  return filesWithStats[0]?.file ?? null
}

function toRoute(filePath) {
  const relativePath = path.relative(rootDir, filePath)
  const withoutExt = relativePath.replace(/\.md$/i, '')
  return `/${withoutExt.replace(/\\/g, '/')}`
}

async function main() {
  const latestFile = await getLatestMarkdownFile()
  const target = latestFile ? toRoute(latestFile) : '/'

  const markdown = `---
title: 正在跳转
---

<meta http-equiv="refresh" content="0; url=${target}" />
<script>
  window.location.replace('${target}')
</script>

正在跳转到最新文章...

[立即前往](${target})
`

  await fs.mkdir(path.dirname(outputFile), { recursive: true })
  await fs.writeFile(outputFile, markdown, 'utf8')
  console.log(`Latest link updated to ${target}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
