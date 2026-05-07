const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const rightMenuSource = fs.readFileSync(path.join(__dirname, 'src', 'Components', 'RightMenu.tsx'), 'utf8')
const en = require('./src/i18n/en.json')
const de = require('./src/i18n/de.json')

test('right menu exposes the Blinkenstar GitHub repository as an external icon button', () => {
    assert.match(rightMenuSource, /@mui\/icons-material\/GitHub/)
    assert.match(rightMenuSource, /https:\/\/github\.com\/Sternenlabor\/Blinkenstar/)
    assert.match(rightMenuSource, /component="a"/)
    assert.match(rightMenuSource, /target="_blank"/)
    assert.match(rightMenuSource, /rel="noreferrer"/)
    assert.match(rightMenuSource, /aria-label={t\('menu\.github'\)}/)
    assert.equal(en.menu.github, 'GitHub repository')
    assert.equal(de.menu.github, 'GitHub-Repository')
})
