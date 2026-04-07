const fs = require('fs')
const path = require('path')

const publicDir = path.resolve(__dirname, '..', 'public')

fs.rmSync(publicDir, { recursive: true, force: true })
