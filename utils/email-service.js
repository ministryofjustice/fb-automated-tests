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

function generateEmailAddress (subdomain="xyz") {
  return `${subdomain}.${process.env.EMAIL_SERVICE_SERVER_ID}@mailosaur.io`
}

function getAttachment (id) {
  return client.files.getAttachment(id)
}

function deleteMessages () {
  return client.messages.deleteAll(serverID)
}

export {
  generateEmailAddress,
  waitForEmail,
  getAttachment,
  deleteMessages
}
