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

function generateRandomEmailAddress () {
  return 'nuttyone.grsdrypq@mailosaur.io'
  // return client.servers.generateEmailAddress(serverID)
}

function getAttachment (id) {
  return client.files.getAttachment(id)
}

function deleteMessages () {
  return client.messages.deleteAll(serverID)
}

export {
  generateRandomEmailAddress,
  waitForEmail,
  getAttachment,
  deleteMessages
}
