import test from 'ava'
import withPage from '../utils/withPage'
import config from '../config'

test('File upload validation for a single file', withPage, async (t, page) => {
  await page.goto(config.formURL)
  await page.clickAndWait(config.submitButton)
  await page.click('#auto_name_1-0')
  await page.clickAndWait(config.submitButton)
  await page.clickAndWait(config.submitButton)

  t.truthy(await page.$('#error-summary-title'))

  t.is(await page.getHash(), '', 'There is no hash in the URL')
  const errorLinks = await page.$$('.govuk-error-summary__list a')
  await errorLinks[0].click()
  t.is(await page.getHash(), '#page.some-questions--fileupload.auto_name__2', 'Clicking the error message adds the question ID to the URL hash')
})

test('File upload for multiple files', withPage, async (t, page) => {
  await page.goto(config.formURL)
  await page.clickAndWait(config.submitButton)
  await page.click('#auto_name_1-0')
  await page.clickAndWait(config.submitButton)

  const firstInput = await page.$('[name="auto_name__2[1]"]')
  await firstInput.uploadFile('./file-upload-sample.png')
  await page.clickAndWait('[name="addFile"]')

  const fileDetails = await page.getText('.fb-summary-list--file-key')
  t.is(fileDetails, 'file-upload-sample.png (png, 687KB)', 'the file name & file size is shown')

  const secondInput = await page.$('[name="auto_name__2[1]"]')
  await secondInput.uploadFile('./file-upload-sample-2.png')
  await page.clickAndWait(config.submitButton)

  t.is(await page.getText('.fb-flash-summary li'), 'Document file-upload-sample-2.png uploaded', 'flash message specifies the newly uploaded file')
})

test('Removing uploaded files', withPage, async (t, page) => {
  await page.goto(config.formURL)
  await page.clickAndWait(config.submitButton)
  await page.click('#auto_name_1-0')
  await page.clickAndWait(config.submitButton)

  const initialInput = await page.$('[name="auto_name__2[1]"]')
  await initialInput.uploadFile('./file-upload-sample.png')
  await page.clickAndWait(config.submitButton)
  await page.clickAndWait('.govuk-back-link')

  t.truthy(await page.$('.fb-summary-list--file-key'), 'File summary list does exist')
  await page.clickAndWait('[name="removeFile"]')
  t.is(await page.getText('.fb-flash-summary li'), 'Removed file-upload-sample.png')
  t.is(await page.$('.fb-summary-list--file-key'), null, 'No file summary is shown when all files have been deleted')

  await page.clickAndWait('[name="addFile"]')

  const firstInput = await page.$('[name="auto_name__2[1]"]')
  await firstInput.uploadFile('./file-upload-sample.png')

  const secondInput = await page.$('[name="auto_name__2[2]"]')
  await secondInput.uploadFile('./file-upload-sample-2.png')
  await page.clickAndWait(config.submitButton)
  await page.clickAndWait('.govuk-back-link')

  const filesListBefore = await page.$$('.fb-summary-list--file-key')
  t.is(filesListBefore.length, 2, 'There are two files showing up')

  // Removes file the first file only
  await page.clickAndWait('[name="removeFile"]')

  const filesListAfter = await page.$$('.fb-summary-list--file-key')
  t.is(filesListAfter.length, 1, 'Only one file is remaining')

  const fileDetails = await page.getText('.fb-summary-list--file-key')
  t.is(fileDetails, 'file-upload-sample-2.png (png, 687KB)', 'the file name & file size is shown for the last remaining file')
})
