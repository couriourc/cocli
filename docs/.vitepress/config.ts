import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'CoCli',
  description: '灵活的项目脚手架工具，支持多源模板、插件管理、工作区管理',
  
  // 基础配置
  base: '/',
  lang: 'zh-CN',
  
  // 主题配置
  themeConfig: {
    // 导航栏
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '命令参考', link: '/guide/commands' },
      { text: '配置', link: '/config/qclrc' },
      { text: '示例', link: '/examples/basic' },
      { text: 'GitHub', link: 'https://github.com/couriourc/cocli' },
    ],
    
    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '命令参考', link: '/guide/commands' },
          ],
        },
        {
          text: '核心功能',
          items: [
            { text: '模板系统', link: '/guide/templates' },
            { text: '插件系统', link: '/guide/addons' },
            { text: '工作区管理', link: '/guide/workspace' },
            { text: '多源仓库', link: '/guide/repo' },
          ],
        },
        {
          text: '高级用法',
          items: [
            { text: '高级功能', link: '/guide/advanced' },
          ],
        },
      ],
      '/config/': [
        {
          text: '配置参考',
          items: [
            { text: '.qclrc 配置', link: '/config/qclrc' },
            { text: 'meta.yaml 配置', link: '/config/meta-yaml' },
            { text: '环境变量', link: '/config/env' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '使用示例',
          items: [
            { text: '基础示例', link: '/examples/basic' },
            { text: 'Vue3 项目', link: '/examples/vue3-project' },
            { text: '团队协作', link: '/examples/team' },
            { text: '常见问题', link: '/examples/troubleshooting' },
          ],
        },
      ],
    },
    
    // 搜索配置
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档',
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
            },
          },
        },
      },
    },
    
    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/couriourc/cocli' },
    ],
    
    // 页脚
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024 CoCli',
    },
    
    // 编辑链接
    editLink: {
      pattern: 'https://github.com/couriourc/cocli/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },
    
    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
    },
    
    // 返回顶部
    returnToTopLabel: '返回顶部',
    
    // 侧边栏菜单
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
  },
  
  // Markdown 配置
  markdown: {
    lineNumbers: true,
    config: (md) => {
      // 可以添加 markdown-it 插件
    },
  },
  
  // 头部配置
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
    ['meta', { name: 'theme-color', content: '#3498db' }],
  ],
});
