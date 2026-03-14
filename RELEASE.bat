@echo off
REM CoCli 发布脚本 (Windows)
REM 使用方法: RELEASE.bat <version>
REM 例如: RELEASE.bat 0.1.0

setlocal enabledelayedexpansion

set VERSION=%1

if "%VERSION%"=="" (
    echo ❌ 错误: 请提供版本号
    echo 使用方法: RELEASE.bat ^<version^>
    echo 例如: RELEASE.bat 0.1.0
    exit /b 1
)

set TAG=v%VERSION%

echo 🚀 开始发布 CoCli v%VERSION%

REM 1. 更新版本号
echo 📝 更新版本号...

REM 更新 Cargo.toml (需要 PowerShell 或 sed)
powershell -Command "(Get-Content apps\main\Cargo.toml) -replace 'version = \"[^\"]*\"', 'version = \"%VERSION%\"' | Set-Content apps\main\Cargo.toml"

REM 更新 package.json
powershell -Command "(Get-Content apps\main\package.json) -replace '\"version\": \"[^\"]*\"', '\"version\": \"%VERSION%\"' | Set-Content apps\main\package.json"

echo ✅ 版本号已更新:
echo    - apps\main\Cargo.toml: %VERSION%
echo    - apps\main\package.json: %VERSION%

REM 2. 检查是否有未提交的更改
git diff-index --quiet HEAD --
if errorlevel 1 (
    echo ⚠️  检测到未提交的更改
    set /p CONTINUE="是否继续? (y/n): "
    if /i not "!CONTINUE!"=="y" exit /b 1
)

REM 3. 提交更改
echo 📦 提交更改...
git add apps\main\Cargo.toml apps\main\package.json
git commit -m "chore: bump version to %VERSION%" || echo ⚠️  没有更改需要提交

REM 4. 创建 tag
echo 🏷️  创建 Git tag: %TAG%
git tag -a %TAG% -m "Release %TAG%"

REM 5. 推送代码和 tag
echo 📤 推送代码和 tag...
git push origin main
git push origin %TAG%

echo.
echo ✅ 发布完成！
echo.
echo 📋 下一步:
echo    1. GitHub Actions 会自动构建并创建 Release
echo    2. 用户可以通过以下命令安装:
echo       npm install -g git+https://github.com/couriourc/cocli.git#%TAG%
echo.
echo 🔍 查看发布状态:
echo    https://github.com/couriourc/cocli/actions
echo    https://github.com/couriourc/cocli/releases

