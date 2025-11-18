const { customAlphabet } = require('nanoid')
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const nanoid = customAlphabet(alphabet, 7) // 7 chars → ~3.5e12 combos

function generateId() {
  return nanoid()
}

module.exports = { generateId }
