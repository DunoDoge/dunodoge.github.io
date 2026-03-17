import { defineConfig } from 'vitepress';
import mathjax3 from 'markdown-it-mathjax3';

const customElements = [
  'mjx-container',
  'mjx-assistive-mml',
  'math',
  'maction',
  'maligngroup',
  'malignmark',
  'menclose',
  'merror',
  'mfenced',
  'mfrac',
  'mi',
  'mlongdiv',
  'mmultiscripts',
  'mn',
  'mo',
  'mover',
  'mpadded',
  'mphantom',
  'mroot',
  'mrow',
  'ms',
  'mscarries',
  'mscarry',
  'msgroup',
  'msline',
  'msrow',
  'mspace',
  'msqrt',
  'mstack',
  'mstyle',
  'msub',
  'msup',
  'msubsup',
  'mtable',
  'mtd',
  'mtext',
  'mtr',
  'munder',
  'munderover',
  'semantics',
  'annotation',
  'annotation-xml',
];

export default defineConfig({
  title: "Duno's blog",
  description: "Duno's CS and SCSE learning records",
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'
      }
    ]
  ],
  markdown: {
    config: (md) => {
      md.use(mathjax3);
    },
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => customElements.includes(tag),
      },
    },
  },
  themeConfig: {
    siteTitle: "Duno's blog",
    logo: '/favicon.ico',
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "CS", link: "/articles/cs/"},
      { text: "CTF", link: "/articles/ctf/" }
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/DunoDoge" },
    ],
    sidebar: {
      "/articles/cs/": [
        {
          text: "CS learning",
          collapsible: true,
          collapsed: false,
          items: [
            {
              text: "计算机组成原理",
              link: "/articles/cs/cod/计算机组成原理"
            }
          ]
        }
      ],
      "/articles/ctf/": [
        {
          text: "BugkuCTF WriteUp",
          collapsible: true,
          collapsed: false,
          items: [
            {
              text: "[Misc]这是一张单纯的图片",
              link: "/articles/ctf/writeup/bugku-misc-这是一张单纯的图片"
            },
            {
              text: "[Misc]Pokergame",
              link: "/articles/ctf/writeup/bugku-misc-Pokergame"
            },
            {
              text: "[Reverse]2048",
              link: "/articles/ctf/writeup/bugku-reverse-2048"
            },
            {
              text: "[Reverse]Timer",
              link: "/articles/ctf/writeup/bugku-reverse-Timer"
            }
          ]
        },
        {
          text: "WHUCTF WriteUp",
          collapsible: true,
          collapsed: false,
          items: [
            {
              text: "[Misc]MydataLeaks",
              link: "/articles/ctf/writeup/whu-misc-MydataLeaks"
            }
          ]
        }
      ]
    },
    outline: {
      level: [2, 3],
      label: '目录'
    }
  }
});