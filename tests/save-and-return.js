import test from 'ava'
import withPage from '../utils/withPage'
import config from '../config'

test(
  'Save & return button is displayed to the user',
  withPage,
  async (t, page) => {
    await page.goto(config.formURL)
    t.is(
      await page.getText('a[href=\'/return\']'),
      'Continue work on a saved form',
      'The link to continue work on a saved form is present'
    )
  }
)

test(
  'User can enter email address to recover saved form',
  withPage,
  async (t, page) => {
    await page.goto(config.formURL)
    await page.clickAndWait('a[href=\'/return\']')
    t.is(
      await page.getText('h1'),
      'Get a sign-in link',
      'The user is asked for their email address'
    )
  }
)
