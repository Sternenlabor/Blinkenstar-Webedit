const test = require('node:test')
const assert = require('node:assert/strict')

const { createFlashAudioContexts } = require('./src/Services/flashAudioContexts')

test('flash audio contexts are created lazily and reused', () => {
    const calls = []
    const createAudioContext = (sampleRate) => {
        const context = { sampleRate, id: calls.length + 1 }
        calls.push(context)
        return context
    }

    const audioContexts = createFlashAudioContexts(createAudioContext, 48000)

    assert.equal(calls.length, 0)

    const transferContext = audioContexts.getTransferAudioContext()
    assert.equal(calls.length, 1)
    assert.equal(transferContext, calls[0])
    assert.equal(audioContexts.getTransferAudioContext(), transferContext)
    assert.equal(calls.length, 1)

    const silenceContext = audioContexts.getSilenceAudioContext()
    assert.equal(calls.length, 2)
    assert.equal(silenceContext, calls[1])
    assert.equal(audioContexts.getSilenceAudioContext(), silenceContext)
    assert.equal(calls.length, 2)
})
