import test from 'ava'
import withPage from '../utils/withPage'
import config from '../config'

test('Full form completion (form happy path)', withPage, async (t, page) => {
  await page.goto(config.formURL)

  await page.clickAndWait(config.submitButton)

  await page.click('#auto_name__1-0')
  await page.clickAndWait(config.submitButton)

  const input = await page.$('[name="auto_name__2[1]"]')
  await input.uploadFile('./file-upload-sample.png')
  await page.clickAndWait(config.submitButton)

  t.is(await page.getText('.fb-flash-summary li'), 'Document file-upload-sample.png uploaded')

  const emailInputSelector = '[id="page.confirm-your-email--email.auto_name__3"]'
  await page.type(emailInputSelector, 'test@example.com')
  await page.clickAndWait(config.submitButton)

  t.is(await page.getText('h1'), 'Check your answers', 'Check your answers page has the correct heading')
  t.is(await page.getText(config.submitButton), 'Accept and send application', 'The submit button has the correct test')
  await page.clickAndWait(config.submitButton)

  t.is(await page.getText('.govuk-panel__body'), 'We\'ll email test@example.com', 'Final exit page includes the user email address')

  t.is(await page.$(config.submitButton), null, 'There is no submit button on the final exit page')
})
