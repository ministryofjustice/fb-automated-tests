import test from 'ava'
import withPage from '../utils/withPage'
import config from '../config'

test('URL handling', withPage, async (t, page) => {
  const question1 = `${config.formURL}do-you-want-to-continue`
  await page.goto(question1)
  t.is(await page.url(), config.formURL, 'Navigating to a question page without a session should redirect to the main form home page')

  const pageNotFound = `${config.formURL}this-url-does-not-exist`
  await page.goto(pageNotFound)
  t.is(await page.url(), pageNotFound, 'Navigating to a non-existent form page should not perform any redirects')

  const httpURL = new URL(config.formURL)
  httpURL.protocol = 'http:'
  await page.goto(httpURL.toString())
  t.is(await page.url(), config.formURL, 'Landing on HTTP form URL should redirect to HTTPS')
})
