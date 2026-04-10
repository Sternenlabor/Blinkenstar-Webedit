const test = require('node:test')
const assert = require('node:assert/strict')

test('editor spacing keeps fields and rows compact across editors', () => {
    const editorSpacing = require('./src/Components/editor/editorSpacing')

    assert.equal(editorSpacing.fieldSx.width, 256)
    assert.equal(editorSpacing.fieldSx.mb, 1)
    assert.equal(editorSpacing.sliderRowSx.mb, 1.25)
    assert.equal(editorSpacing.toggleRowSx.mt, 1)
})
