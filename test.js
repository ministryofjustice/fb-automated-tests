import test from 'ava'
import puppeteer from 'puppeteer'

const headless = true

async function withPage (t, run) {
  const browser = await puppeteer.launch({
    headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()

  page.getText = async (selector) => {
    const result = await page.evaluate((_selector) => {
      return window.document.querySelector(_selector).innerText;
    }, selector);

    return result;
  }

  try {
    await run(t, page)
  } finally {
    await page.close()
    await browser.close()
  }
}

function sleep(ms = 1000) {
	return new Promise(resolve => {
		setTimeout(resolve, ms)
	})
}

test('gov uk', withPage, async (t, page) => {
  await page.goto('http://gov.uk')
  const currentURL = await page.url()

  console.log('Current URL: ', currentURL);

  t.is(currentURL, 'https://www.gov.uk/')
})

test('hmcts', withPage, async (t, page) => {
  await page.goto('https://gov.uk/government/organisations/hm-courts-and-tribunals-service')
  const currentURL = await page.url()

  console.log('Current URL: ', currentURL);

  t.is(currentURL, 'https://www.gov.uk/government/organisations/hm-courts-and-tribunals-service')
})

test('met office', withPage, async (t, page) => {
  await page.goto('https://metoffice.gov.uk')
  const currentURL = await page.url()

  console.log('Current URL: ', currentURL);

  t.is(currentURL, 'https://www.metoffice.gov.uk/')
})

test('tfl', withPage, async (t, page) => {
  await page.goto('https://www.tfl.gov.uk')
  const currentURL = await page.url()

  console.log('Current URL: ', currentURL);

  t.is(currentURL, 'https://tfl.gov.uk/')
})

test('civil service', withPage, async (t, page) => {
  await page.goto('http://civilservice.blog.gov.uk')
  const currentURL = await page.url()

  console.log('Current URL: ', currentURL);

  t.is(currentURL, 'https://civilservice.blog.gov.uk/')
})

test('moj blog', withPage, async (t, page) => {
  await page.goto('http://mojdigital.blog.gov.uk')
  const currentURL = await page.url()

  console.log('Current URL: ', currentURL);

  t.is(currentURL, 'https://mojdigital.blog.gov.uk/')
})