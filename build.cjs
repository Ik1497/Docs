const fs = require(`fs`)
const showdown = require(`showdown`)
const https = require('https');
const { v4: uuidv4 } = require('uuid');

const classMap = {
  img: `img-400`
}

const bindings = Object.keys(classMap)
  .map(key => ({
    type: `output`,
    regex: new RegExp(`<${key}(.*)>`, `g`),
    replace: `<${key} class="${classMap[key]}" $1>`
  }));

const customClassExt = {
  type: `output`,
  filter: function (text) {
    return text
      .replace(/<(.+)>(.+)\{\.([a-z0-9A-Z\s]+)\}/g, `<$1 class="$3">$2`) // Miscellaneous
      .replace(/<p>\{\.([a-z0-9A-Z\s]+)\}<\/p>[\n]?<(.+)>/g, `<$2 class="$1">`) // ol, ul
      .replace(/class="(.+)"/g, function (str) {
        if (str.indexOf("<em>") !== -1) {
          return str.replace(/<[/]?em>/g, '_');
        }
        return str;
      }); // Prevent class name with 2 dashs being replace by `<em>` tag
  }
};

const vuetifyExtension = {
  type: `output`,
  filter: function (text) {
    text = text
      .replaceAll(`<hr>`, `<v-divider style="margin-block: 1rem;"></v-divider>`)
      .replaceAll(`<hr/>`, `<v-divider style="margin-block: 1rem;"></v-divider>`)
      .replaceAll(`<hr />`, `<v-divider style="margin-block: 1rem;"></v-divider>`)
      .replaceAll(`<code>`, `<v-code style="display: inline;">`)
      .replaceAll(`</code>`, `</v-code>`)
      .replaceAll(`<kbd>`, `<v-kbd style="display: inline;">`)
      .replaceAll(`</kbd>`, `</v-kbd>`)
      .replace(
        /<blockquote>([\S\s]*?)<p class="([\S\s]*?)">([\S\s]*?)<\/p>([\S\s]*?)<\/blockquote>/gm, 
        `<v-alert text="$3" type="$2" variant="tonal"></v-alert>`
      )
    
    //////////
    // TABS //
    //////////

    text = text.replace(/<tabs>([\S\s]*?)<\/tabs>/g, (match, groupTab) => {
      groupTab = groupTab
        .replaceAll(`<p>`, ``)
        .replaceAll(`</p>`, ``)

      const tab = groupTab.trim()
      const id = uuidv4()
      let tabContent = ``
      let windowContent = ``
    
      tab.replace(/<tab name="([\S\s]*?)">([\S\s]*?)<\/tab>/g, (match, groupTabName, groupTabContent) => {
        tabContent += `<v-tab value="${groupTabName.trim()}">${groupTabName.trim()}</v-tab>
        `
        windowContent += `<v-window-item value="${groupTabName.trim()}">${groupTabContent.trim()}</v-window-item>
        `
      });

      let newText = `<v-card>
        <v-tabs v-model="tabs[\`${id}\`]" bg-color="primary">
          ${tabContent.trimEnd()}
        </v-tabs>

        <v-card-text>
          <v-window v-model="tabs[\`${id}\`]">
            ${windowContent.trimEnd()}
          </v-window>
        </v-card-text>
      </v-card>`
    
      return newText
    });

    /////////////////
    // Import Code //
    /////////////////

    text = text.replace(/<import-code>([\S\s]*?)<\/import-code>/g, (match, importCode) => {
      importCode = importCode
        .replaceAll(`<p>`, ``)
        .replaceAll(`</p>`, ``)
        .trim()

      // <v-sheet rounded="lg" style="padding: 1rem; margin-bottom: 1rem;">
      //   <div style="display: flex; justify-content: space-between; align-items: center;">
      //   <div style="font-family: Poppins; font-weight: 500;">Import Code</div>
      //   <div style="display: flex; gap: .5rem;">
      //     <v-btn variant="tonal" @click="copy(\`${importCode}\`)">Copy</v-btn>
      //     <v-btn variant="tonal" @click="download(\`${importCode}\`)">Download</v-btn>
      //   </div>
      // </div>
      // <br>
      // <div style="overflow-x: auto; background: #181818; padding: 1rem; border-radius: .5rem .5rem 0  0; color: #aac8e4;">${importCode}</div>
      // </v-sheet>
      let newText = `${importCode}`
    
      return newText
    });

    return text
  }
};

let converter = new showdown.Converter({
  extensions: [
    vuetifyExtension,
    ...bindings,
    customClassExt
  ]
})

converter.setOption(`tables`, true)
converter.setOption(`emoji`, true)
converter.setOption(`excludeTrailingPunctuationFromURLs`, true)
converter.setOption(`ghCompatibleHeaderId`, true)
converter.setOption(`metadata`, true)
converter.setOption(`noHeaderId`, true)
converter.setOption(`omitExtraWLInCodeBlocks`, true)
converter.setOption(`openLinksInNewWindow`, true)
converter.setOption(`parseImgDimensions`, true)
converter.setOption(`simplifiedAutoLink`, true)
converter.setOption(`strikethrough`, true)
converter.setOption(`tasklists`, true)
converter.setOption(`underline`, true)

fs.readdir(`./docs-src/`, function (err, files) {
  if (err) return

  files.forEach(function (file) {
    if (!file.endsWith(`.md`)) return

    fs.readFile(`./docs-src/${file}`, `utf8`, (err, data) => {
      if (err) return
      
      data = data.replaceAll(`﻿`, ``).replaceAll(`\r`, ``)
      const markdown = data.split(`\n`).join(`\n`)
      const html = converter.makeHtml(markdown)
      const metadata = converter.getMetadata()
      const htmlFileName = metadata?.path ? metadata?.path : file

      metadata.pageId = file.replaceAll(`.md`, ``)

      createPage(html, metadata, `docs/${metadata?.directory}/${htmlFileName}/index.html`, `/Docs/${metadata?.directory}/${htmlFileName}/`)
    });
  });
});

async function createPage(html, metadata, path, navPath) {
  let navigation = await fetch(`https://raw.githubusercontent.com/Ik1497/Docs/main/api/navigation.json`)
  navigation = await navigation.json()

  let navigationHtml = ``

  navigation.navigationItems.forEach(navigationGroup => {
    let navGroupHtml = ``
    let navGroupIf = `visibilityChannel === \`beta\``

    navigationGroup.groupItems.forEach(navGroupItem => {
      navGroupItem = navGroupItem.groupItem

      if (navGroupItem.channel != `public`) {
        navGroupHtml += `
        <v-list-item v-if="visibilityChannel === \`beta\`" prepend-icon="${navGroupItem.icon.replace(`mdi `, ``)}" title="${navGroupItem.name}" href="${navGroupItem.href}" :active="currentPath === \`${navGroupItem.href}\`" active-color="primary"></v-list-item>
        `

      } else {
        navGroupHtml += `
        <v-list-item prepend-icon="${navGroupItem.icon.replace(`mdi `, ``)}" title="${navGroupItem.name}" href="${navGroupItem.href}" :active="currentPath === \`${navGroupItem.href}\`" active-color="primary"></v-list-item>
        `

        navGroupIf = ``
      }
    });

    if (navGroupHtml != ``) {
      navigationHtml += `
      <v-list-subheader ${navGroupIf != `` ? `v-if="${navGroupIf}"` : ``}>${navigationGroup.name}</v-list-subheader>
      ${navGroupHtml}
      `
    }
  });

  createFileAndFolder(path, `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      
      <!-- Site Meta -->
      <meta name="og:site_name" content="Streamer.bot Actions">
      <meta property="og:image" content="https://ik1497.github.io/assets/images/favicon.png">
      <link rel="icon" href="https://ik1497.github.io/assets/images/favicon.png">
      <meta property="og:type" content="website">
      <meta name="theme-color" content="#B80086">
      <meta name="author" content="Ik1497">
      
      <!-- Page Meta -->
      <meta property="og:title" content="${metadata?.title}">
      <title>${metadata?.title}</title>
      
      <meta property="og:description" content="${metadata?.description}">
      <meta name="description" content="${metadata?.description}">

      <!-- Scripts -->
      <script src="https://ik1497.github.io/components/main.js"></script>
      <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/vuetify@3.1.14/dist/vuetify.min.js"></script>

      <!-- Styles -->
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vuetify@3.1.14/dist/vuetify.min.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/7.2.96/css/materialdesignicons.min.css" integrity="sha512-LX0YV/MWBEn2dwXCYgQHrpa9HJkwB+S+bnBpifSOTO1No27TqNMKYoAn6ff2FBh03THAzAiiCwQ+aPX+/Qt/Ow==" crossorigin="anonymous" referrerpolicy="no-referrer" />
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    </head>
    <body>
      <div id="app">
        <v-app>
          <v-layout style="overflow-y: visible; overflow-x: hidden; position: relative; height: 100vh;">
            <v-app-bar color="primary" style="position: fixed; top: 0; height: fit-content;">
              <v-app-bar-nav-icon @click="navVisible = !navVisible"></v-app-bar-nav-icon>
        
              <v-app-bar-title>Streamer.bot Actions Docs</v-app-bar-title>
            </v-app-bar>
      
            <v-navigation-drawer temporary v-model="navVisible" style="z-index: 1000; position: fixed; bottom: 0;">
              <v-list density="compact" nav>
${navigationHtml}
              </v-list>
            </v-navigation-drawer>
        
            <v-main style="margin-top: 1rem; max-width: 100rem; margin-inline: auto; padding-inline: 1rem;">
<h1 class="page-title">${metadata?.title}</h1>
<p class="page-description">${metadata?.description}</p>
<v-divider style="margin-block: 1rem;"></v-divider>
${html}
            </v-main>
          </v-layout>
        </v-app>
      </div>

      <script>
        const { createApp } = Vue
        const { createVuetify } = Vuetify
      
        const vuetify = createVuetify({
          theme: {
            defaultTheme: \`dark\`,
            themes: {
              dark: {
                colors: {
                  primary: \`#1E88E5\`,
                  secondary: \`#42A5F5\`
                }
              }
            }
          }
        })
      
        const app = createApp({
          data() {
            return {
              navVisible: false,
              currentPath: location.pathname,
              visibilityChannel: localStorage.getItem(\`websiteSettings__visibilityChannel\`),
              tabs: {}
            }
          },
        })
      
        app.use(vuetify).mount(\`#app\`)
      </script>
      
      <style>
        html {
          overflow-y: auto;
        }
      
        body {
          font-family: Inter;
        }
        
        img.img-400 {
          max-width: 100%;
          width: 40rem;
        }
        
        p:not([class]) {
          padding-bottom: 1rem;
        }

        ol:not([class]) {
          list-style: none;
          counter-reset: ol;
        }

        ol:not([class]) li::before {
          counter-increment: ol;
          content: counter(ol) ". "
        }

        table {
          background: #181818;
          border-radius: 8px;
          margin-block: 1rem;
          border-spacing: 0;
          overflow: hidden;
        }

        table thead tr {
          background: #252525;
        }

        table tbody tr:nth-child(even) {
          background: #252525;
        }

        th, td {
          padding-inline: 0.5rem;
          padding-block: 0.5rem;
        }

        /**************/
        /* COMPONENTS */
        /**************/

        i-sb-import-wrapper {
          --i-sb-import-background: #252525;
          --i-sb-import-code-background: #181818;
          --i-sb-import-color: #ffffff;
        }
      </style>  
    </body>
  
  `)
}

// methods: {
//   copy: (text) => {
//     navigator.clipboard.writeText(text)
//   },
//   download: (text = '', filename = 'import.sb') => {
//     let element = document.createElement('a');
//     element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
//     element.setAttribute('download', filename);
  
//     element.style.display = 'none';
//     document.body.append(element);
  
//     element.click();
//     element.remove();
//   },
// },

function createFileAndFolder(path, content) {
  let dirs = path.split(`/`)
  let fileName = dirs.reverse()[0]
  dirs.reverse().pop()

  let addingPath = ``

  dirs.forEach((dir, dirIndex) => {
    if (dirIndex === 0) addingPath += dir
    if (dirIndex > 0) addingPath += `/${dir}`

    fs.mkdirSync(addingPath, { recursive: true })
  });

  fs.writeFileSync(`${addingPath}/${fileName}`, content)
}
