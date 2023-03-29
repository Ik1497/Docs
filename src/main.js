document.querySelector(`header.primary-header .navigation-button`).addEventListener(`click`, () => {
  document.body.toggleAttribute(`data-navigation-visible`)
})

document.querySelector(`nav.primary-navigation .navigation-overlay`).addEventListener(`click`, () => {
  document.body.setAttribute(`data-navigation-visible`, ``)
  document.body.removeAttribute(`data-navigation-visible`)
})

document.querySelector(`nav.primary-navigation .navigation-close-button`).addEventListener(`click`, () => {
  document.body.setAttribute(`data-navigation-visible`, ``)
  document.body.removeAttribute(`data-navigation-visible`)
})

document.querySelectorAll(`img`).forEach(img => {
  img.addEventListener(`click`, () => {
    createModal(`<img src="${img.src}" alt="${img.alt}" style="width: 100%; max-width: 100%;">`, `Image Inspector`, img.alt, `large`)
  })
})

window.addEventListener(`keydown`, (e) => {
  switch (e.key) {
    case `Escape`:
    case `Enter`:
    case `Space`:
      document.body.setAttribute(`data-navigation-visible`, ``)
      document.body.removeAttribute(`data-navigation-visible`)
      break
  }
})