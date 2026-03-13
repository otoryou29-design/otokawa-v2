const crypto = require('crypto')

const CLIENT_ID      = 'lHR2vHw4Z2B1IpLyXABb'
const CLIENT_SECRET  = 'pV80_Aj0CY'
const SERVICE_ACCOUNT = 'j3fl4.serviceaccount@works-38283'
const BOT_ID          = '11818155'
const CHANNEL_ID      = '5fb09f65-4ba0-c397-b76f-3bd75e48b288'
const PRIVATE_KEY     = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCywF3GdOxUGWD9
wFjhT/Cp0SFguCThDS4rrMNVnCyOrSiZtTEaytaYfqrStE1HbDlP2Hi6ce6GUKaW
Gk3RjRQ3t+ZPS1tCFIDLP2vtQhUMng86YgkzgI21iSQOds1GxhAOnQxu4bmSA6IM
q1B4l00Mz9I0QgI2hjLO6qLh2JzdD5S1adDMPvDfl7MvIiAzJqAteGrunRXeYc6Z
mxeuEitqPHJ/intcQc6NyD96svR5coZ9hqWOOrdzCT/jo7t0uZIzKHfyRr4Xxg4f
Yw3+bWiAh4OAkmSHpN4ojqi0wlDkH8BvzTTUVN3n/L3qeFSyw/6UXexGpT+S8nb8
/trNem6/AgMBAAECggEANrFmYAVBlF/pjerPJy2TCRq8mD/vxM6IHIPxhp3RAlzY
KePHYRfEPoevU+YoKRzjkls9YWrf3UgLGK12txHwKDZEKWn4w8jLOaUvrDpGf4RT
S31YrGH+uhd6qVRPbgLHQflqpvi5E4S6Dh9S8Xr17+AcxLGXxMAeBrLDYNAq+vY5
BsmDgUu3pF3JYuFWsVm3mgg4LI7fmTFTV99t2zus+3wivfaclI8DjosYjI4PiyNB
bGHgZ67nHp9w9dQnIrxcBTw5l34RpZMdagZMz8PO9ITrXjTQ3hzA4mVChqsDsdM4
8l10XZ2O2hMG2qcuNY1+H7QBhYcy4F4UorWmBvOGgQKBgQDPsLBBLK9xGfZajWB0
bYP4aBuXUzP6eHUDBeqIFifB594DdQ/b48MnHMT2GZx4i0ZXhmRkeygkUAJhLohd
PKlRkpin92sZrkhfqnthTZFihD361+CgMM7NhuDrliq334/H2AArKr8UXtOABvaM
eq9CbaHjSoGrR9lyUGkBKvTNgQKBgQDcVHa8zMhx3+Xxl2Zop/rfVXq5G0+fhIb4
ISHspXKfFpEwvt8QDmDk11WUB4RJk6knYVwj4hcKBkAZ3stfqbyB5Qgc/bCpfcYH
gEo6QfL2QmcDWYVLP/7ScA2xUv3g0Y+zEmr8+L6j8xYRQTgLbN4rMrbWFaF/EXbG
en+w3SHcPwKBgQDMcfC+5374hgcVEnBti9TKNalbaCMVn3gH9s3tEmomndnVa2mm
Gmnj2ZUlcQavPuKKjBfNNdLJFB2TjpvbtDg0vWsahRrfl8lUqtxzZ0kDQoxEnjdX
WVRpyykjn5oDkMXXgpB/7b9VDReDwtb2aFqXuJYQySol8j9iITeMV73NgQKBgFwM
nZ67H3MTy4lna02GAHWVzLPRCS7nu0um6/lmFcEJOJdY5vBaUXjJzeMOUOI8Yosl
Tc1gA6gYfGdSgTzyOOM7wGv8QPZOqZEws9IrA0qG62qm191cWyWn0tCmj5KBeruh
kjkl4t+0CyAiUzvSu+7oPSKr3tCrhyfcvcQyXpcZAoGACi2Jg7HZtTzZQiCsqRJl
TJGf4nPh0o8/nZOJs3YA+i/GXIQLeVBfNp//nsCiwGqGuJGlX5fGFskcrCExZpi4
kcpi6BsKfUAzAGvGQl6TM1kyhOraqFHC9tkBu12eFrrrV2qsHWIhcJEWFhhfbg3K
ffCbJMhQPci4rJzMXmJWawU=
-----END PRIVATE KEY-----`

function makeJWT() {
  const now = Math.floor(Date.now() / 1000)
  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({
    iss: CLIENT_ID,
    sub: SERVICE_ACCOUNT,
    iat: now,
    exp: now + 3600,
  })).toString('base64url')
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(`${header}.${payload}`)
  const sig = sign.sign(PRIVATE_KEY, 'base64url')
  return `${header}.${payload}.${sig}`
}

async function getAccessToken() {
  const jwt = makeJWT()
  console.log('JWT created, length:', jwt.length)
  const body = new URLSearchParams({
    assertion:      jwt,
    grant_type:     'urn:ietf:params:oauth:grant-type:jwt-bearer',
    client_id:      CLIENT_ID,
    client_secret:  CLIENT_SECRET,
    scope:          'bot',
  })
  console.log('Requesting token...')
  const res = await fetch('https://auth.worksmobile.com/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  const text = await res.text()
  console.log('Auth response status:', res.status, 'body:', text.substring(0, 500))
  let data
  try {
    data = JSON.parse(text)
  } catch (e) {
    throw new Error(`Auth response not JSON (status ${res.status}): ${text.substring(0, 300)}`)
  }
  if (!data.access_token) throw new Error(`Token error: ${JSON.stringify(data)}`)
  return data.access_token
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { message } = req.body
  if (!message) return res.status(400).json({ error: 'message required' })
  try {
    const token = await getAccessToken()
    console.log('Got token, sending message...')
    const r = await fetch(`https://www.worksapis.com/v1.0/bots/${BOT_ID}/channels/${CHANNEL_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: { type: 'text', text: message } }),
    })
    const rText = await r.text()
    console.log('Message response status:', r.status, 'body:', rText.substring(0, 500))
    let result
    try {
      result = JSON.parse(rText)
    } catch (e) {
      if (r.ok && rText === '') {
        return res.status(200).json({ ok: true })
      }
      throw new Error(`Message API not JSON (status ${r.status}): ${rText.substring(0, 300)}`)
    }
    if (!r.ok) throw new Error(JSON.stringify(result))
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('LINE WORKS error:', e)
    return res.status(500).json({ error: e.message })
  }
}
