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
  t.is(flashErrorTitle, 'There is a problem', 'Flash message has the correct error title')

  const errorLinks = await page.$$('.govuk-error-summary__list a')
  t.is(errorLinks.length, 1, 'There is only one error message')
  const errorText = await page.getText('.govuk-error-summary__list a')
  t.is(errorText, 'Choose one of the answers for Do you want to continue?', 'The flash message explains the correct error')

  await errorLinks[0].click()
  // TODO: this test should confirm which element is focused
  // but document.activeElement is returning an empty object
  // async function activeElement (page) {
  //   return page.evaluate(() => document.activeElement)
  // }
  // const active = await activeElement(page)
  // t.is(active.id, 'auto_name_1-0')
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
  t.is(await page.url(), `${config.formURL}some-questions`, 'User is sent to the next question')
})
