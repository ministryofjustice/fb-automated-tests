import test from 'ava'
import withPage from '../utils/withPage'
import config from '../config'
import {
  checkForRecievedEmail,
  generateEmailAddress,
  deleteMessages
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

async function recoverSavedAnswers (page, t, recipientEmail) {
  const savedAnswer = await page.getText('.govuk-summary-list__value')
  t.is(savedAnswer.trim(), 'Yes - I want to continue', 'Previous answers are saved')

  // Check that user is signed in
  const signedInText = await page.getText('#signedin')
  t.includes(signedInText, recipientEmail, 'User is signed in')
}

const {skipSaveReturn} = config

if (skipSaveReturn) {
  test('Skipping save and return tests', t => {
    t.plan(0)
  })
} else {
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
      await deleteMessages()

      // Ensure we have got the right email
    t.includes(email.subject, 'Confirm your email address', 'Email has correct subject') // eslint-disable-line
      t.is(email.fromEmail, 'formbuilder@notifications.service.gov.uk', 'From email address is correct')
      t.is(email.toEmail, recipientEmail, 'To email address is correct')

      // Click on confirmation link from email
      await page.goto(email.confirmationLink.href)

      // Check that answers are saved
      await recoverSavedAnswers(page, t, recipientEmail)

      // Click sign out link
      await page.clickAndWait(config.signOutFromForm)
    }
  )

  test.serial(
    'User returns to previously saved form',
    withPage,
    async (t, page) => {
    // go to form start page
      await page.goto(config.formURL)

      // click on Continue work on a saved form
      await page.clickAndWait(config.recoverSavedForm)

      // enter email
      await page.type(config.enterEmailToRecoverForm, recipientEmail)
      await page.clickAndWait(config.submitButton)

      // Receive confirmation email
      const recoveryEmail = await checkForRecievedEmail(t, recipientEmail)
      await deleteMessages()

      // Ensure we have got the right email
    t.includes(recoveryEmail.subject, 'Your sign-in link', 'Email has correct subject') // eslint-disable-line
      t.is(recoveryEmail.fromEmail, 'formbuilder@notifications.service.gov.uk', 'From email address is correct')
      t.is(recoveryEmail.toEmail, recipientEmail, 'To email address is correct')

      await page.goto(recoveryEmail.confirmationLink.href)

      await recoverSavedAnswers(page, t, recipientEmail)
    }
  )
}
