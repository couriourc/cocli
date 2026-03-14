import { execa } from 'execa'
import { existsSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'

export interface CommandResult {
  success: boolean
  stdout: string
  stderr: string
  exitCode: number | null
  error?: string
}

/**
 * 获取 cocli 命令路径和执行方式
 */
function getCocliCommand(): { command: string; usePnpm: boolean } {
  // 优先尝试使用 pnpm cocli（在项目根目录下通常可用）
  // 检查是否有 package.json（表示这是一个项目）
  const packageJsonPath = join(process.cwd(), 'package.json')
  if (existsSync(packageJsonPath)) {
    // 尝试使用 pnpm cocli
    return { command: 'pnpm', usePnpm: true }
  }
  
  // 尝试使用本地的包装脚本（它会自动查找二进制文件）
  const localScript = join(process.cwd(), 'apps', 'main', 'bin', 'cocli.js')
  if (existsSync(localScript)) {
    return { command: 'node', usePnpm: false }
  }
  
  // 如果没有脚本，尝试使用本地构建的二进制文件
  const isWindows = process.platform === 'win32'
  const ext = isWindows ? '.exe' : ''
  
  const localPaths = [
    join(process.cwd(), 'apps', 'main', 'target', 'release', `cocli${ext}`),
    join(process.cwd(), 'apps', 'main', 'target', 'debug', `cocli${ext}`),
  ]
  
  for (const path of localPaths) {
    if (existsSync(path)) {
      return { command: path, usePnpm: false }
    }
  }
  
  // 如果本地没有，尝试使用全局命令
  return { command: 'cocli', usePnpm: false }
}

/**
 * 获取完整的命令参数（包括脚本路径）
 */
function getCocliArgs(args: string[]): { command: string; execArgs: string[] } {
  const { command, usePnpm } = getCocliCommand()
  
  if (usePnpm) {
    // 使用 pnpm cocli
    return { command: 'pnpm', execArgs: ['cocli', ...args] }
  } else if (command === 'node') {
    // 使用 node 执行本地脚本
    const scriptPath = join(process.cwd(), 'apps', 'main', 'bin', 'cocli.js')
    return { command: 'node', execArgs: [scriptPath, ...args] }
  } else {
    // 直接使用命令（二进制文件路径或全局命令）
    return { command, execArgs: args }
  }
}

/**
 * 检查 cocli 命令是否可用
 */
export async function checkCocliAvailable(): Promise<boolean> {
  const { command, execArgs } = getCocliArgs(['--version'])
  
  try {
    const result = await execa(command, execArgs, {
      reject: false,
      encoding: 'utf8',
    })
    return result.exitCode === 0
  } catch {
    return false
  }
}

/**
 * 执行 cocli 命令
 */
export async function runCommand(
  args: string[],
  options: { cwd?: string; allowFailure?: boolean; verbose?: boolean } = {}
): Promise<CommandResult> {
  const { cwd, allowFailure = false, verbose = false } = options

  const { command, execArgs } = getCocliArgs(args)
  
  try {
    const result = await execa(command, execArgs, {
      cwd: cwd || process.cwd(),
      reject: false,
      encoding: 'utf8',
      env: {
        ...process.env,
      },
    })

    if (verbose) {
      console.log(`Command: cocli ${args.join(' ')}`)
      console.log(`Exit code: ${result.exitCode}`)
      if (result.stdout) console.log(`Stdout: ${result.stdout}`)
      if (result.stderr) console.log(`Stderr: ${result.stderr}`)
    }

    const success = result.exitCode === 0 || allowFailure

    return {
      success,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      exitCode: result.exitCode,
      error: success ? undefined : `Command failed with exit code ${result.exitCode}`,
    }
  } catch (error: any) {
    const errorMessage = error.message || String(error)
    
    if (verbose) {
      console.error(`Command error: ${errorMessage}`)
    }

    if (allowFailure) {
      return {
        success: true,
        stdout: error.stdout || '',
        stderr: error.stderr || errorMessage,
        exitCode: error.exitCode || 1,
        error: errorMessage,
      }
    }
    
    return {
      success: false,
      stdout: error.stdout || '',
      stderr: error.stderr || errorMessage,
      exitCode: error.exitCode || 1,
      error: errorMessage,
    }
  }
}

/**
 * 创建临时测试目录
 */
export function createTestDir(name: string): string {
  const testDir = join(process.cwd(), `test-${name}-${Date.now()}`)
  if (existsSync(testDir)) {
    rmSync(testDir, { recursive: true, force: true })
  }
  mkdirSync(testDir, { recursive: true })
  return testDir
}

/**
 * 清理测试目录
 */
export function cleanupTestDir(dir: string) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true })
  }
}

/**
 * 检查文件是否存在
 */
export function fileExists(path: string): boolean {
  return existsSync(path)
}


