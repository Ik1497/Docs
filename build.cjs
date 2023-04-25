const fs = require(`fs`)
const showdown = require(`showdown`)
const https = require('https');

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

let converter = new showdown.Converter({
  extensions: [...bindings, customClassExt]
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

const languages = [
  `nl`,
  `de`,
  `es`
]

createFileAndFolder(`docs/e/index.html`, createEditorPage({}, `index`))

fs.copyFileSync(`src/main.js`, `docs/main.js`)
fs.copyFileSync(`src/style.css`, `docs/style.css`)

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

      createPage(html, metadata, `docs/${metadata?.directory}/${htmlFileName}.html`, `/Docs/${metadata?.directory}/${htmlFileName}`)
      createPage(html, metadata, `docs/en/${metadata?.directory}/${htmlFileName}.html`, `/Docs/${metadata?.directory}/${htmlFileName}`)
      
      // languages.forEach(async function (language) {
      //    createFileAndFolder(`docs/${language}/${htmlFileName}.html`, createPage(translate(encodeURI(html), language), metadata))
      // });

      createFileAndFolder(`docs/e/${htmlFileName}.html`, createEditorPage(metadata, htmlFileName))
    });
  });
});

async function createPage(html, metadata, path, navPath) {
  let navigation = await fetch(`https://raw.githubusercontent.com/Ik1497/Docs/main/api/navigation.json`)
  navigation = await navigation.json()

  let navigationHtml = ``

  navigation.navigationItems.forEach(navigationGroup => {
    let navGroupHtml = ``

    navigationGroup.groupItems.forEach(navGroupItem => {
      navGroupItem = navGroupItem.groupItem

      if (navGroupItem.channel != `public`) return

      navGroupHtml += `
      <li class="navigation-list-item"><a class="${navGroupItem.icon}${navPath === navGroupItem.href ? ` active` : ``}" href="${navGroupItem.href}">${navGroupItem.name}</a></li>
      `
    });

    if (navGroupHtml != ``) {
      navigationHtml += `
      <div class="navigation-group">
        <p tabindex="0">${navigationGroup.name}</p>
        <ul class="navigation-list">
          ${navGroupHtml}
        </ul>
      </div>
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
      <script src="../main.js" defer></script>
      <script src="https://ik1497.github.io/components/main.js"></script>
      
      <!-- Styles -->
      <link rel="stylesheet" href="../style.css">
    </head>
    <body data-page-id="${metadata?.pageId}">
      ${createHeader()}
      <div class="main-content">
        <nav class="primary-navigation">
          <div class="navigation-overlay"></div>
          <div class="navigation-content">
            ${navigationHtml}
          </div>
          <button class="navigation-close-button">Close</button>
        </nav>
        ${createToc()}
        <main>
          <h1>${metadata?.title}</h1>
          ${html}
        </main>
      </div>
      <footer class="primary-footer"r>© 2022-${new Date().getFullYear()} Streamer.bot Actions. All rights reserved.</footer>
    </body>
  </html>
  `)
}

function createHeader() {
  return `
  <header class="primary-header">
    <div class="header-content">
      <div class="main">
        <button class="navigation-button mdi mdi-menu"></button>
        <img src="https://ik1497.github.io/assets/images/favicon.png" alt="favicon">
        <p>Streamer.bot Actions</p>
      </div>
    </div>
  </header>
  `
}

function createToc() {
  return ``
}

function createEditorPage(metadata, fileName, type = `page`) {
  return `<!DOCTYPE html>
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
      <meta property="og:title" content="Edit ${type === `page` ? metadata?.title : `Streamer.bot Actions`}">
      <title>Edit ${type === `page` ? metadata?.title : `Streamer.bot Actions`}</title>
      
      <meta property="og:description" content="${type === `page` ? metadata?.description : `Edit the contents of the Streamer.bot Actions website`}">
      <meta name="description" content="${type === `page` ? metadata?.description : `Edit the contents of the Streamer.bot Actions website`}">
    </head>
    <body ${type === `page` ? `data-page-id="${metadata?.pageId}" ` : ``}style="margin: 0; overflow: hidden; width: 100vw; height: 100vh;">
      ${type === `page` ? `<iframe src="https://ik1497.netlify.app/#/collections/docs/entries/${metadata?.pageId}" style="width: 100%; height: 100%; overflow: hidden;"></iframe>` : `<iframe src="https://ik1497.netlify.app/#/collections/docs" style="width: 100%; height: 100%; overflow: hidden;"></iframe>`}
      <a style="position: fixed; left: 1rem; bottom: 1rem; color: black; background: none; outline: 0; border: 0; border-radius: 0; cursor: pointer;" href="../${fileName}">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M22 12a10 10 0 0 1-10 10A10 10 0 0 1 2 12A10 10 0 0 1 12 2a10 10 0 0 1 10 10m-6.6 4.6L10.8 12l4.6-4.6L14 6l-6 6l6 6l1.4-1.4Z"/></svg>
      </a>
    </body>
  </html>
  `
}

function createFileAndFolder(path, content) {
  let dirs = path.split(`/`)
  let fileName = dirs.reverse()[0]
  dirs.reverse().pop()

  let addingPath = ``

  dirs.forEach((dir, dirIndex) => {
    if (dirIndex === 0) addingPath += dir
    if (dirIndex > 0) addingPath += `/${dir}`

    fs.mkdirSync(addingPath, { recursive: true })
    
    fs.copyFileSync(`src/main.js`, `${addingPath}/main.js`)
    fs.copyFileSync(`src/style.css`, `${addingPath}/style.css`)
  });

  fs.writeFileSync(`${addingPath}/${fileName}`, content)
}

function translate(text, to) {
  const url = generateRequestUrl(text, { to: to });

  createFileAndFolder(`test/${to}`, url)

  https.get(url, (resp) => {
    let data = ``
  
    resp.on(`data`, (chunk) => {
      data += chunk
    });

    resp.on(`end`, () => {
      return normaliseResponse(JSON.parse(data))
    });
  }).on(`error`, (err) => {
    return `Error:`, err.message
  });
}
