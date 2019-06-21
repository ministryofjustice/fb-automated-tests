import test from 'ava'
import pdf from 'pdf-parse'

import withPage from '../utils/withPage'
import config from '../config'
import {
  generateRandomEmailAddress,
  waitForEmail,
  getAttachment
} from '../utils/email-service'

async function getPDFText (file) {
  const {text: PDFText} = await pdf(file)
  return PDFText
}

test('Full form completion including the email PDF', withPage, async (t, page) => {
  const recipientEmail = generateRandomEmailAddress()

  await page.goto(config.formURL)
  await page.clickAndWait(config.submitButton)
  await page.click('#auto_name_1-0')
  await page.clickAndWait(config.submitButton)

  const input = await page.$('[name="auto_name__2[1]"]')
  await input.uploadFile('./file-upload-sample.png')
  await page.clickAndWait(config.submitButton)

  t.is(await page.getText('.fb-flash-summary li'), 'Document file-upload-sample.png uploaded')

  const emailInputSelector = '[id="page_confirm-your-email--email_auto_name_3"]'
  await page.type(emailInputSelector, recipientEmail)
  await page.clickAndWait(config.submitButton)

  t.is(await page.getText('h1'), 'Check your answers', 'Check your answers page has the correct heading')
  t.is(await page.getText(config.submitButton), 'Accept and send application', 'The submit button has the correct test')
  await page.clickAndWait(config.submitButton)

  t.is(await page.getText('.govuk-panel__body'), `We'll email ${recipientEmail}`, 'Final exit page includes the user email address')

  t.is(await page.$(config.submitButton), null, 'There is no submit button on the final exit page')

  let result = await waitForEmail(recipientEmail)

  const {
    attachments,
    from: [{
      email: fromEmail
    }],
    to: [{
      email: toEmail
    }]
  } = result

  const [attachment] = attachments
  const attachmentFile = await getAttachment(attachment.id)
  const PDFText = await getPDFText(attachmentFile)

  t.is(fromEmail, 'form-builder@digital.justice.gov.uk', 'From email address is correct')
  t.is(toEmail, recipientEmail, 'To email address is correct')
  t.is(attachments.length, 1, 'These is only one single attachment')
  t.is(attachment.contentType, 'application/pdf', 'attachment is a PDF type')
  t.true(PDFText.includes(recipientEmail), 'PDF includes the user email address')
  t.true(PDFText.includes('file-upload-sample.png (687.9KB)'), 'PDF includes a mention of the uploaded file')
  t.true(PDFText.includes('Yes - I want to continue'), 'PDF inlcudes the answer to a question')
})
