import test from 'ava'
import withPage from '../utils/withPage'
import config from '../config'

test('Form has the correct metadata', withPage, async (t, page) => {
  await page.goto(config.formURL)

  const currentTitle = await page.title()
  t.true(currentTitle === 'GOV.UK - The best place to find government services and information', 'Page title is correct')

  t.is(await page.url(), config.formURL, 'The form URL is correct')

  t.is(await page.getText('h1'), config.formTitle, 'The form heading text is correct')

  await page.clickAndWait('.govuk-header__content a')
  t.is(await page.url(), config.formURL, 'Clicking the header link redirects to the main form homepage')
  await page.clickAndWait(config.submitButton)

  await page.clickAndWait('.govuk-header__content a')
  t.is(await page.url(), config.formURL, 'Clicking the header logo while in the middle of a form journey redirects to the main form homepage')

  const phase = await page.getText('.govuk-phase-banner__content__tag')
  t.is(phase, 'ALPHA', 'The form phase is correct')
})
