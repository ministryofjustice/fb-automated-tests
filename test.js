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

test('happy path in the form', withPage, async (t, page) => {
  await page.goto('https://example.com')
  const currentURL = await page.url()

  console.log('Current URL: ', {currentURL});

  t.is(currentURL, 'http://nope')

  await sleep(2000)
})

