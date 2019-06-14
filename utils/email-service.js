import MailosaurClient from 'mailosaur'
import dotenv from 'dotenv'

dotenv.config()

const APIKey = process.env.EMAIL_SERVICE_API_KEY
const serverID = process.env.EMAIL_SERVICE_SERVER_ID

const client = new MailosaurClient(APIKey)

function waitForEmail (recipientEmail) {
  return client.messages.waitFor(serverID, {
    sentTo: recipientEmail
  })
}

function generateRandomEmailAddress () {
  return client.servers.generateEmailAddress(serverID)
}

function getAttachment (id) {
  return client.files.getAttachment(id)
}

export {
  generateRandomEmailAddress,
  waitForEmail,
  getAttachment
}
