import test from 'ava'
import withPage from '../utils/withPage'
import config from '../config'
import {
  generateEmailAddress,
  waitForEmail,
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

async function checkForRecievedEmail(page, t, recipientEmail) {
  if (!config.skipEmail) {
    console.log(`Checking for email (${(new Date()).toString()}) sent to ${recipientEmail}`) // eslint-disable-line no-console
    await pause(30)

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
          links: links
        }
      } = result

      // Ensure we have got the right email
      t.truthy(subject.includes('Confirm your email address'), 'Email has correct subject')
      t.is(fromEmail, 'formbuilder@notifications.service.gov.uk', 'From email address is correct')
      t.is(toEmail, recipientEmail, 'To email address is correct')

      const confirmationLink = links.find( link => {
        return link.text === 'Confirm your email address';
      });

      return confirmationLink

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

test(
  'User saves progress and confirms email',
  withPage,
  async (t, page) => {
    const recipientEmail = generateEmailAddress('save-form')

    // Start form and complete first answer
    await startForm(page)

    // Click save for later
    await saveProgress(page, recipientEmail)

    // Receive confirmation email
    const confirmationLink = await checkForRecievedEmail(page, t, recipientEmail)

    // Click on confirmation link from email
    await page.goto(confirmationLink.href)

    // Check that answers are saved
    await recoverSavedAnswers(page, t, recipientEmail)

    // Click sign out link
    await page.clickAndWait(config.signOutFromForm)
  }
)

test(
  'User returns to previously aved form',
  withPage,
  async (t, page) => {
    const recipientEmail = generateEmailAddress('recover-saved-form')

    // Start form and complete first answer
    await startForm(page)

    // Click save for later
    await saveProgress(page, recipientEmail)

    // Receive confirmation email
    const confirmationLink = await checkForRecievedEmail(page, t, recipientEmail)

    // Click on confirmation link from email
    await page.goto(confirmationLink.href)

    // Check that answers are saved
    await recoverSavedAnswers(page, t, recipientEmail)

    // Click sign out link
    await page.clickAndWait(config.signOutFromForm)

    // go to form start page
    await page.goto(config.formURL)

    // click on Continue work on a saved form
    await page.clickAndWait(config.recoverSavedForm)

    // enter email
    await page.type(config.enterEmailToRecoverForm, recipientEmail)
    await page.clickAndWait(config.submitButton)

    let magicConfirmationLink
    // check email
    if (!config.skipEmail) {
      console.log(`Checking for email (${(new Date()).toString()}) sent to ${recipientEmail}`) // eslint-disable-line no-console
      await pause(30)

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
            links: links
          }
        } = result

        // Ensure we have got the right email
        t.truthy(subject.includes('Your sign-in link'), 'Email has correct subject')
        t.is(fromEmail, 'formbuilder@notifications.service.gov.uk', 'From email address is correct')
        t.is(toEmail, recipientEmail, 'To email address is correct')

        magicConfirmationLink = links.pop()


      } catch (error) {
        t.fail(`Email not received, with error: ${error.message}`)
      }

      await page.goto(magicConfirmationLink.href)

      await recoverSavedAnswers(page, t, recipientEmail)
    }
  }
)
