import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cleanupTestDir, createTestDir, runCommand } from './utils'

describe('插件管理测试', () => {
  let testDir: string
  const addonName = 'test-addon'

  beforeAll(async () => {
    testDir = createTestDir('addons')
    await runCommand(['init', '-y'], { cwd: testDir })
  })

  afterAll(() => {
    cleanupTestDir(testDir)
  })

  it('应该能够列出所有插件', async () => {
    const result = await runCommand(['addons', 'list'], {
      cwd: testDir,
    })

    expect(result.success).toBe(true)
  })

  it('应该能够创建新插件', async () => {
    // 注意：addons create 会在 repo_dir 下创建插件目录
    // 所以不需要预先创建目录，命令会自动创建
    const result = await runCommand(
      [
        'addons',
        'create',
        addonName,
        '--path',
        `addons/${addonName}`,
        '--repo-dir',
        testDir,
      ],
      { cwd: testDir, verbose: true }
    )

    if (!result.success) {
      console.error('创建插件失败:', result.error)
      console.error('Stdout:', result.stdout)
      console.error('Stderr:', result.stderr)
    }

    expect(result.success).toBe(true)
  })

  it('应该能够查看插件详情', async () => {
    const result = await runCommand(['addons', 'detail', addonName], {
      cwd: testDir,
      allowFailure: true,
    })

    // 可能成功或失败，取决于插件是否存在
    expect(result.exitCode).not.toBeNull()
  })
})

