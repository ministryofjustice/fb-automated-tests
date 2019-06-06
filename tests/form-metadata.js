import test from 'ava'
import withPage from '../utils/withPage'
import config from '../config'

test('the form has the correct metadata', withPage, async (t, page) => {
  await page.goto(config.formURL)

  const currentTitle = await page.title()
  t.true(currentTitle === 'GOV.UK - The best place to find government services and information')

  t.is(await page.url(), config.formURL)

  t.is(await page.getText('h1'), config.formTitle)

  await page.clickAndWait('header a')
  t.is(await page.url(), config.formURL)
  await page.clickAndWait(config.submitButton)

  await page.clickAndWait('header a')
  t.is(await page.url(), config.formURL)

  const phase = await page.getText('.govuk-phase-banner__content__tag')
  t.is(phase, 'ALPHA')
})
