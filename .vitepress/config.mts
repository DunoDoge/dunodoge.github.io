import { defineConfig } from 'vitepress'
import mathjax3 from 'markdown-it-mathjax3'

export default defineConfig({
  base: '/',

  markdown: {
    config: (md) => {
      md.use(mathjax3)
    }
  },

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }]
  ],

  title: "Duno's Blog",

  description: "Personal Learning Records and Sharing",

  lastUpdated: true,
  
  cleanUrls: true,

  themeConfig: {
    logo: '/favicon.ico',

    nav: [
      { text: 'Home', link: '/' },
      {
        text: '计算机科学',
        items: [
          { text: '计算机组成与设计', link: '/docs/CS/COD/cod-overview' },
          { text: '数据库系统原理', link: '/docs/CS/Database/database-overview' },
          { text: '汇编语言与接口设计', link: '/docs/CS/Assembly/assembly-overview' }
        ]
      },
      {
        text: 'CTF',
        items: [
          { text: 'WriteUp', link: '/docs/CTF/WriteUp/writeup-overview' },
          { text: 'CTF 指北', link: '/docs/CTF/Guide/guide-overview' },
        ]
      },
      { text: '杂论', link: '/docs/Other/' },
    ],

    sidebar: {
      '/docs/CS/': [
        {
          text: '计算机组成与设计',
          collapsed: false,
          items: [
            { text: '计组复习笔记', link: '/docs/CS/COD/cod-review-notes' }
          ]
        },
        {
          text: '数据库系统原理',
          collapsed: false,
          items: [
            { text: '数据库复习笔记', link: '/docs/CS/Database/database-review-notes' },
            { text: '并发控制中的封锁协议', link: '/docs/CS/Database/database-lock-protocal' },
            { text: 'PL/SQL 中的游标是什么？', link: '/docs/CS/Database/database-sql-cursor' }
          ]
        },
        {
          text: '汇编语言与接口设计',
          collapsed: false,
          items: [
            { text: '接口复习笔记', link: '/docs/CS/Assembly/io-review-notes' }
          ]
        }
      ],
      '/docs/CTF/': [
        {
          text: 'WriteUp',
          collapsed: false,
          items: [
            {
              text: "Bugku CTF",
              items: [
                { text: '[Misc]beautiful壁纸', link: '/docs/CTF/WriteUp/BugkuCTF/bugku-misc-beautiful壁纸' },
                { text: '[Misc]Pokergame', link: '/docs/CTF/WriteUp/BugkuCTF/bugku-misc-Pokergame' },
                { text: '[Misc]不可以破译的密码', link: '/docs/CTF/WriteUp/BugkuCTF/bugku-misc-不可以破译的密码' },
                { text: '[Misc]成果狗成果狗', link: '/docs/CTF/WriteUp/BugkuCTF/bugku-misc-成果狗成果狗' },
                { text: '[Misc]这是一张单纯的图片', link: '/docs/CTF/WriteUp/BugkuCTF/bugku-misc-这是一张单纯的图片' },
                { text: '[Reverse]2048', link: '/docs/CTF/WriteUp/BugkuCTF/bugku-reverse-2048' },
                { text: '[Reverse]Easy-100', link: '/docs/CTF/WriteUp/BugkuCTF/bugku-reverse-easy-100' },
                { text: '[Reverse]Luck', link: '/docs/CTF/WriteUp/BugkuCTF/bugku-reverse-Luck' },
                { text: '[Reverse]Marco', link: '/docs/CTF/WriteUp/BugkuCTF/bugku-reverse-Marco' },
                { text: '[Reverse]Mountain climbing', link: '/docs/CTF/WriteUp/BugkuCTF/bugku-reverse-Mountain climbing' },
                { text: '[Reverse]patch_call', link: '/docs/CTF/WriteUp/BugkuCTF/bugku-reverse-patch_call' },
                { text: '[Reverse]SafeBox', link: '/docs/CTF/WriteUp/BugkuCTF/bugku-reverse-SafeBox' },
                { text: '[Reverse]Timer', link: '/docs/CTF/WriteUp/BugkuCTF/bugku-reverse-Timer' }
              ]
            },
            {
              text: "WHUCTF",
              items: [
                { text: '[Misc]MydataLeaks', link: '/docs/CTF/WriteUp/WHUCTF/whu-misc-MydataLeaks' },
                { text: '[Crypto]来签个到吧', link: '/docs/CTF/WriteUp/WHUCTF/whu-crypto-来签个到吧' },
                { text: '[Crypto]myHash', link: '/docs/CTF/WriteUp/WHUCTF/whu-crypto-myHash' },
                { text: '[Crypto]maybe_Wiener', link: '/docs/CTF/WriteUp/WHUCTF/whu-crypto-maybe_Wiener' }
              ]
            }
          ]
        },
        {
          text: 'CTF 指北',
          collapsed: false,
          items: [
          ]
        }
      ],
      '/docs/Other/': [
        {
          text: '杂论',
          collapsed: false,
          items: [
            { text: 'Git 中的“浅克隆”', link: '/docs/Other/git-shallow-clone' },
            { text: 'Powershell，你的上一条指令呢？', link: '/docs/Other/pwsh-last-cmd-bug' },
            { text: 'Windows 管理 python 版本的正确姿势', link: '/docs/Other/py-multi-version' }
          ]
        }
      ]
    },

    outline: {
      level: [2, 3],
      label: '目录'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/DunoDoge' }
    ],

    search: { provider: 'local' }
  },

})
