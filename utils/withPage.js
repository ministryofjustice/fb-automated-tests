import puppeteer from 'puppeteer'
import trackHAR from './har'

import {
  getText,
  clickAndWait,
  getHash
} from './extra-page-methods'

const args = process.argv.slice(2)

const settings = {
  shouldTakeScreenshots: args.includes('--screenshots'),
  shouldDumpTrace: args.includes('--trace'),
  testResultsFolder: './test-results',
  headless: true,
  chromeFlags: [
    // https://developers.google.com/web/tools/puppeteer/troubleshooting
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ]
}

async function withPage (t, run) {
  const browser = await puppeteer.launch({
    headless: settings.headless,
    args: settings.chromeFlags
  })
  const page = await browser.newPage()

  page.getText = selector => getText(page, selector)
  page.clickAndWait = selector => clickAndWait(page, selector)
  page.getHash = () => getHash(page)

  let writeHAR

  if (settings.shouldDumpTrace) {
    writeHAR = await trackHAR(page)

    await page.tracing.start({
      path: `${settings.testResultsFolder}/traces/${t.title}.json`,
      screenshots: true
    })
  }

  try {
    await run(t, page)
  } finally {
    if (settings.shouldTakeScreenshots) {
      const fileName = `${t.title}.png`

      await page.screenshot({
        path: `${settings.testResultsFolder}/screenshots/${fileName}`,
        fullPage: true
      })
    }

    if (settings.shouldDumpTrace) {
      await page.tracing.stop()
    }

    await page.close()
    await browser.close()

    if (settings.shouldDumpTrace) {
      const HARFileName = `${settings.testResultsFolder}/har/${t.title}.har`
      await writeHAR(HARFileName)
    }
  }
}

export default withPage
