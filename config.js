import dotenv from 'dotenv'

dotenv.config()

const {
  FORM_URL,
  EMAIL_SERVICE_API_KEY,
  EMAIL_SERVICE_SERVER_ID
} = process.env

const skipEmail = !EMAIL_SERVICE_API_KEY || process.env.SKIP_EMAIL

const config = {
  continueWithSavedForm: 'a[href="/do-you-want-to-continue"]',
  submitButton: 'button[type="submit"]:not([name])',
  saveAndComeBackLater: 'button[name="setupReturn"]',
  recoverSavedForm: 'a[href=\'/return\']',
  signOutFromForm: 'a[href=\'/return/signout\']',
  enterEmailToRecoverForm: '[id="return_start_email"]',
  enterEmailToSaveForm: '[id="return_setup_email_address"]',
  formURL: FORM_URL || 'https://automated-testing.dev.integration.form.service.justice.gov.uk/',
  formTitle: 'A form for testing',
  emailAPIKey: EMAIL_SERVICE_API_KEY,
  emailServerId: EMAIL_SERVICE_SERVER_ID,
  skipEmail
}

export default config
