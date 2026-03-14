import { defineConfig } from 'vitepress'

// 从环境变量获取 base 路径，默认为 '/'
// 如果部署到 GitHub Pages 且仓库名不是 username.github.io，需要设置 base 为 '/仓库名/'
const base = process.env.VITEPRESS_BASE || '/'

export default defineConfig({
  base,
  title: 'QCli',
  description: '一个灵活、强大的项目脚手架工具，支持从多种来源（Git、FTP、本地目录）获取模板和插件',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],

  themeConfig: {
    logo: '/logo.png',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: '命令', link: '/commands/' },
      { text: '配置', link: '/config/' },
      { text: '示例', link: '/examples/' },
      { text: 'GitHub', link: 'https://github.com/couriourc/qcli' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '初始化配置', link: '/guide/init' }
          ]
        },
        {
          text: '核心概念',
          items: [
            { text: '工作区', link: '/guide/workspace' },
            { text: '应用', link: '/guide/app' },
            { text: '模板', link: '/guide/template' },
            { text: '插件', link: '/guide/addons' }
          ]
        }
      ],
      '/commands/': [
        {
          text: '命令参考',
          items: [
            { text: '概述', link: '/commands/' },
            { text: '应用管理', link: '/commands/app' },
            { text: '模板管理', link: '/commands/template' },
            { text: '插件管理', link: '/commands/addons' },
            { text: '工作区管理', link: '/commands/workspace' },
            { text: '配置管理', link: '/commands/config' },
            { text: '初始化', link: '/commands/init' }
          ]
        }
      ],
      '/config/': [
        {
          text: '配置',
          items: [
            { text: '配置文件', link: '/config/' },
            { text: '.qclrc', link: '/config/qclrc' },
            { text: '.qclocal', link: '/config/qclocal' },
            { text: '仓库配置', link: '/config/repos' },
            { text: '元数据', link: '/config/meta' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '快速开始', link: '/examples/' },
            { text: '创建 Vue 项目', link: '/examples/vue-project' },
            { text: '使用工作区', link: '/examples/workspace' },
            { text: '添加插件', link: '/examples/addons' },
            { text: '配置继承', link: '/examples/inherit' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/couriourc/qcli' }
    ],

    footer: {
      message: 'Released under the ISC License.',
      copyright: 'Copyright © 2024 QCli'
    },

    search: {
      provider: 'local'
    }
  }
})

