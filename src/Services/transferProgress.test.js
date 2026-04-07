const test = require('node:test')
const assert = require('node:assert/strict')

const { getPlaybackDurationMs, getTransferProgress } = require('./transferProgress')

test('getPlaybackDurationMs converts samples to milliseconds', () => {
    assert.equal(getPlaybackDurationMs(96000), 2000)
    assert.equal(getPlaybackDurationMs(0), 0)
})

test('getTransferProgress clamps the value into the valid range', () => {
    assert.equal(getTransferProgress(-250, 2000), 0)
    assert.equal(getTransferProgress(1000, 2000), 50)
    assert.equal(getTransferProgress(2500, 2000), 100)
})
