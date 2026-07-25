#!/usr/bin/env node

import { randomBytes } from 'node:crypto'

function makeSecret(bytes = 24) {
  return randomBytes(bytes).toString('base64url')
}

const token = makeSecret(32)
const code = makeSecret(12)

console.log('\nPrivate tracking bootstrap values generated.\n')
console.log('ADMIN_TOKEN=')
console.log(token)
console.log('\nADMIN_CODE=')
console.log(code)

console.log('\nNext commands (run from project root):\n')
console.log('1) npm run tracking:worker:login')
console.log('2) npm run tracking:worker:d1:create')
console.log('3) Update tracking-worker/wrangler.toml with returned database_id and your real ALLOWED_ORIGIN')
console.log('4) npm run tracking:worker:d1:migrate')
console.log('5) npm run tracking:worker:secret:token   (paste ADMIN_TOKEN when prompted)')
console.log('6) npm run tracking:worker:secret:code    (paste ADMIN_CODE when prompted)')
console.log('7) npm run tracking:worker:deploy')

console.log('\nAfter deploy, set frontend env vars in Vercel:')
console.log('VITE_TRACKING_ENDPOINT=https://<your-worker>.workers.dev')
console.log('VITE_TRACKING_SITE_KEY=portfolio-main')

console.log('\nThen set local terminal env vars for private queries:')
console.log('TRACKING_ADMIN_URL=https://<your-worker>.workers.dev')
console.log('TRACKING_ADMIN_TOKEN=<ADMIN_TOKEN>')
console.log('TRACKING_ADMIN_CODE=<ADMIN_CODE>')

console.log('\nFinally test:')
console.log('npm run tracking:summary -- --days=7')
console.log('npm run tracking:candidates -- --days=14 --limit=25\n')
