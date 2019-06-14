
async function getText (page, selector) {
  const result = await page.evaluate((_selector) => {
    return window.document.querySelector(_selector).innerText
  }, selector)

  return result
}

function clickAndWait (page, selector) {
  return Promise.all([
    page.waitForNavigation({waitUntil: 'domcontentloaded'}),
    page.click(selector)
  ])
}

function getHash (page) {
  return page.evaluate(() => window.location.hash)
}

export {
  getText,
  clickAndWait,
  getHash
}
