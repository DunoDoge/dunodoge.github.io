export default {
  title: "Duno's Blog",
  description: "Duno's CS and SCSE learning records",
  themeConfig: {
    siteTitle: "Duno's Blog",
    logo: "/logo.png",
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "CTF",
        items: [
          { text: "WriteUp", link: "/articles/ctf/writeup" },
        ]
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/DunoDoge" },
    ],
    sidebar: {
      "/articles/": [
        {
          text: "BugkuCTF WriteUp",
          collapsible: true,
          collapsed:true,
          outline: true,
          items: [
            {
              text: "[Misc]这是一张单纯的图片",
              link: "/articles/ctf/writeup/bugku-misc-这是一张单纯的图片"
            }
          ],
        },
      ]
    }
  }
}