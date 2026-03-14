#!/bin/bash

# CoCli 发布脚本
# 使用方法: ./RELEASE.sh <version>
# 例如: ./RELEASE.sh 0.1.0

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "❌ 错误: 请提供版本号"
    echo "使用方法: ./RELEASE.sh <version>"
    echo "例如: ./RELEASE.sh 0.1.0"
    exit 1
fi

# 验证版本号格式 (x.y.z)
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "❌ 错误: 版本号格式不正确，应为 x.y.z (例如: 0.1.0)"
    exit 1
fi

TAG="v${VERSION}"

echo "🚀 开始发布 CoCli v${VERSION}"

# 1. 更新版本号
echo "📝 更新版本号..."
sed -i.bak "s/^version = \".*\"/version = \"${VERSION}\"/" apps/main/Cargo.toml
sed -i.bak "s/\"version\": \".*\"/\"version\": \"${VERSION}\"/" apps/main/package.json
rm -f apps/main/Cargo.toml.bak apps/main/package.json.bak

echo "✅ 版本号已更新:"
echo "   - apps/main/Cargo.toml: ${VERSION}"
echo "   - apps/main/package.json: ${VERSION}"

# 2. 检查是否有未提交的更改
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  检测到未提交的更改，请先提交或暂存"
    read -p "是否继续? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 3. 提交更改
echo "📦 提交更改..."
git add apps/main/Cargo.toml apps/main/package.json
git commit -m "chore: bump version to ${VERSION}" || echo "⚠️  没有更改需要提交"

# 4. 创建 tag
echo "🏷️  创建 Git tag: ${TAG}"
git tag -a "${TAG}" -m "Release ${TAG}"

# 5. 推送代码和 tag
echo "📤 推送代码和 tag..."
git push origin main
git push origin "${TAG}"

echo ""
echo "✅ 发布完成！"
echo ""
echo "📋 下一步:"
echo "   1. GitHub Actions 会自动构建并创建 Release"
echo "   2. 用户可以通过以下命令安装:"
echo "      npm install -g git+https://github.com/couriourc/cocli.git#${TAG}"
echo ""
echo "🔍 查看发布状态:"
echo "   https://github.com/couriourc/cocli/actions"
echo "   https://github.com/couriourc/cocli/releases"

