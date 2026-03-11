export default {
  title: "Duno's Blog",
  description: "Duno's CS and SCSE learning records",
  themeConfig: {
    siteTitle: "Duno's Blog",
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
              text: "计算机组成与设计",
              link: "/articles/cs/cod/计算机组成与设计 RISC-V"
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
            }
          ]
        }
      ]
    }
  }
}