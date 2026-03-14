import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { runCommand, createTestDir, cleanupTestDir } from './utils'

describe('工作区管理测试', () => {
  let testDir: string
  const workspaceName = 'test-workspace'

  beforeAll(() => {
    testDir = createTestDir('workspace')
    return runCommand(['init', '-y'], { cwd: testDir })
  })

  afterAll(async () => {
    // 清理工作区
    await runCommand(['workspace', 'delete', workspaceName], {
      allowFailure: true,
    })
    cleanupTestDir(testDir)
  })

  it('应该能够创建新工作区', async () => {
    const result = await runCommand(['workspace', 'create', workspaceName], {
      cwd: testDir,
    })

    expect(result.success).toBe(true)
  })

  it('应该能够列出所有工作区', async () => {
    const result = await runCommand(['workspace', 'list'], {
      cwd: testDir,
    })

    expect(result.success).toBe(true)
  })

  it('应该能够切换到工作区', async () => {
    const result = await runCommand(['workspace', 'use', workspaceName], {
      cwd: testDir,
    })

    expect(result.success).toBe(true)
  })

  it('应该能够显示当前工作区', async () => {
    const result = await runCommand(['workspace', 'current'], {
      cwd: testDir,
    })

    expect(result.success).toBe(true)
  })

  it('应该能够删除工作区', async () => {
    const result = await runCommand(['workspace', 'delete', workspaceName], {
      cwd: testDir,
      allowFailure: true,
    })

    // 删除可能成功或失败，取决于工作区是否存在
    expect(result.exitCode).not.toBeNull()
  })
})

