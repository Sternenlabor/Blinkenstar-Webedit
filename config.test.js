const test = require('node:test')
const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

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

test('PHP API config allows a local override file for deployment credentials', () => {
    const overridePath = path.join(__dirname, 'src/api/includes/config.local.php')

    fs.writeFileSync(
        overridePath,
        [
            '<?php',
            "define('DB_USER', 'deploy_user');",
            "define('DB_PASS', 'deploy_pass');",
            "define('ALLOWED_ORIGIN', 'https://blinkenstar.sternenlabor.de');"
        ].join('\n')
    )

    try {
        const output = evalPhp("require 'src/api/includes/config.php'; echo DB_USER . '|' . DB_PASS . '|' . ALLOWED_ORIGIN;")

        assert.equal(output, 'deploy_user|deploy_pass|https://blinkenstar.sternenlabor.de')
    } finally {
        fs.rmSync(overridePath, { force: true })
    }
})
