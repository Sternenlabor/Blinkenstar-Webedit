const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const animationInMenuSource = fs.readFileSync(path.join(__dirname, 'src', 'Components', 'AnimationInMenu.tsx'), 'utf8')
const menuSource = fs.readFileSync(path.join(__dirname, 'src', 'Components', 'Menu.tsx'), 'utf8')
const en = require('./src/i18n/en.json')
const de = require('./src/i18n/de.json')

test('animation menu keeps drag and delete controls as separate labelled actions', () => {
    assert.match(animationInMenuSource, /actions: \{ display: 'flex', alignItems: 'center', gap: 0\.5 \}/)
    assert.match(animationInMenuSource, /deleteLabel: string/)
    assert.match(animationInMenuSource, /aria-label=\{deleteLabel\}/)
    assert.doesNotMatch(animationInMenuSource, /aria-label=\{dragHandleLabel\}[\s\S]*?edge="end"/)
    assert.match(menuSource, /deleteLabel=\{t\('menu\.delete_animation', \{ name: animation\.name \|\| animation\.text \|\| t\('animation\.animation'\) \}\)\}/)
    assert.equal(en.menu.delete_animation, 'Delete {{name}}')
    assert.equal(de.menu.delete_animation, '{{name}} löschen')
})
