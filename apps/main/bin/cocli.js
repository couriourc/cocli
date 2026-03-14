#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 获取可执行文件路径
const isWindows = process.platform === 'win32';
const exeName = isWindows ? 'cocli.exe' : 'cocli';
const releasePath = path.join(__dirname, '..', 'target', 'release', exeName);
const debugPath = path.join(__dirname, '..', 'target', 'debug', exeName);

// 优先使用 release 版本，如果没有则使用 debug 版本
let binaryPath = null;
if (fs.existsSync(releasePath)) {
    binaryPath = releasePath;
} else if (fs.existsSync(debugPath)) {
    binaryPath = debugPath;
} else {
    // 如果没有构建的二进制文件，尝试使用 cargo run（开发环境）
    const cargoPath = isWindows ? 'cargo.exe' : 'cargo';
    const args = ['run', '--release', '--', ...process.argv.slice(2)];
    const child = spawn(cargoPath, args, {
        stdio: 'inherit',
        shell: isWindows,
        cwd: path.join(__dirname, '..')
    });
    
    child.on('error', (error) => {
        console.error(`执行错误: ${error.message}`);
        console.error('提示: 请先运行 pnpm build 构建二进制文件');
        process.exit(1);
    });
    
    child.on('exit', (code) => {
        process.exit(code || 0);
    });
    
    return;
}

// 执行二进制文件
const args = process.argv.slice(2);
const child = spawn(binaryPath, args, {
    stdio: 'inherit',
    shell: isWindows
});

child.on('error', (error) => {
    console.error(`执行错误: ${error.message}`);
    process.exit(1);
});

child.on('exit', (code) => {
    process.exit(code || 0);
});

