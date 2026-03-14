import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cleanupTestDir, createTestDir, runCommand } from './utils'

describe('模板管理测试', () => {
  let testDir: string
  const templateName = 'test-template'

  beforeAll(async () => {
    testDir = createTestDir('template')
    // 初始化配置
    await runCommand(['init', '-y'], { cwd: testDir })
  })

  afterAll(() => {
    cleanupTestDir(testDir)
  })

  it('应该能够列出所有模板', async () => {
    const result = await runCommand(['template', 'list'], {
      cwd: testDir,
    })

    expect(result.success).toBe(true)
  })

  it('应该能够创建新模板', async () => {
    // 注意：template create 会在 repo_dir 下创建模板目录
    // 所以不需要预先创建目录，命令会自动创建
    const result = await runCommand(
      [
        'template',
        'create',
        templateName,
        '--path',
        `templates/${templateName}`,
        '--repo-dir',
        testDir,
      ],
      { cwd: testDir, verbose: true }
    )

    if (!result.success) {
      console.error('创建模板失败:', result.error)
      console.error('Stdout:', result.stdout)
      console.error('Stderr:', result.stderr)
    }

    expect(result.success).toBe(true)
  })
})

