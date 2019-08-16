import test from 'ava'
import withPage from '../utils/withPage'
import config from '../config'
import {
  generateRandomEmailAddress,
  waitForEmail,
  getAttachment,
  deleteMessages
} from '../utils/email-service'

test(
  'Save & return button is displayed to the user',
  withPage,
  async (t, page) => {
    await page.goto(config.formURL)
    t.is(
      await page.getText('a[href=\'/return\']'),
      'Continue work on a saved form',
      'The link to continue work on a saved form is present'
    )
  }
)

test(
  'User can enter email address to recover saved form',
  withPage,
  async (t, page) => {
    await page.goto(config.formURL)
    await page.clickAndWait('a[href=\'/return\']')
    t.is(
      await page.getText('h1'),
      'Get a sign-in link',
      'The user is asked for their email address'
    )
  }
)

test(
  'User gets confirmation that email is sent',
  withPage,
  async (t, page) => {
    await page.goto(config.formURL)
    await page.clickAndWait('a[href=\'/return\']')

    const recipientEmail = generateRandomEmailAddress()
    const emailInputSelector = '[id="return_start_email"]'
    await page.type(emailInputSelector, recipientEmail)
    await page.clickAndWait(config.submitButton)
    const confirmationText = await page.getText('p.govuk-body-l')

    t.truthy(confirmationText.includes(recipientEmail), 'User is notified of email')
  }
)
