# 安装

CoCli 可以通过多种方式安装。

## 使用包管理器安装

### pnpm（推荐）

```bash
# 全局安装（从 Git 安装）
pnpm add -g git+https://github.com/couriourc/cocli.git

# 验证安装
cocli --version
```

### npm

```bash
# 全局安装
npm install -g git+https://github.com/couriourc/cocli.git

# 验证安装
cocli --version
```

### yarn

```bash
# 全局安装
yarn global add git+https://github.com/couriourc/cocli.git

# 验证安装
cocli --version
```

## 使用 dlx（无需安装）

使用 pnpm dlx 可以直接运行，无需全局安装：

```bash
pnpm dlx git+https://github.com/couriourc/cocli.git app create --template=vue3 my-app
```

## 从源码构建

### 前置要求

- [Rust](https://www.rust-lang.org/) 1.70 或更高版本
- [Cargo](https://doc.rust-lang.org/cargo/)（Rust 的包管理器）

### 构建步骤

1. **克隆仓库**

   ```bash
   git clone https://github.com/couriourc/cocli.git
   cd cocli
   ```

2. **安装依赖**

   ```bash
   pnpm install
   ```

3. **构建项目**

   ```bash
   pnpm build
   ```

4. **运行**

   ```bash
   # 使用 cargo 运行
   cd apps/main
   cargo run -- --help

   # 或使用构建后的二进制文件
   ./target/release/cocli --help
   ```

## 验证安装

安装完成后，运行以下命令验证：

```bash
cocli --version
cocli --help
```

如果看到版本信息和帮助信息，说明安装成功！

## 卸载

### pnpm

```bash
pnpm remove -g @couriourc/cocli
```

### npm

```bash
npm uninstall -g @couriourc/cocli
```

### yarn

```bash
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

