/* @flow */
const { List } = require('immutable')

const DEFAULT_SPEED = 13
const DEFAULT_DELAY = 0
const DEFAULT_REPEAT = 0
const DEFAULT_DIRECTION = 0

function toFiniteNumber(value, fallback) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value)
        if (Number.isFinite(parsed)) {
            return parsed
        }
    }

    return fallback
}

function normalizeAnimationData(data) {
    if (List.isList(data)) {
        return data
    }

    if (Array.isArray(data)) {
        return List(data)
    }

    return List()
}

function normalizeAnimation(animation) {
    if (!animation || typeof animation !== 'object') {
        return animation
    }

    const normalized = {
        ...animation,
        speed: toFiniteNumber(animation.speed, DEFAULT_SPEED),
        delay: toFiniteNumber(animation.delay, DEFAULT_DELAY),
        repeat: toFiniteNumber(animation.repeat, DEFAULT_REPEAT),
        direction: toFiniteNumber(animation.direction, DEFAULT_DIRECTION)
    }

    if (animation.animation && typeof animation.animation === 'object') {
        normalized.animation = {
            ...animation.animation,
            data: normalizeAnimationData(animation.animation.data)
        }
    }

    return normalized
}

module.exports = {
    normalizeAnimation
}
