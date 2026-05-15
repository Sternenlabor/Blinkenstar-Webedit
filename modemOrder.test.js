const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const { Map, List } = require('immutable')

function loadModemModule() {
    const outDir = fs.mkdtempSync(path.join(__dirname, '.tmp-blinken-modem-order-'))
    const serviceDir = path.join(outDir, 'src', 'Services')
    const outFile = path.join(serviceDir, 'modem.cjs')
    const orderFile = path.join(outDir, 'src', 'animationOrder.js')

    fs.mkdirSync(serviceDir, { recursive: true })
    execFileSync('npx', ['babel', 'src/Services/modem.ts', '--out-file', outFile, '--presets', '@babel/preset-env,@babel/preset-typescript'], {
        cwd: __dirname
    })
    execFileSync('npx', ['babel', 'src/animationOrder.ts', '--out-file', orderFile, '--presets', '@babel/preset-env,@babel/preset-typescript'], {
        cwd: __dirname
    })

    const moduleExports = require(outFile)
    fs.rmSync(outDir, { recursive: true, force: true })

    return moduleExports.default
}

function textAnimation(id, text, sortOrder) {
    return {
        id,
        name: text,
        text,
        sortOrder,
        type: 'text',
        creationDate: 1,
        speed: 13,
        delay: 0,
        repeat: 0,
        direction: 0,
        animation: {
            data: List([0, 0, 0, 0, 0, 0, 0, 0]),
            currentFrame: 0,
            frames: 1,
            length: 1
        }
    }
}

test('modem transfer data follows explicit animation sortOrder', () => {
    const Modem = loadModemModule()
    const originalConsoleLog = console.log
    console.log = () => {}

    try {
        const modem = new Modem(
            Map([
                ['b', textAnimation('b', 'B', 1)],
                ['a', textAnimation('a', 'A', 2)],
                ['c', textAnimation('c', 'C', 0)]
            ])
        )

        const bytePositions = ['C', 'B', 'A'].map((label) => modem.data.indexOf(label.charCodeAt(0)))

        assert.deepEqual(
            bytePositions,
            bytePositions.slice().sort((left, right) => left - right)
        )
    } finally {
        console.log = originalConsoleLog
    }
})
