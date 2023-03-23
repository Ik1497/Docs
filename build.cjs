const fs  = require(`fs`)
const glob = require(`glob`)
const showdown  = require(`showdown`)

let converter = new showdown.Converter()
converter.setOption(`tables`, true)

fs.readdir(`./src/`, function (err, files) {
  if (err) return

  files.forEach(function (file) {
    if (!file.endsWith(`.md`)) return
    console.log(file)

    const htmlFileName = file.slice(11).replace(`.md`, `.html`)

    fs.readFile(`src/${file}`, `utf8`, (err, data) => {
      if (err) return

      data = data.replaceAll(`﻿`, ``).replaceAll(`\r`, ``)
      const markdown = data.split(`\n`).slice(6).join(`\n`)

      fs.writeFile(`dist/${htmlFileName}`, converter.makeHtml(markdown), (err) => {
        if (err) return
      });
    });
  });
});

function createPage(html) {

}