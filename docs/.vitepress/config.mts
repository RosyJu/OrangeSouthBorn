import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "橘南生 - OrangeSouthborn",
  description: "一个Minecraft资源包",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '简介', link: 'introduction/getting-started' },
      { text: '资源包', link: 'resourcepack/resource_list' }
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
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
