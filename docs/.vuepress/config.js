import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { sitemapPlugin } from '@vuepress/plugin-sitemap'

export default defineUserConfig({
  title: 'PWN-Tips',
  description: '一些笔记',
  base: '/', // Root path for custom domain
  bundler: viteBundler(),
  theme: defaultTheme({
    navbar: [],
    sidebar: 'heading',
    sidebarDepth: 3,
    editLink: false,
    lastUpdated: false,
    contributors: false,
  }),
  plugins: [
    sitemapPlugin({
      hostname: 'https://www.heapspray.dev'
    })
  ]
})
