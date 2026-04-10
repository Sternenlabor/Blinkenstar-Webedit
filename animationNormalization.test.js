const test = require('node:test')
const assert = require('node:assert/strict')
const { List } = require('immutable')

const { normalizeAnimation } = require('./src/animationNormalization')

test('normalizeAnimation coerces slider values from strings into numbers', () => {
    const animation = normalizeAnimation({
        id: 'remote-1',
        type: 'text',
        name: 'Remote',
        text: 'Blink',
        speed: '13',
        delay: '0.5',
        repeat: '2',
        direction: '1',
        animation: {
            data: [1, 0, 1, 0, 1, 0, 1, 0],
            currentFrame: 0,
            frames: 1,
            length: 1
        }
    })

    assert.equal(animation.speed, 13)
    assert.equal(animation.delay, 0.5)
    assert.equal(animation.repeat, 2)
    assert.equal(animation.direction, 1)
    assert.equal(List.isList(animation.animation.data), true)
})

test('normalizeAnimation falls back to safe numeric defaults for malformed slider values', () => {
    const animation = normalizeAnimation({
        id: 'broken-1',
        type: 'pixel',
        name: 'Broken',
        text: '',
        speed: 'fast',
        delay: {},
        repeat: [],
        direction: null,
        animation: {
            data: 'not-an-array',
            currentFrame: 0,
            frames: 1,
            length: 1
        }
    })

    assert.equal(animation.speed, 13)
    assert.equal(animation.delay, 0)
    assert.equal(animation.repeat, 0)
    assert.equal(animation.direction, 0)
    assert.deepEqual(animation.animation.data.toArray(), [])
})
