const test = require('node:test')
const assert = require('node:assert/strict')

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

test('start script does not use removed webpack-dev-server inline mode', () => {
    assert.doesNotMatch(pkg.scripts.start, /(^|\s)--inline(\s|$)/)
})
