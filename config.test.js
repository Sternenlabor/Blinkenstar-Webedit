const test = require('node:test')
const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')

function evalPhp(code) {
    return execFileSync('php', ['-r', code], {
        cwd: __dirname
    })
        .toString()
        .trim()
}

test('PHP API allows localhost origins on alternate dev ports', () => {
    const output = evalPhp("require 'src/api/includes/config.php'; echo function_exists('is_allowed_origin') && is_allowed_origin('http://localhost:8082') ? 'true' : 'false';")

    assert.equal(output, 'true')
})

test('PHP API rejects non-local origins', () => {
    const output = evalPhp("require 'src/api/includes/config.php'; echo function_exists('is_allowed_origin') && is_allowed_origin('https://example.com') ? 'true' : 'false';")

    assert.equal(output, 'false')
})
