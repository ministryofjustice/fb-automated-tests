// import test from 'ava'
// import withPage from '../utils/withPage'
// import config from '../config'
// import {
//   generateEmailAddress,
//   waitForEmail,
//   pause
// } from '../utils/email-service'
//
// async function visitRecoverFormPage (page) {
//   await page.goto(config.formURL)
//   await page.clickAndWait(config.recoverSavedForm)
// }
//
//
// // TODO:
// // - user sets up 2FA
// // - user uses 2FA to recover a form
//
// test(
//   'User saves progress and enables 2FA',
//   withPage,
//   async (t, page) => {
//
//     // Process:
//     // 1. Visit form and answer a question
//     // 2. Save for later
//     // 3. Confirm email address from link.
//     // 4. Add 2fa phone numnber
//     // 5. Receive SMS, enter code from SMS
//     // 6. See 2fa confirmation screen
//
//     const recipientEmail = generateEmailAddress('save-form-2fa')
//
//     // Start form and complete first answer
//     await page.goto(config.formURL)
//     await page.clickAndWait(config.submitButton)
//     await page.click('input[id="auto_name_1-0"]')
//     await page.clickAndWait(config.submitButton)
//
//     // Save for later
//     await page.clickAndWait(config.saveAndComeBackLater)
//     await page.clickAndWait(config.submitButton)
//
//     // Enter email address
//     await page.type(config.enterEmailToSaveForm, recipientEmail)
//
//     t.is(
//       await page.getText('h1'),
//       'Save your progress',
//       'The user is shown the save and return start page'
//     )
//
//     await page.clickAndWait(config.submitButton)
//
//     t.is(
//       await page.getText('h1'),
//       'Check your email',
//       'The user is shown the save and return start page'
//     )
//     // Receive confirmation email
//     if (!config.skipEmail) {
//       await pause(30)
//
//       console.log(`Checking for email (${(new Date()).toString()}) sent to ${recipientEmail}`) // eslint-disable-line no-console
//       try {
//         const result = await waitForEmail(recipientEmail)
//
//         const {
//           subject,
//           from: [{
//             email: fromEmail
//           }],
//           to: [{
//             email: toEmail
//           }]
//         } = result
//
//         console.log(result)
//         t.truthy(subject.includes('Your sign-in link'), 'Email has correct body')
//         t.is(fromEmail, 'formbuilder@notifications.service.gov.uk', 'From email address is correct')
//         t.is(toEmail, recipientEmail, 'To email address is correct')
//       } catch (error) {
//         t.fail(`Email not received, with error: ${error.message}`)
//       }
//     }
//   }
// )
//
// test(
//   'User recovers form with 2FA',
//   withPage,
//   async (t, page) => {
//     const recipientEmail = generateEmailAddress('recover-saved-form')
//
//     await visitRecoverFormPage(page)
//
//     await page.type(config.enterEmailToRecoverForm, recipientEmail)
//     await page.clickAndWait(config.submitButton)
//
//     if (!config.skipEmail) {
//       await pause(30)
//
//       console.log(`Checking for email (${(new Date()).toString()}) sent to ${recipientEmail}`) // eslint-disable-line no-console
//       try {
//         const result = await waitForEmail(recipientEmail)
//
//         const {
//           subject,
//           from: [{
//             email: fromEmail
//           }],
//           to: [{
//             email: toEmail
//           }]
//         } = result
//
//         t.truthy(subject.includes('Your sign-in link'), 'Email has correct body')
//         t.is(fromEmail, 'formbuilder@notifications.service.gov.uk', 'From email address is correct')
//         t.is(toEmail, recipientEmail, 'The to email address is correct')
//       } catch (error) {
//         t.fail(`Email not received, with error: ${error.message}`)
//       }
//     }
//   }
// )
