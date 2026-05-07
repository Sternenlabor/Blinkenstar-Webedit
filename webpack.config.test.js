const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const config = require('./webpack.config.js')
const pkg = require('./package.json')

test('copies .htaccess as a root-level file', () => {
    const copyPlugin = config.plugins.find((plugin) => plugin.constructor && plugin.constructor.name === 'CopyPlugin')
    const htaccessPattern = copyPlugin.patterns.find((pattern) => pattern.from === 'src/.htaccess')

    assert.ok(htaccessPattern, 'expected a copy pattern for src/.htaccess')
    assert.equal(htaccessPattern.to, '[name][ext]')
})

test('disables webpack performance hints for generated deployment assets', () => {
    assert.equal(config.performance && config.performance.hints, false)
})

test('cleans the output directory before emitting a new build', () => {
    assert.equal(config.output && config.output.clean, true)
})

test('build script removes stale public output before webpack runs', () => {
    assert.match(pkg.scripts.build, /^node scripts\/clean-public\.js && /)
})

test('FTP deploy never overwrites the server API config', () => {
    const workflow = fs.readFileSync(path.join(__dirname, '.github', 'workflows', 'deploy-ftp.yml'), 'utf8')
    const deployAttempts = workflow.match(/uses: SamKirkland\/FTP-Deploy-Action@v4\.3\.5/g) || []
    const protectedConfigExcludes = workflow.match(/^\s+\*\*\/api\/includes\/config\.php$/gm) || []

    assert.ok(deployAttempts.length > 0, 'expected at least one FTP deploy attempt')
    assert.equal(protectedConfigExcludes.length, deployAttempts.length)
})

test('start script does not use removed webpack-dev-server inline mode', () => {
    assert.doesNotMatch(pkg.scripts.start, /(^|\s)--inline(\s|$)/)
})

test('dev frontend script does not depend on webpack-dashboard', () => {
    assert.ok(pkg.scripts['dev:frontend'], 'expected a dev:frontend script')
    assert.doesNotMatch(pkg.scripts['dev:frontend'], /webpack-dashboard/)
})

test('webpack uses asset modules instead of legacy file and url loaders', () => {
    const rules = config.module && Array.isArray(config.module.rules) ? config.module.rules : []

    assert.ok(rules.some((rule) => rule.test && rule.test.test('.pdf') && rule.type === 'asset/resource'))
    assert.ok(rules.some((rule) => rule.test && rule.test.test('.woff2') && rule.type === 'asset/resource'))
    assert.ok(rules.some((rule) => rule.test && rule.test.test('.png') && rule.type === 'asset'))
    assert.ok(!rules.some((rule) => rule.loader === 'file-loader'))
    assert.ok(!rules.some((rule) => rule.loader === 'url-loader'))
    assert.ok(!rules.some((rule) => rule.loader === 'inline-css-loader'))
})

test('build emits a root favicon for direct browser requests', () => {
    const faviconPath = path.join(__dirname, 'public', 'favicon.ico')

    assert.ok(fs.existsSync(faviconPath), `expected ${faviconPath} to exist after build`)
})
