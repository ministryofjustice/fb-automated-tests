import puppeteer from 'puppeteer'

const shouldTakeScreenshots = process.argv.slice(2).includes('--screenshots')
const shouldDumpTrace = process.argv.slice(2).includes('--trace')
const testResultsFolder = './test-results'

const headless = true

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

function getHash (page) {
  return page.evaluate(() => window.location.hash)
}

async function withPage (t, run) {
  const browser = await puppeteer.launch({
    headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()

  page.getText = selector => getText(page, selector)
  page.clickAndWait = selector => clickAndWait(page, selector)
  page.getHash = () => getHash(page)

  try {
    if (shouldDumpTrace) {
      await page.tracing.start({
        path: `${testResultsFolder}/traces/${t.title}.json`,
        screenshots: true
      })
    }

    await run(t, page)
  } finally {
    if (shouldTakeScreenshots) {
      const fileName = `${t.title}.png`

      await page.screenshot({
        path: `${testResultsFolder}/screenshots/${fileName}`
      })
    }

    if (shouldDumpTrace) {
      await page.tracing.stop()
    }

    await page.close()
    await browser.close()
  }
}

export default withPage
