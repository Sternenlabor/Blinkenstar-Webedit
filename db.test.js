const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

function loadDbModule() {
    const outDir = fs.mkdtempSync(path.join(__dirname, '.tmp-blinken-db-'))
    const outFile = path.join(outDir, 'db.cjs')
    const helperFile = path.join(outDir, 'animationNormalization.js')

    execFileSync('npx', ['babel', 'src/db.ts', '--out-file', outFile, '--presets', '@babel/preset-env,@babel/preset-typescript'], {
        cwd: __dirname
    })
    fs.copyFileSync(path.join(__dirname, 'src/animationNormalization.js'), helperFile)

    const moduleExports = require(outFile)
    fs.rmSync(outDir, { recursive: true, force: true })

    return moduleExports
}

test('fetchPublicGallery returns an empty array when the gallery API is unreachable', async () => {
    const originalFetch = global.fetch
    const originalApiUrl = process.env.API_URL
    const originalConsoleError = console.error

    process.env.API_URL = 'http://localhost:8000'
    global.fetch = async () => {
        throw new TypeError('Failed to fetch')
    }
    console.error = () => {}

    try {
        const { fetchPublicGallery } = loadDbModule()
        const result = await fetchPublicGallery().catch((error) => error)

        assert.deepEqual(result, [])
    } finally {
        global.fetch = originalFetch

        if (originalApiUrl === undefined) {
            delete process.env.API_URL
        } else {
            process.env.API_URL = originalApiUrl
        }

        console.error = originalConsoleError
    }
})
