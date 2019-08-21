import test from 'ava'
import withPage from '../utils/withPage'
import config from '../config'
import {
  generateEmailAddress,
  waitForEmail,
  deleteMessages,
  pause
} from '../utils/email-service'

async function startForm (page) {
  await page.goto(config.formURL)
  await page.clickAndWait(config.submitButton)
  await page.click('input[id="auto_name_1-0"]')
  await page.clickAndWait(config.submitButton)
}

async function saveProgress (page, recipientEmail) {
  await page.clickAndWait(config.saveAndComeBackLater)

  await page.clickAndWait(config.submitButton)

  // User Enters email address
  await page.type(config.enterEmailToSaveForm, recipientEmail)
  await page.clickAndWait(config.submitButton)
}

async function checkForRecievedEmail (t, recipientEmail) {
  if (!config.skipEmail) {
    console.log(`Checking for email (${(new Date()).toString()}) sent to ${recipientEmail}`) // eslint-disable-line no-console
    await pause(15)

    try {
      const result = await waitForEmail(recipientEmail)

      const {
        subject,
        from: [{
          email: fromEmail
        }],
        to: [{
          email: toEmail
        }],
        html: {
          links
        }
      } = result

      const confirmationLink = links.pop()
      return {subject, fromEmail, toEmail, confirmationLink}
    } catch (error) {
      t.fail(`Email not received, with error: ${error.message}`)
    }
  }
}

async function assertCorrectEmail (email, recipientEmail, t) {
  t.truthy(email.subject.includes('Confirm your email address'), 'Email has correct subject')
  t.is(email.fromEmail, 'formbuilder@notifications.service.gov.uk', 'From email address is correct')
  t.is(email.toEmail, recipientEmail, 'To email address is correct')
}

async function enable2fa (page) {
  await page.clickAndWait(config.enable2fa)
  await page.click('input[id="two_factor_authentication-0"]')
  await page.clickAndWait(config.submitButton)
  await page.type(config.enter2faPhoneNumber, config.notifyPhoneNumber)
  await page.clickAndWait(config.submitButton)
}

async function readCodeFromSMS (t) {
  console.log('Waiting for 2FA SMS to be received') // eslint-disable-line no-console
  await pause(15)
  const NotifyClient = require('notifications-node-client').NotifyClient
  const notifyClient = new NotifyClient(config.notifyAPIKey)

  const latestSMS = await notifyClient
    .getReceivedTexts()
    .then((response) => { return response.body.received_text_messages.shift().content })
    .catch((error) => t.fail(`SMS not received, with error: ${error}`))
  const codeFromSMS = latestSMS.split(' ').pop()
  return codeFromSMS
}

async function assertSavedAnswers (page, t, recipientEmail) {
  // Check 2FA is confirmed
  t.is(await page.getText('h1'), 'Your work is now protected by 2-step verification', '2FA is confirmed')

  // Check that previously saved answer is present
  const savedAnswer = await page.getText('.govuk-summary-list__value')
  t.is(savedAnswer.trim(), 'Yes - I want to continue', 'Previous answers are saved')

  // Check that user is signed in
  const signedInText = await page.getText('#signedin')
  t.truthy(signedInText.includes(recipientEmail), 'User is signed in')
}

test(
  'User saves answers with two factor authentication',
  withPage,
  async (t, page) => {
    const recipientEmail = generateEmailAddress('save-form-2fa')

    // Start form and complete first answer
    await startForm(page)

    // Click save for later
    await saveProgress(page, recipientEmail)

    // Receive confirmation email
    const email = await checkForRecievedEmail(t, recipientEmail)
    await deleteMessages()

    // Ensure we have got the right email
    await assertCorrectEmail(email, recipientEmail, t)

    // Click on confirmation link from email
    await page.goto(email.confirmationLink.href)

    // Click to enable 2fa
    await enable2fa(page)

    // Receive code via SMS
    const signInCode = await readCodeFromSMS(t)

    // Confirm 2FA with code from SMS
    await page.type(config.enter2faCode, signInCode)
    await page.clickAndWait(config.submitButton)

    await assertSavedAnswers(page, t, recipientEmail)
  }
)