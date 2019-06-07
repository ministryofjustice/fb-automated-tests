import test from 'ava'
import withPage from '../utils/withPage'
import config from '../config'

test('URLs are handled correctly', withPage, async (t, page) => {
  const question1 = `${config.formURL}do-you-want-to-continue`
  await page.goto(question1)
  t.is(await page.url(), config.formURL, 'navigating to a question page without a session should redirect to the main form home page')

  const pageNotFound = `${config.formURL}this-url-does-not-exist`
  await page.goto(pageNotFound)
  t.is(await page.url(), pageNotFound, 'navigating to a non-existent form page should not perform any redirects')

  const httpURL = new URL(config.formURL)
  httpURL.protocol = 'http:'
  await page.goto(httpURL.toString())
  t.is(await page.url(), config.formURL, 'http should redirect to https')
})
