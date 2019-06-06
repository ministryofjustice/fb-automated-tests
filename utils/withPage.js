import puppeteer from 'puppeteer'

const shouldTakeScreenshots = process.argv.slice(2).includes('--screenshots')

const headless = false

async function getText (page, selector) {
  const result = await page.evaluate((_selector) => {
    return window.document.querySelector(_selector).innerText
  }, selector)

  return result
}

function clickAndWait (page, selector) {
  return Promise.all([
    page.waitForNavigation({waitUntil: 'networkidle2'}),
    page.click(selector)
  ])
}

async function withPage (t, run) {
  const browser = await puppeteer.launch({
    headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()

  page.getText = selector => getText(page, selector)
  page.clickAndWait = selector => clickAndWait(page, selector)

  try {
    await run(t, page)
  } finally {
    if (shouldTakeScreenshots) {
      const fileName = `${t.title}.png`

      await page.screenshot({
        path: `./test-results/screenshots/${fileName}`
      })
    }

    await page.close()
    await browser.close()
  }
}

export default withPage
