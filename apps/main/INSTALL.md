# 安装指南

CoCli 通过 Git 仓库分发，可以通过多种方式安装。

## 从 Git 安装

### 使用 pnpm（推荐）

```bash
# 安装最新版本
pnpm add -g git+https://github.com/couriourc/cocli.git

# 安装特定版本（使用 git tag）
pnpm add -g git+https://github.com/couriourc/cocli.git#v0.1.0

# 安装特定分支
pnpm add -g git+https://github.com/couriourc/cocli.git#main
```

### 使用 npm

```bash
# 安装最新版本
npm install -g git+https://github.com/couriourc/cocli.git

# 安装特定版本
npm install -g git+https://github.com/couriourc/cocli.git#v0.1.0

# 安装特定分支
npm install -g git+https://github.com/couriourc/cocli.git#main
```

### 使用 yarn

```bash
# 安装最新版本
yarn global add git+https://github.com/couriourc/cocli.git

# 安装特定版本
yarn global add git+https://github.com/couriourc/cocli.git#v0.1.0
```

## 从源码运行

### 前置要求

- [Node.js](https://nodejs.org/) 18+ 
- [pnpm](https://pnpm.io/) 10.15.0+

### 运行步骤

1. **克隆仓库**

   ```bash
   git clone https://github.com/couriourc/cocli.git
   cd cocli
   ```

2. **安装依赖**

   ```bash
   pnpm install
   ```

3. **运行**

   ```bash
   cd apps/main
   node src/index.js --help
   ```

## 验证安装

安装完成后，运行以下命令验证：

```bash
cocli --version
cocli --help
```

如果看到版本信息和帮助信息，说明安装成功！

## 更新

更新到最新版本：

```bash
# pnpm
pnpm update -g git+https://github.com/couriourc/cocli.git

# npm
npm update -g git+https://github.com/couriourc/cocli.git

# yarn
yarn global upgrade git+https://github.com/couriourc/cocli.git
```

## 卸载

```bash
# pnpm
pnpm remove -g @couriourc/cocli

# npm
npm uninstall -g @couriourc/cocli

# yarn
yarn global remove @couriourc/cocli
```

## 故障排除

### 命令未找到

如果运行 `cocli` 时提示命令未找到：

1. **检查 PATH 环境变量**

   确保 npm/pnpm 的全局 bin 目录在 PATH 中：
   
   ```bash
   # Windows
   echo %APPDATA%\npm
   
   # Linux/macOS
   echo $HOME/.local/share/pnpm
   ```

2. **重新安装**

   ```bash
   pnpm add -g git+https://github.com/couriourc/cocli.git --force
   ```

### 安装失败

如果从 Git 安装时失败：

1. 确保已安装 Node.js 和 pnpm
2. 检查网络连接（需要下载 npm 依赖）
3. 尝试从源码运行（见上方"从源码运行"部分）

### 权限问题

如果遇到权限错误：

```bash
# Linux/macOS - 使用 sudo
sudo pnpm add -g git+https://github.com/couriourc/cocli.git

# 或配置 npm 不使用 sudo
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

