import fs from 'fs'
import {harFromMessages} from 'chrome-har'

const writeFile = fs.promises.writeFile

async function trackHAR (page) {
  const events = []

  const observations = [
    'Page.loadEventFired',
    'Page.domContentEventFired',
    'Page.frameStartedLoading',
    'Page.frameAttached',
    'Page.frameScheduledNavigation',
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

  for (const method of observations) {
    client.on(method, params => events.push({method, params}))
  }

  return async function writeHAR (HARFileName) {
    const har = harFromMessages(events)
    await writeFile(HARFileName, JSON.stringify(har, null, 2))
  }
}

export default trackHAR
