#!/bin/bash

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# 查找可执行文件
RELEASE_PATH="$PROJECT_DIR/target/release/qcl"
DEBUG_PATH="$PROJECT_DIR/target/debug/qcl"

if [ -f "$RELEASE_PATH" ]; then
    exec "$RELEASE_PATH" "$@"
elif [ -f "$DEBUG_PATH" ]; then
    exec "$DEBUG_PATH" "$@"
else
    echo "错误: 未找到构建的二进制文件。请先运行: pnpm build" >&2
    exit 1
fi

