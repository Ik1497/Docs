const fs  = require(`fs`)
const showdown  = require(`showdown`)

const classMap = {
  img: `img-400`
}

const bindings = Object.keys(classMap)
  .map(key => ({
    type: `output`,
    regex: new RegExp(`<${key}(.*)>`, `g`),
    replace: `<${key} class="${classMap[key]}" $1>`
  }));

let converter = new showdown.Converter({
  extensions: [...bindings]
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

fs.readdir(`./src/`, function (err, files) {
  if (err) return

  files.forEach(function (file) {
    if (!file.endsWith(`.md`)) return

    fs.readFile(`src/${file}`, `utf8`, (err, data) => {
      if (err) return
      
      data = data.replaceAll(`﻿`, ``).replaceAll(`\r`, ``)
      const markdown = data.split(`\n`).join(`\n`)
      const html = converter.makeHtml(markdown)
      const metadata = converter.getMetadata()
      const htmlFileName = metadata?.path ? metadata?.path + `.html` : file

      fs.writeFile(`docs/${htmlFileName}`, createPage(html, metadata), (err) => {
        if (err) return
      });
    });
  });
});

function createPage(html, metadata) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      
      <!-- Site Meta -->
      <meta name="og:site_name" content="Streamer.bot Actions">
      <meta property="og:image" content="https://ik1497.github.io/assets/images/favicon.png">
      <meta property="og:type" content="website">
      <meta name="theme-color" content="#B80086">
      <meta name="author" content="Ik1497">
      
      <!-- Page Meta -->
      <meta property="og:title" content="${metadata?.title}">
      <title>${metadata?.title}</title>
      
      <meta property="og:description" content="${metadata?.description}">
      <meta name="description" content="${metadata?.description}">
      
      <!-- Scripts -->
      <script src="/assets/js/head.js"></script>
      <script src="/assets/js/main.js" defer></script>
      
      <!-- Styles -->
      <link rel="stylesheet" href="/assets/css/style.css">    
    </head>
    <body>
      <main>
        ${html}
      </main>
    </body>
  </html>
  `
}