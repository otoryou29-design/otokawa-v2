const crypto = require('crypto')

const CLIENT_ID      = 'lHR2vHw4Z2B1IpLyXABb'
const CLIENT_SECRET  = 'pV80_Aj0CY'
const SERVICE_ACCOUNT = 'j3fl4.serviceaccount@works-38283'
const BOT_ID          = '11818155'
const CHANNEL_ID      = '5fb09f65-4ba0-c397-b76f-3bd75e48b288'
const PRIVATE_KEY     = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCud/ZyuPdrucj7
eMH8lYCNfRX3KxQ/3afORqPi7MMS2ZHk4slOH4ev1knVAwu1GpT3WbjQHDYN24W6
jZgPvnGvO+S/TiA/o72mICua/AjrJbzgxNoRVDg/RCJAVFv0LBazWCvrp2iJzzAg
7jDeHC5y74i9H3dmxY9rdocEYmCkrNDgvOVWo0dEYuG6hZbbZ+PPpuwQTmr9yEEs
ExMKeosabHEnxQSatnFJ7x988GExl2TAQX9ex6NZYZO2sdZphq401WVee33JJq96
cNoSti35wq/McvEZesMCQRcL3wSi3J4LdkNyfhu8P99jo5ICblICt80y9pvQGFh2
i8OzfXotAgMBAAECggEAHE1yqd6uqIedfony8i4wigNiNlQDN28WQoS7XlspNBwe
akKOBIHh6Zj6JjeVxR3YT5364Kuy6yGijVZd9iPfxl15eL1MRvahk9sBJ4W97qOT
CXuJg/w+klCQN63YKFpzxkeEEaAUnVF7tHijMHIJ+jFJr8YhSFGDlAOy/8dMRjOK
6HxlLNc1IEpyqfOv0h3s99OKVdFGRiU+G5AlbsJYBhVpGzMcF2GAyRF3bCJdaTXP
nXG/RVMMdv6yFpEJMhKxoOf5BKPWBIG1NMaYap2GJAK0w2bJEmcPHuJhJfMhdv7r
D/VfDjVMhQsMrhX9WdRd/Iqeek/LkYSoyafNzKbdgQKBgQDYo36R/F0YjOmKJhnY
vJqHTWJCAKHVHfOi1CESMvUkp5tAzGwpNMlPOFjQ/CXEowmAqVIEfdh6qaiHKqX5
u7IN65Jft7uS0ddqrJGifqfOJCDFVINQi3XB3KyzANGOnN2AJZSvT7I5aBQbMFc7
L1M+gS0t/lNzdqI2JZsaWwpLkQKBgQDO1sXFO9WDCPQ4JNSSVr7LvRtsAZ1bCD8j
pkDuFJiJHpahLCwMb7okR+HEzklj3pASVGQb9RBf+xd6RGetFjKIsNmetrUDVK1g
y/pGxSJb2H7MIEzf7IOKY6RyfkMCPaOEabkOG/wXj/4FHWLIQSXZ2T4Ttb7Wuhl
OVTkdh6JzQKBgQC2jOgaXMPWrWv7jTJnbfD0JQYeIAR4GFaDJB9sNW07VJFHpgZn
F+FMsqH2VhpUH3bHnszq/D2i9Tcf/wPfHe0P3fdhycHOq5S4ht/eQ3vkUCFyOwr
VLSA/1vP1bGWNihJGQMN5u2pqNxb6HVk6g7BtorWr5djZPFCbLWU7yt34QKBgQCm
Z3VbUGAJT3LPxXP0t7NFYS0Q0L3Fw2s3ILdZxEg7GlpdvMcV4SJYGkfLYDcUs/D7
qVHPfgWuvwS1MiPKX7+aGLqFzlanOKfMwS8iDNiY6TKzmxGr9oZKsIjOiCAMasSz
k1X+C0J04I2z+VQ9u8e+4G4pWmyDSzWYbxVD85anEQKBgQCl6oTrB/xfKS05APCJ
rOLrJUfXJrlVGGHWwssHWuhsNQnRrmfbv+CnJ2UZ2sDKA3kUYBbCuiQrvJcN4X5p
INIJV/bVN3/cT/0hMP2Oae41CGrzHt9XRYG23Fj85ol/eLsYKfVWmplXdlE4B08K
LnKL+RAkQElOGTm/BfsAj+IwJQ==
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
