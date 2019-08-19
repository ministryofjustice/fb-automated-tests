import test from 'ava'
import withPage from '../utils/withPage'
import config from '../config'
import {
  generateEmailAddress,
  waitForEmail,
  getAttachment,
  deleteMessages
} from '../utils/email-service'

async function visitRecoverFormPage(page) {
  await page.goto(config.formURL)
  await page.clickAndWait(config.recoverSavedForm)
}

test(
  'User can save progress',
  withPage,
  async (t, page) => {
    await page.goto(config.formURL)
    await page.clickAndWait(config.submitButton)
    await page.clickAndWait(config.saveAndComeBackLater)
    t.is(
      await page.getText('h1'),
      'Saving your progress',
      'The user is shown the save and return start page'
    )
  }
)

test(
  'User can enter email address to recover saved form',
  withPage,
  async (t, page) => {
    await visitRecoverFormPage(page)
    t.is(
      await page.getText('h1'),
      'Get a sign-in link',
      'The user is asked for their email address'
    )
  }
)

test(
  'User enters email address to recover saved form',
  withPage,
  async (t, page) => {
    const recipientEmail = generateEmailAddress()

    await visitRecoverFormPage(page)

    await page.type(config.enterEmailToRecoverForm, recipientEmail)
    await page.clickAndWait(config.submitButton)
    const confirmationText = await page.getText('p.govuk-body-l')

    t.truthy(confirmationText.includes(recipientEmail), 'User is notified of email')
  }
)

test(
  'User receives form recovery email',
  withPage,
  async (t, page) => {
    const recipientEmail = generateEmailAddress('save-and-return')

    await visitRecoverFormPage(page)

    await page.type(config.enterEmailToRecoverForm, recipientEmail)
    await page.clickAndWait(config.submitButton)

    if (!config.skipEmail) {
      const pause = (secs) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            console.log(`Pausing for ${secs} secs`) // eslint-disable-line no-console
            resolve()
          }, 1000 * secs)
        })
      }

      await pause(30)

      console.log(`Checking for email (${(new Date()).toString()}) sent to ${recipientEmail}`) // eslint-disable-line no-console
      try {
        const result = await waitForEmail(recipientEmail)

        const {
          subject,
          from: [{
            email: fromEmail
          }],
          to: [{
            email: toEmail
          }]
        } = result

        t.truthy(subject.includes('Your sign-in link'), 'Email has correct body')
        t.is(fromEmail, 'formbuilder@notifications.service.gov.uk', 'From email address is correct')
        t.is(toEmail, recipientEmail, 'To email address is correct')

      } catch(error) {
        t.fail(`Email not received, with error: ${error.message}`)
      }
    }
  }
)
