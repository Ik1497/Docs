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

const customClassExt = {
  type: `output`,
  filter: function (text) {
    return text
      // Add class for list (ol, ul)
      .replace(/<p>\[\.([a-z0-9A-Z\s]+)\]<\/p>[\n]?<(.+)>/g, `<$2 class="$1">`)
    
      // Add class for other blocks
      .replace(/<(.+)>\[\.([a-z0-9A-Z\s]+)\]/g, `<$1 class="$2">`)
      
      // Prevent class name with 2 dashs being replace by `<em>` tag
      .replace(/class="(.+)"/g, function (str) {
          if (str.indexOf("<em>") !== -1) {
              return str.replace(/<[/]?em>/g, '_');
          }
          return str;
      });
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

fs.mkdir('./docs', { recursive: true }, (err) => {});
fs.mkdir('./docs/e', { recursive: true }, (err) => {});

fs.writeFile(`./docs/e/index.html`, createEditorPage({}, `index`), (err) => {
  if (err) return
});

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
      const htmlFileName = metadata?.path ? metadata?.path + `.html` : file

      metadata.pageId = file.replaceAll(`.md`, ``)

      fs.writeFile(`./docs/${htmlFileName}`, createPage(html, metadata), (err) => {
        if (err) return
      });

      fs.writeFile(`./docs/e/${htmlFileName}`, createEditorPage(metadata), (err) => {
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
    <body data-page-id="${metadata?.pageId}">
      <main>
        ${html}
      </main>
    </body>
  </html>
  `
}

function createEditorPage(metadata, type = `page`) {
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
      <meta property="og:title" content="Edit ${type === `page` ? metadata?.title : `Streamer.bot Actions`}">
      <title>Edit ${type === `page` ? metadata?.title : `Streamer.bot Actions`}</title>
      
      <meta property="og:description" content="${type === `page` ? metadata?.description : `Edit the contents of the Streamer.bot Actions website`}">
      <meta name="description" content="${type === `page` ? metadata?.description : `Edit the contents of the Streamer.bot Actions website`}">
    </head>
    <body ${type === `page` ? `data-page-id="${metadata?.pageId}" ` : ``}style="margin: 0; overflow: hidden; width: 100vw; height: 100vh;">
      ${type === `page` ? `<iframe src="https://ik1497.netlify.app/#/collections/docs/entries/${metadata?.pageId}" style="width: 100%; height: 100%; overflow: hidden;"></iframe>` : `<iframe src="https://ik1497.netlify.app/#/collections/docs" style="width: 100%; height: 100%; overflow: hidden;"></iframe>`}
    </body>
  </html>
  `
}