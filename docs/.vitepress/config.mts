import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "橘南生 - OrangeSouthborn",
  description: "一个Minecraft资源包",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    notFound: {
      title: "页面不存在,也许找不到了.",
      quote: "但如果你不改变方向,继续寻找,你最终可能会到达你想要的地方.",
      linkText: "返回主页吧",
      code: "404",
    },
    nav: [
      { text: '简介', link: 'introduction/getting-started' },
      { text: '资源包', link: 'resourcepack/resource_list' },
      { text: '应用程序', link: 'application/MinecraftResourcepacksAutoUpdate' },
      { text: '论坛集群', link: 'other/forum_cluster' }
    ],
    logo: '/logo.png',

    sidebar: [
      {
        text: '简介',
        items: [
          { text: '快速开始', link: 'introduction/getting-started' }
        ]
      },
      {
        text: '资源包',
        items: [
          { text: '资源列表', link: 'resourcepack/resource_list' },
          { text: '功能指南', link: 'resourcepack/function_guide' }
        ]
      },
      {
        text: '应用程序',
        items: [
          { text: 'Minecraft资源包自动更新', link: 'application/MinecraftResourcepacksAutoUpdate' }
        ]
      },
      {
        text: '其他',
        items: [
          { text: '论坛集群', link: 'other/forum_cluster' },
          { text: '赞助', link: 'other/sponsor' }
        ]
      }
    ],

    socialLinks: [
      // { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
    outline: {
      level: 2,
      label: "页面导航"
    },
    footer: {
      message: '橘南生 - OrangeSouthborn',
      copyright: 'MIT License'
    },
    externalLinkIcon: true,
    docFooter: {
      prev: false,
      next: false
    },
    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "搜索文档",
            buttonAriaLabel: "搜索文档",
          },
          modal: {
            noResultsText: "未找到结果",
            resetButtonTitle: "清除查询",
            footer: {
              selectText: "选择",
              navigateText: "切换",
              closeText: "关闭",
            },
          },
        },
      },
    },
    lastUpdatedText: "最后更新时间",
  },
  lastUpdated: true,
  markdown: {
    image: {
      // 默认禁用；设置为 true 可为所有图片启用懒加载。
      lazyLoading: true
    }
  }
})
