import test from 'ava'
import withPage from '../utils/withPage'
import config from '../config'
import {
  generateEmailAddress,
  waitForEmail,
  pause
} from '../utils/email-service'

async function visitRecoverFormPage (page) {
  await page.goto(config.formURL)
  await page.clickAndWait(config.recoverSavedForm)
}

test(
  'User saves progress and confirms email',
  withPage,
  async (t, page) => {
    const recipientEmail = generateEmailAddress('save-form')

    // Start form and complete first answer
    await page.goto(config.formURL)
    await page.clickAndWait(config.submitButton)
    await page.click('input[id="auto_name_1-0"]')
    await page.clickAndWait(config.submitButton)

    // Click save for later
    await page.clickAndWait(config.saveAndComeBackLater)
    t.is(
      await page.getText('h1'),
      'Saving your progress',
      'The user is shown the save and return start page'
    )
    await page.clickAndWait(config.submitButton)

    // User Enters email address
    await page.type(config.enterEmailToSaveForm, recipientEmail)
    await page.clickAndWait(config.submitButton)

    // Receive confirmation email
    let confirmationLink
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

        confirmationLink = links.find( link => {
          return link.text === 'Confirm your email address';
        });

        // Ensure we have got the right email
        t.truthy(subject.includes('Confirm your email address'), 'Email has correct subject')
        t.is(fromEmail, 'formbuilder@notifications.service.gov.uk', 'From email address is correct')
        t.is(toEmail, recipientEmail, 'To email address is correct')

      } catch (error) {
        t.fail(`Email not received, with error: ${error.message}`)
      }
    }

    // Click on confirmation link from email
    await page.goto(confirmationLink.href)
    t.is(
      await page.getText('h1'),
      'Your work has been saved',
      'The user confirms email via link'
    )

    // Check that answers are saved
    const savedAnswer = await page.getText('.govuk-summary-list__value')
    t.is(savedAnswer.trim(), 'Yes - I want to continue', 'Previous answers are saved')

    // Check that user is signed in
    const signedInText = await page.getText('#signedin')
    t.truthy(signedInText.includes(recipientEmail), 'User is signed in')
  }
)
