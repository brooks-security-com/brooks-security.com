/**
 * Lambda@Edge — grc-tools Auth Gate
 *
 * Viewer-request trigger on /grc-tools/* paths.
 * Federation-only: users authenticate via Google or Microsoft through Cognito.
 *
 * Configuration injected at deploy time via Terraform templatefile().
 * JavaScript template literals use $${ } to escape Terraform's $${ } syntax.
 */

const crypto = require('crypto');
const https = require('https');

const COGNITO_DOMAIN = '${COGNITO_DOMAIN}';
const CLIENT_ID = '${CLIENT_ID}';
const REDIRECT_URI = '${REDIRECT_URI}';
const USER_POOL_ID = '${USER_POOL_ID}';
const REGION = 'us-east-1';
const COOKIE_NAME = 'grc_session';
const COOKIE_MAX_AGE = 86400; // 24 hours

let cachedJwks = null;
let jwksCacheTime = 0;
const JWKS_CACHE_MS = 3600000;

function getJwksUri() {
  return `https://cognito-idp.$${REGION}.amazonaws.com/$${USER_POOL_ID}/.well-known/jwks.json`;
}

async function fetchJwks() {
  const now = Date.now();
  if (cachedJwks && (now - jwksCacheTime) < JWKS_CACHE_MS) {
    return cachedJwks;
  }
  return new Promise((resolve, reject) => {
    const url = new URL(getJwksUri());
    const req = https.get({
      hostname: url.hostname,
      path: url.pathname,
      timeout: 3000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        cachedJwks = JSON.parse(data);
        jwksCacheTime = now;
        resolve(cachedJwks);
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('JWKS timeout')); });
  });
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

function parseJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    return {
      header: JSON.parse(base64UrlDecode(parts[0])),
      payload: JSON.parse(base64UrlDecode(parts[1])),
      signature: parts[2],
    };
  } catch (e) {
    return null;
  }
}

function verifyJwt(token, jwks) {
  const jwt = parseJwt(token);
  if (!jwt) return null;

  const now = Math.floor(Date.now() / 1000);
  if (jwt.payload.exp && jwt.payload.exp < now) return null;
  if (jwt.payload.aud !== CLIENT_ID && jwt.payload.client_id !== CLIENT_ID) return null;

  const issuer = `https://cognito-idp.$${REGION}.amazonaws.com/$${USER_POOL_ID}`;
  if (jwt.payload.iss !== issuer) return null;

  const key = jwks.keys.find(k => k.kid === jwt.header.kid);
  if (!key) return null;

  try {
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(token.split('.')[0] + '.' + token.split('.')[1]);
    return jwt.payload;
  } catch (e) {
    return null;
  }
}

async function exchangeCodeForTokens(code) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code: code,
      redirect_uri: REDIRECT_URI,
    }).toString();

    const hostname = COGNITO_DOMAIN;
    const req = https.request({
      hostname: hostname,
      path: '/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 5000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Token exchange failed: $${res.statusCode}`));
          return;
        }
        resolve(JSON.parse(data));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function redirectResponse(url) {
  return {
    status: '302',
    statusDescription: 'Found',
    headers: {
      'location': [{ key: 'Location', value: url }],
    },
  };
}

exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;
  const uri = request.uri;
  const querystring = request.querystring || '';

  const qs = new URLSearchParams(querystring);
  const code = qs.get('code');

  if (code) {
    try {
      const tokens = await exchangeCodeForTokens(code);
      const jwt = parseJwt(tokens.id_token);
      if (!jwt) return redirectResponse(REDIRECT_URI);

      const cookieValue = [
        `$${COOKIE_NAME}=$${tokens.access_token}`,
        'Path=/grc-tools',
        `Max-Age=$${COOKIE_MAX_AGE}`,
        'HttpOnly',
        'Secure',
        'SameSite=Lax',
      ].join('; ');

      const host = headers.host ? headers.host[0].value : '';
      const cleanUrl = `https://$${host}$${uri}`;
      return {
        status: '302',
        statusDescription: 'Found',
        headers: {
          'location': [{ key: 'Location', value: cleanUrl }],
          'set-cookie': [{ key: 'Set-Cookie', value: cookieValue }],
        },
      };
    } catch (e) {
      console.error('Token exchange error:', e.message);
      const loginUrl = `https://$${COGNITO_DOMAIN}/oauth2/authorize?client_id=$${CLIENT_ID}&response_type=code&redirect_uri=$${encodeURIComponent(REDIRECT_URI)}`;
      return redirectResponse(loginUrl);
    }
  }

  const cookies = headers.cookie || [];
  let sessionToken = null;
  for (const cookie of cookies) {
    const match = cookie.value.match(new RegExp(`$${COOKIE_NAME}=([^;]+)`));
    if (match) {
      sessionToken = match[1];
      break;
    }
  }

  if (sessionToken) {
    try {
      const jwks = await fetchJwks();
      const payload = verifyJwt(sessionToken, jwks);
      if (payload) {
        // CloudFront only allows one viewer-request trigger per behavior.
        // This Lambda handles both auth AND URL rewriting (/ -> /index.html).
        if (request.uri.endsWith('/')) {
          request.uri = request.uri + 'index.html';
        }
        return request;
      }
    } catch (e) {
      console.error('JWT verification error:', e.message);
    }
  }

  const loginUrl = `https://$${COGNITO_DOMAIN}/oauth2/authorize?client_id=$${CLIENT_ID}&response_type=code&redirect_uri=$${encodeURIComponent(REDIRECT_URI)}`;
  return redirectResponse(loginUrl);
};
