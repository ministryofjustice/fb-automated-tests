import MailosaurClient from 'mailosaur'

import config from '../config'

const APIKey = config.emailAPIKey
const serverID = config.emailServerId

const client = new MailosaurClient(APIKey)

function waitForEmail (recipientEmail) {
  return client.messages.waitFor(serverID, {
    sentTo: recipientEmail
  })
}

function generateEmailAddress (subdomain = 'xyz') {
  return `${subdomain}.${process.env.EMAIL_SERVICE_SERVER_ID}@mailosaur.io`
}

function getAttachment (id) {
  return client.files.getAttachment(id)
}

function deleteMessages () {
  return client.messages.deleteAll(serverID)
}

async function checkForRecievedEmail (t, recipientEmail) {
  if (!config.skipEmail) {
    console.log(`Checking for email (${new Date().toString()}) sent to ${recipientEmail}`) // eslint-disable-line no-console
    await pause(15)

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
          links
        }
      } = result

      const confirmationLink = links.pop()
      return {subject, fromEmail, toEmail, confirmationLink}
    } catch (error) {
      t.fail(`Email not received, with error: ${error.message}`)
    }
  }
}

const pause = (secs) => {
  console.log(`Pausing for ${secs} secs`) // eslint-disable-line no-console
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, 1000 * secs)
  })
}

export {
  checkForRecievedEmail,
  generateEmailAddress,
  waitForEmail,
  getAttachment,
  deleteMessages,
  pause
}
