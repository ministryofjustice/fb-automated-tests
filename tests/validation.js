import test from 'ava'
import withPage from '../utils/withPage'
import config from '../config'

test('Redirecting to the same question if validation fails', withPage, async (t, page) => {
  await page.goto(config.formURL)
  await page.clickAndWait(config.submitButton)
  const currentURL = await page.url()
  await page.clickAndWait(config.submitButton)

  t.is(await page.url(), currentURL, 'User is redirected to a failed a question')
})

test('Flash messages for failed validation appear', withPage, async (t, page) => {
  await page.goto(config.formURL)
  await page.clickAndWait(config.submitButton)
  await page.clickAndWait(config.submitButton)

  const flashErrorTitle = await page.getText('#error-summary-title')
  t.is(flashErrorTitle, 'There was a problem on the page', 'Flash message has the correct error title')

  const errorLinks = await page.$$('.govuk-error-summary__list a')
  t.is(errorLinks.length, 1, 'There is only one error message')
  const errorText = await page.getText('.govuk-error-summary__list a')
  t.is(errorText, 'Choose one of the answers for Do you want to continue?', 'The flash message explains the correct error')

  t.is(await page.getHash(), '', 'There is no hash in the URL')
  await errorLinks[0].click()
  t.is(await page.getHash(), '#page.do-you-want-to-continue--radios.auto_name__1', 'Clicking the error message adds the question ID to the URL hash')

  // TODO: BUG with the Form Runner: Clicking the link should take you to the question
  // TODO: Need to confirm the hash fragment points to an element on the page
})

test('Navigating back and forward and should clear the error message', withPage, async (t, page) => {
  await page.goto(config.formURL)
  await page.clickAndWait(config.submitButton)
  await page.clickAndWait(config.submitButton)

  t.truthy(await page.$('#error-summary-title'))

  await page.clickAndWait('.govuk-back-link')
  await page.clickAndWait(config.submitButton)

  t.is(await page.$('#error-summary-title'), null)
  await page.clickAndWait(config.submitButton)
  t.truthy(await page.$('#error-summary-title'))
})

test('Correctly answering a question removes an existing error message', withPage, async (t, page) => {
  await page.goto(config.formURL)
  await page.clickAndWait(config.submitButton)
  await page.clickAndWait(config.submitButton)

  t.truthy(await page.$('#error-summary-title'))

  await page.click('#auto_name_1-0')
  await page.clickAndWait(config.submitButton)
  t.is(await page.$('#error-summary-title'), null)
  t.is(await page.url(), 'https://automated-testing.dev.test.form.service.justice.gov.uk/some-questions', 'User is sent to the next question')
})
