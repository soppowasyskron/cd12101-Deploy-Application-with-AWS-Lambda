import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'
import axios from "axios";

const logger = createLogger('auth')

const authJsonWebKeySetUrl = `https://dev-32l0d3p58tkl25zu.us.auth0.com/.well-known/jwks.json`

const auth0Cert = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJTluu5EJE880EMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi0wanA3cDVpN3h2ZHB4ejNnLnVzLmF1dGgwLmNvbTAeFw0yNDEyMTEx
MjQyNDVaFw0zODA4MjAxMjQyNDVaMCwxKjAoBgNVBAMTIWRldi0wanA3cDVpN3h2
ZHB4ejNnLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAN8qEeI1WWnoAavIo8HiNejcN9SE1pPg3hlXnvNTxvZaYoddXdS7prDnzHAz
ZDq1ErQs21pU72nAai2WqgHXKGiZyYYT4WT4mykMOJB6TLQ33SMOGb/gB0+WQLEq
Uqhzfto/a2JaHD3Ui0omrCiVeBa983bbXnXbFQPhQZUFnkTkgUzb5Vr6S1GP0m+g
qIIuqwh6hlxNa/4ZSZTYpbj1nIO+QX0U/xEyQ7N/dPTggs866pPGivdKRZc6Y7Ia
05ZfHovBazyql7ea+ujvOhLo893J6bUy8t74HpnxqUAZL3vtWxmCZgu+7PQaG+vQ
Moy5DHvBiLAVDiM0nhxjkqdbor8CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUHw4qVJcPCNK35eiiq2/ihpUF43MwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQAs/c7zMYHPAd/SA9uA6z4ybXkNs45uPK+Qxq4TXlQM
4LUbKwLUMi2VsCvjFMLHwmPTK2WcF7gjyWnd9JqauCHs/9OTrlDfh6xGfFfriP55
1b1mHLHwkUcUjLbDAtq7JJSRO9jj6gkoBEAod1eKI7GbM4HFSBQCUfndBMz0uhfC
YV8SHRKqHF54cT0yCgLjSa8Kj+yHQL9jRGrZLhEoJHV2cxITbG5eDw6dxnwPUXQV
v+VPrVim0PyDHrFPZLfOdH3JNfMocZohuVJ5qa5R+yekRbefitcXZtA6oGkwTEfO
fgdWdvYb20nC7/9PvjMBq4aOBnG8GvCBtvslz2jbwoKj
-----END CERTIFICATE-----`

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    logger.info('User authorized')

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })

  try {
    const res = await axios.get(authJsonWebKeySetUrl)
    const key = res?.data?.keys?.find((k) => k.kid === jwt.header.kid)
    if (!key) {
        logger.error('Key not found in JWKS', { kid: jwt.header.kid })
      throw new Error('Key not found')
    }
    const pem = key.x5c[0]
    const cert = `-----BEGIN CERTIFICATE-----\n${pem}\n-----END CERTIFICATE-----`
    return jsonwebtoken.verify(token, cert)
  } catch (error) {
    logger.error('Token verification failed', { error })
  }
  return undefined;
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
