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

      await deleteMessages()
      const confirmationLink = links.pop()
      return {subject, fromEmail, toEmail, confirmationLink}
    } catch (error) {
      t.fail(`Email not received, with error: ${error.message}`)
    }
  }
}

async function recoverSavedAnswers (page, t, recipientEmail) {
  const savedAnswer = await page.getText('.govuk-summary-list__value')
  t.is(savedAnswer.trim(), 'Yes - I want to continue', 'Previous answers are saved')

  // Check that user is signed in
  const signedInText = await page.getText('#signedin')
  t.truthy(signedInText.includes(recipientEmail), 'User is signed in')
}

const recipientEmail = generateEmailAddress('save-form')

test.serial(
  'User saves progress and confirms email',
  withPage,
  async (t, page) => {
    // Start form and complete first answer
    await startForm(page)

    // Click save for later
    await saveProgress(page, recipientEmail)

    // Receive confirmation email
    const email = await checkForRecievedEmail(t, recipientEmail)

    // Ensure we have got the right email
    t.truthy(email.subject.includes('Confirm your email address'), 'Email has correct subject')
    t.is(email.fromEmail, 'formbuilder@notifications.service.gov.uk', 'From email address is correct')
    t.is(email.toEmail, recipientEmail, 'To email address is correct')

    // Click on confirmation link from email
    await page.goto(email.confirmationLink.href)

    // Click to enable 2fa
    await page.clickAndWait(config.enable2fa)
    await page.click('input[id="two_factor_authentication-0"]')
    await page.clickAndWait(config.submitButton)
    await page.type(config.enter2faPhoneNumber, '+441452260194')
    await page.clickAndWait(config.submitButton)

    const accountSid = 'xxxxxx';
    const authToken = 'xxxxxxxxx';
    const client = require('twilio')(accountSid, authToken);

    await client.messages.list({limit: 1})
                   .then(messages => console.log(messages));

    // Click sign out link
    await page.clickAndWait(config.signOutFromForm)
  }
)
