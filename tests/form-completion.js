import MailosaurClient from 'mailosaur'
import test from 'ava'
import pdf from 'pdf-parse'
import dotenv from 'dotenv'

import withPage from '../utils/withPage'
import config from '../config'

dotenv.config()

test('Full form completion', withPage, async (t, page) => {
  const APIKey = process.env.EMAIL_SERVICE_API_KEY
  const serverID = process.env.EMAIL_SERVICE_SERVER_ID

  const client = new MailosaurClient(APIKey)
  const emailToSendTo = client.servers.generateEmailAddress(serverID)

  await page.goto(config.formURL)
  await page.clickAndWait(config.submitButton)
  await page.click('#auto_name__1-0')
  await page.clickAndWait(config.submitButton)

  const input = await page.$('[name="auto_name__2[1]"]')
  await input.uploadFile('./file-upload-sample.png')
  await page.clickAndWait(config.submitButton)

  t.is(await page.getText('.fb-flash-summary li'), 'Document file-upload-sample.png uploaded')

  const emailInputSelector = '[id="page.confirm-your-email--email.auto_name__3"]'
  await page.type(emailInputSelector, emailToSendTo)
  await page.clickAndWait(config.submitButton)

  t.is(await page.getText('h1'), 'Check your answers', 'Check your answers page has the correct heading')
  t.is(await page.getText(config.submitButton), 'Accept and send application', 'The submit button has the correct test')
  await page.clickAndWait(config.submitButton)

  t.is(await page.getText('.govuk-panel__body'), `We'll email ${emailToSendTo}`, 'Final exit page includes the user email address')

  t.is(await page.$(config.submitButton), null, 'There is no submit button on the final exit page')

  console.log('Waiting for email to', emailToSendTo)
  let result = await client.messages.waitFor(serverID, {sentTo: emailToSendTo})

  let {
    attachments,
    from: [{
      email: fromEmail
    }],
    to: [{
      email: toEmail
    }]
  } = result

  const [attachment] = attachments

  const attachmentFile = await client.files.getAttachment(attachment.id)
  const {text: PDFText} = await pdf(attachmentFile)

  t.is(fromEmail, 'form-builder@digital.justice.gov.uk', 'From email address is correct')
  t.is(toEmail, emailToSendTo, 'To email address is correct')
  t.is(attachments.length, 1, 'These is only one single attachment')
  t.is(attachment.contentType, 'application/pdf', 'attachment is a PDF type')
  t.true(PDFText.includes(emailToSendTo), 'PDF includes the user email address')
  t.true(PDFText.includes('file-upload-sample.png (687.9KB)'), 'PDF includes a mention of the uploaded file')
  t.true(PDFText.includes('Yes - I want to continue'), 'PDF inlcudes the answer to a question')
})
