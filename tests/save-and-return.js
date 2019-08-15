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
