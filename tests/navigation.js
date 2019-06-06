import test from 'ava'
import withPage from '../utils/withPage'
import config from '../config'

test('navigating backwards after navigating forwards', withPage, async (t, page) => {
  await page.goto(config.formURL)
  await page.clickAndWait(config.submitButton)
  t.is(await page.getText('.govuk-back-link'), 'Back')
  await page.clickAndWait('.govuk-back-link')
  t.is(await page.url(), config.formURL)
})

test('navigating backwards when landing in the middle of a form', withPage, async (t, page) => {
  await page.goto(config.formURL)
  await page.goto(`${config.formURL}check-answers`)
  await page.clickAndWait('.govuk-back-link')
  t.is(await page.url(), `${config.formURL}confirm-your-email`)
  await page.clickAndWait('.govuk-back-link')
  t.is(await page.url(), `${config.formURL}do-you-want-to-continue`)
  await page.clickAndWait('.govuk-back-link')
  t.is(await page.url(), config.formURL)
})
