import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { runCommand, createTestDir, cleanupTestDir, fileExists, checkCocliAvailable } from './utils'

describe('初始化配置测试', () => {
  let testDir: string
  const testConfig = '.qclrc'
  let cocliAvailable = false

  beforeAll(async () => {
    testDir = createTestDir('init')
    cocliAvailable = await checkCocliAvailable()
    if (!cocliAvailable) {
      console.warn('警告: cocli 命令不可用，跳过测试')
    }
  })

  afterAll(() => {
    cleanupTestDir(testDir)
  })

  it('应该能够初始化配置文件（非交互模式）', async () => {
    if (!cocliAvailable) {
      console.log('跳过测试: cocli 命令不可用')
      return
    }

    const result = await runCommand(['init', '-y', '-f', testConfig], {
      cwd: testDir,
      verbose: true,
    })

    if (!result.success) {
      console.error('命令失败:', result.error)
      console.error('Stdout:', result.stdout)
      console.error('Stderr:', result.stderr)
    }

    expect(result.success).toBe(true)
    expect(fileExists(`${testDir}/${testConfig}`)).toBe(true)
  })

  it('应该能够创建配置文件', () => {
    if (!cocliAvailable) {
      console.log('跳过测试: cocli 命令不可用')
      return
    }
    expect(fileExists(`${testDir}/${testConfig}`)).toBe(true)
  })
})

