import test from 'ava'
import withPage from '../utils/withPage'
import config from '../config'

test('Navigating backwards after navigating forwards', withPage, async (t, page) => {
  await page.goto(config.formURL)
  await page.clickAndWait(config.submitButton)
  t.is(await page.getText('.govuk-back-link'), 'Back', 'The back link text is correct')
  await page.clickAndWait('.govuk-back-link')
  t.is(await page.url(), config.formURL, 'Clicking back takes you to the main form homepage')
})

test('Navigating backwards when landing in the middle of a form', withPage, async (t, page) => {
  await page.goto(config.formURL)
  await page.goto(`${config.formURL}check-answers`)
  await page.clickAndWait('.govuk-back-link')
  t.is(await page.url(), `${config.formURL}confirm-your-email`, 'Goes back to the confirm your email page')
  await page.clickAndWait('.govuk-back-link')
  t.is(await page.url(), `${config.formURL}do-you-want-to-continue`, 'Goes back to the first question page')
  await page.clickAndWait('.govuk-back-link')
  t.is(await page.url(), config.formURL, 'Continuing to click back takes you to the home page')
  t.is(await page.$('.govuk-back-link'), null, 'There is no back link on the homepage')
})
