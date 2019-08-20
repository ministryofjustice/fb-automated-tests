import dotenv from 'dotenv'

dotenv.config()

const {
  FORM_URL,
  EMAIL_SERVICE_API_KEY,
  EMAIL_SERVICE_SERVER_ID
} = process.env

const skipEmail = !EMAIL_SERVICE_API_KEY || process.env.SKIP_EMAIL

const config = {
  submitButton: 'button[type="submit"]:not([name])',
  saveAndComeBackLater: 'button[name="setupReturn"]',
  recoverSavedForm: 'a[href=\'/return\']',
  enterEmailToRecoverForm: '[id="return_start_email"]',
  enterEmailToSaveForm: '[id="return_setup_email_address"]',
  formURL: FORM_URL || 'https://automated-testing.dev.test.form.service.justice.gov.uk/',
  formTitle: 'A form for testing',
  emailAPIKey: EMAIL_SERVICE_API_KEY,
  emailServerId: EMAIL_SERVICE_SERVER_ID,
  skipEmail
}

export default config
