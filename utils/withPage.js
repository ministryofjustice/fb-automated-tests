import fs from 'fs'
import puppeteer from 'puppeteer'
import {harFromMessages} from 'chrome-har'

const writeFile = fs.promises.writeFile

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

async function trackHAR (page) {
  const events = []

  const observe = [
    'Page.loadEventFired',
    'Page.domContentEventFired',
    'Page.frameStartedLoading',
    'Page.frameAttached',
    'Network.requestWillBeSent',
    'Network.requestServedFromCache',
    'Network.dataReceived',
    'Network.responseReceived',
    'Network.resourceChangedPriority',
    'Network.loadingFinished',
    'Network.loadingFailed'
  ]

  const client = await page.target().createCDPSession()
  await client.send('Page.enable')
  await client.send('Network.enable')

  observe.forEach(method => {
    client.on(method, params => {
      events.push({method, params})
    })
  })

  return async function writeHAR (HARFileName) {
    const har = harFromMessages(events)
    await writeFile(HARFileName, JSON.stringify(har))
  }
}

async function withPage (t, run) {
  const browser = await puppeteer.launch({
    headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()
  let writeHAR

  if (shouldDumpTrace) {
    writeHAR = await trackHAR(page)

    await page.tracing.start({
      path: `${testResultsFolder}/traces/${t.title}.json`,
      screenshots: true
    })
  }

  page.getText = selector => getText(page, selector)
  page.clickAndWait = selector => clickAndWait(page, selector)
  page.getHash = () => getHash(page)

  try {
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

    if (shouldDumpTrace) {
      const HARFileName = `${testResultsFolder}/har/${t.title}.har`
      await writeHAR(HARFileName)
    }
  }
}

export default withPage
