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

const pause = (secs) => {
  console.log(`Pausing for ${secs} secs`) // eslint-disable-line no-console
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, 1000 * secs)
  })
}

export {
  generateEmailAddress,
  waitForEmail,
  getAttachment,
  deleteMessages,
  pause
}
