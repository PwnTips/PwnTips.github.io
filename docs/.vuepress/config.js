import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  title: 'PWN-Tips',
  description: '一些笔记',
  base: '/', // Root path for user/organization GitHub Pages
  bundler: viteBundler(),
  theme: defaultTheme({
    navbar: [],
    sidebar: 'heading',
    sidebarDepth: 3,
    editLink: false,
    lastUpdated: false,
    contributors: false,
  }),
})