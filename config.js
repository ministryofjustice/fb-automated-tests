import dotenv from 'dotenv'

dotenv.config()

const {
  FORM_URL,
  EMAIL_SERVICE_API_KEY,
  EMAIL_SERVICE_SERVER_ID,
  NOTIFY_API_KEY,
  NOTIFY_PHONE_NUMBER
} = process.env

const skipEmail = !EMAIL_SERVICE_API_KEY || process.env.SKIP_EMAIL

const config = {
  continueWithSavedForm: 'a[href="/do-you-want-to-continue"]',
  submitButton: 'button[type="submit"]:not([name])',
  saveAndComeBackLater: 'button[name="setupReturn"]',
  recoverSavedForm: 'a[href=\'/return\']',
  signOutFromForm: 'a[href=\'/return/signout\']',
  enable2fa: 'a[href="/return/2fa"]',
  enterEmailToRecoverForm: '[id="return_start_email"]',
  enterEmailToSaveForm: '[id="return_setup_email_address"]',
  enter2faPhoneNumber: '[id="return_setup_mobile--text_mobile"]',
  enter2faCode: '[id="return_setup_mobile_validate--text_code"]',
  formURL: FORM_URL || 'https://automated-testing.dev.integration.form.service.justice.gov.uk/',
  formTitle: 'A form for testing',
  emailAPIKey: EMAIL_SERVICE_API_KEY,
  emailServerId: EMAIL_SERVICE_SERVER_ID,
  notifyAPIKey: NOTIFY_API_KEY,
  notifyPhoneNumber: NOTIFY_PHONE_NUMBER,
  skipEmail
}

export default config
