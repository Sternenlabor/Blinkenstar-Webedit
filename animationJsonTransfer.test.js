const test = require('node:test')
const assert = require('node:assert/strict')
const { List } = require('immutable')

const { buildAnimationJsonFileName, parseAnimationJson, serializeAnimationToJson } = require('./src/animationJsonTransfer')

test('serializes animations as readable JSON with frame data arrays', () => {
    const json = serializeAnimationToJson({
        id: 'animation-1',
        name: 'Demo',
        type: 'pixel',
        text: '',
        creationDate: 100,
        animation: {
            data: List([1, 2, 3]),
            currentFrame: 0,
            frames: 1,
            length: 1
        }
    })

    assert.match(json, /\n {4}"id": "animation-1"/)
    assert.deepEqual(JSON.parse(json).animation.data, [1, 2, 3])
})

test('imports JSON animations as normalized copies with fresh ids', () => {
    const imported = parseAnimationJson(
        JSON.stringify({
            id: 'source-id',
            name: 'Imported',
            type: 'pixel',
            text: '',
            speed: '12',
            delay: '0.5',
            repeat: '2',
            direction: '1',
            creationDate: 100,
            author: 'someone',
            reviewedAt: 200,
            modifiedAt: 300,
            animation: {
                data: [1, 0, 1, 0],
                currentFrame: 0,
                frames: 1,
                length: 1
            }
        }),
        () => 'new-id',
        400
    )

    assert.equal(imported.id, 'new-id')
    assert.equal(imported.originalId, 'source-id')
    assert.equal(imported.creationDate, 400)
    assert.equal(imported.author, undefined)
    assert.equal(imported.reviewedAt, undefined)
    assert.equal(imported.modifiedAt, undefined)
    assert.equal(imported.speed, 12)
    assert.equal(imported.delay, 0.5)
    assert.equal(imported.repeat, 2)
    assert.equal(imported.direction, 1)
    assert.equal(List.isList(imported.animation.data), true)
    assert.deepEqual(imported.animation.data.toArray(), [1, 0, 1, 0])
})

test('rejects JSON that is not a single animation', () => {
    assert.throws(() => parseAnimationJson('{"type":"unknown"}', () => 'new-id', 400), /valid Blinkenstar animation/)
    assert.throws(() => parseAnimationJson('[]', () => 'new-id', 400), /valid Blinkenstar animation/)
})

test('builds safe JSON filenames from animation labels', () => {
    assert.equal(buildAnimationJsonFileName({ name: 'Demo/One:Final*', id: 'source-id' }), 'Demo-One-Final.json')
    assert.equal(buildAnimationJsonFileName({ name: '   ', text: '', id: '' }), 'animation.json')
})
