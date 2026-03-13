himport crypto from 'crypto'

const CLIENT_ID      = 'lHR2vHw4Z2B1IpLyXABb'
const CLIENT_SECRET  = 'hpV80_Aj0CY'
const SERVICE_ACCOUNT = 'j3fl4.serviceaccount@works-38283'
const BOT_ID         = '11818155'
const CHANNEL_ID     = '5fb09f65-4ba0-c397-b76f-3bd75e48b288'
const PRIVATE_KEY    = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCud/ZyuPdrucj7
eMH8lYCNfRX3KxQ/3afORqPi7MMS2ZHk4slOH4ev1knVAwu1GpT3WbjQHDYN2+W6
jZgPvnGvO+S/TiA/o72mICua/AjrJbzgxNoRVDg/RCJAVFv0LBazWCvrp2iJzzAg
7jDeHC5y74i9H3dmxY9rdocEYmCkrNDgvOVwo0dEYuG6hZbbZ+PPpuwQTmr9yEEs
ExMKeosabHEnxQSatnFJ7x988GEXl2TAQX9ex6NZYZO2sdZphq401WVee33JJq96
cNoSti35wq/McvEZesMCQRcL3wSi3J4LdKNyfhU8P99jo5ICblICt80y9pvQGFh2
i8oZfXotAgMBAAECggEAHE1yqd6uqIedfony8i4wigNiNlQDN28WQ0S7XlspNBwe
akKOBIHh6Zj6JjeVxR3YT536+Kuy6yGijVZd9iPfXl15eL1MRvahk9sBJ+W97qOT
FeVpOMlwTHcZlVT6C8zBK/vgOBzSvRRiytzJCacJs/R+uqtpm77tyrGSKpho9B2d
5vVuONGsiAoKfF4qmbfffeWzo/TzVhxdPSpiFSqxd3yT1Fef5+j2gYekHDsu1KOh
iVXRSEg3KMFeMovS7iFXb7yOVv4NRrLPhsGAA5vl+os3vcuXrdi+1N/tR2UpZdJJ
bzb1eTkSPIjBLwWffljfNV6Y9tz+n+MwqJcWpsWHIwKBgQDpYteczjOjsP0w2ojZ
+5M3B6VYEDAn23ApA2mQREcN9ZkozzPyBteUtXZpUn2FtbgFTkLqQnKTjPNPlAPZ
HtROP0ANiejFnWPosHJKv5gJkAE1snxMBqqLE4tBNkh9LUi1AtmJZ8yjambb+OAJ
P151xcEhRyItvyR15XydGtwOZwKBgQC/X6sB2/PEI1R8T9UUbgUqbtwPwK3K2ywz
hjtRTUq45HvwZd8k3XXXZy/Lu2MxG/V/YBhO9wue+azclYmto2YQzvjlwMtlVPJQ
28/+8So3R9v7Q0/PuDRWFsjCC5yN0RAeHdixOEY7a/37ZFbZ/pblayofBYkZDomD
YthRLWNuSwKBgQCAxUix/BQB/WW1zt4zZ9uSQWW5cTUgyLLZ7kgQkZui2B/ppGnE
4IGSS41KD3myjNE8HDJPjtopD1wwTDrTUW9SvRNaZP1KC81UVga5t3zrycjhF9n9
GLCAjAgJsynL53B2b1wXtG30vICEXo0+jPhRgwtMkTMKiqxTYIuhI3DHgQKBgQCS
s8TEvRcGEUtPrGccrSZam/coQD0513/v04OfVI/mYoi8BWvkt7wBLwHNvM1SNSuh
xEl+JxWKfb1Mr3mGWU8BrZfRkFSbTl4fLBIrTjZdgEGbQMNq6bt9DyRA1GPjtxMS
8zBM0mXMYYGmeAm4PNjx74+vji/FvIYf6OMIf7HMNwKBgQCNZhpYgwFPhuRkNSF/
DUwrAwuvZiU9tUIrouzx/frbwYIsgtRpHr6G9gXnl8gb6G8Gvmw7+Bo+Qkdc/KmJ
7Ty8OspdN8lL4YiMWFW73gO4nfcNiGbOyLwtpdXPi63EInhfs2q7epf/OSqK01Jp
ebx5H0EcVWvke41VH6V3Ob1DRg==
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
  const body = new URLSearchParams({
    assertion:             jwt,
    grant_type:            'urn:ietf:params:oauth:grant-type:jwt-bearer',
    client_id:             CLIENT_ID,
    client_secret:         CLIENT_SECRET,
    scope:                 'bot',
  })
  const res = await fetch('https://auth.worksmobile.com/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(`Token error: ${JSON.stringify(data)}`)
  return data.access_token
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { message } = req.body
  if (!message) return res.status(400).json({ error: 'message required' })

  try {
    const token = await getAccessToken()
    const r = await fetch(`https://www.worksapis.com/v1.0/bots/${BOT_ID}/channels/${CHANNEL_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ content: { type: 'text', text: message } }),
    })
    const result = await r.json()
    if (!r.ok) throw new Error(JSON.stringify(result))
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('LINE WORKS error:', e)
    return res.status(500).json({ error: e.message })
  }
}
