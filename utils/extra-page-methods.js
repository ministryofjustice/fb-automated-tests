
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

async function isActiveElement (page, selector) {
  const result = page.evaluate((selector) => {
    const activeElement = window.document.activeElement
    const selectorElement = window.document.querySelector(selector)
    return activeElement === selectorElement
  }, selector)
  return result
}

export {
  getText,
  clickAndWait,
  getHash,
  isActiveElement
}
