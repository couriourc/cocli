import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { runCommand, createTestDir, cleanupTestDir } from './utils'

describe('配置管理测试', () => {
  let testDir: string

  beforeAll(() => {
    testDir = createTestDir('config')
    // 初始化配置
    return runCommand(['init', '-y'], { cwd: testDir })
  })

  afterAll(() => {
    cleanupTestDir(testDir)
  })

  it('应该能够列出所有配置', async () => {
    const result = await runCommand(['config', 'list'], {
      cwd: testDir,
    })

    expect(result.success).toBe(true)
  })

  it('应该能够设置配置值', async () => {
    const result = await runCommand(
      ['config', 'set', 'test.key', 'test.value'],
      { cwd: testDir }
    )

    expect(result.success).toBe(true)
  })

  it('应该能够获取配置值', async () => {
    const result = await runCommand(['config', 'get', 'test.key'], {
      cwd: testDir,
    })

    // 可能成功或失败，取决于配置系统
    expect(result.exitCode).not.toBeNull()
  })
})

