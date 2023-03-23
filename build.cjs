const fs  = require(`fs`)
const glob = require(`glob`)
const showdown  = require(`showdown`)

let converter = new showdown.Converter()
converter.setOption(`tables`, true)

fs.readdir(`./src/`, function (err, files) {
  if (err) return

  files.forEach(function (file) {
    if (!file.endsWith(`.md`)) return

    const htmlFileName = file.slice(11).replace(`.md`, `.html`)
    console.log(htmlFileName)
    fs.readFile(`src/${file}`, `utf8`, (err, data) => {
      if (err) return

      data = data.replaceAll(`﻿`, ``).replaceAll(`\r`, ``)
      const markdown = data.split(`\n`).slice(6).join(`\n`)

      fs.writeFile(`dist/${htmlFileName}`, createPage(converter.makeHtml(markdown)), (err) => {
        if (err) return
      });
    });
  });
});

function createPage(html) {

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
    <meta property="og:title" content="Mute Indicator">
    <title>Mute Indicator</title>
    
    <meta property="og:description" content="Mute Indicator so you can see if and what sources are muted.">
    <meta name="description" content="Mute Indicator so you can see if and what sources are muted.">
    
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