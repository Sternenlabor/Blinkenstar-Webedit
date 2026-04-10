import { List } from 'immutable'
import { range } from 'lodash'
import { MAX_ANIMATION_FRAMES } from '../../variables'
import type { Animation } from 'Reducer'

export const EMPTY_FRAME_DATA: List<number> = List(range(8).map(() => 0x00))

export function setAnimationName(animation: Animation, name: string): Animation {
    return {
        ...animation,
        name: name.substring(0, 200)
    }
}

export function setAnimationSpeed(animation: Animation, speed: number): Animation {
    return {
        ...animation,
        speed
    }
}

export function setAnimationDelay(animation: Animation, delay: number): Animation {
    return {
        ...animation,
        delay
    }
}

export function setAnimationRepeat(animation: Animation, repeat: number): Animation {
    return {
        ...animation,
        repeat
    }
}

export function nextFrame(animation: Animation): Animation {
    const currentAnimation = animation.animation

    if (currentAnimation.currentFrame + 1 >= MAX_ANIMATION_FRAMES - 1) {
        return animation
    }

    let nextData = currentAnimation.data
    let nextFrames = currentAnimation.frames
    let nextLength = currentAnimation.length

    if (currentAnimation.currentFrame + 1 >= currentAnimation.frames) {
        nextData = currentAnimation.data.concat(EMPTY_FRAME_DATA)
        nextFrames += 1
        nextLength += 1
    }

    return {
        ...animation,
        animation: {
            ...currentAnimation,
            data: nextData,
            currentFrame: currentAnimation.currentFrame + 1,
            frames: nextFrames,
            length: nextLength
        }
    }
}

export function previousFrame(animation: Animation): Animation {
    if (animation.animation.currentFrame === 0) {
        return animation
    }

    return {
        ...animation,
        animation: {
            ...animation.animation,
            currentFrame: animation.animation.currentFrame - 1
        }
    }
}

export function deleteFrame(animation: Animation): Animation {
    const currentAnimation = animation.animation
    const { currentFrame, data, frames, length } = currentAnimation

    if (currentFrame === 0 && frames === 1) {
        return {
            ...animation,
            animation: {
                ...currentAnimation,
                data: EMPTY_FRAME_DATA
            }
        }
    }

    const start = 8 * currentFrame
    const nextData = data.slice(0, start).concat(data.slice(start + 8))

    return {
        ...animation,
        animation: {
            ...currentAnimation,
            data: nextData,
            currentFrame: currentFrame === 0 ? 0 : currentFrame - 1,
            frames: frames - 1,
            length: length - 1
        }
    }
}

export function copyFrame(animation: Animation): Animation {
    const currentAnimation = animation.animation
    const { currentFrame, data, frames, length } = currentAnimation

    if (currentFrame + 1 >= MAX_ANIMATION_FRAMES - 1) {
        return animation
    }

    const start = 8 * currentFrame
    const frameData = data.slice(start, start + 8)
    const nextData = data.slice(0, start + 8).concat(frameData, data.slice(start + 8))

    return {
        ...animation,
        animation: {
            ...currentAnimation,
            data: nextData,
            currentFrame: currentFrame + 1,
            frames: frames + 1,
            length: length + 1
        }
    }
}

export function getPixelState(animation: Animation, row: number, column: number): boolean {
    const index = 8 * animation.animation.currentFrame + column
    const value = animation.animation.data.get(index)
    const mask = 1 << (7 - row)
    return Boolean(value & mask)
}

export function setPixelState(animation: Animation, row: number, column: number, isOn: boolean): Animation {
    const currentAnimation = animation.animation
    const index = 8 * currentAnimation.currentFrame + column
    const mask = 1 << (7 - row)

    let nextColumn = currentAnimation.data.get(index)
    if (isOn) {
        nextColumn |= mask
    } else {
        nextColumn &= ~mask
    }

    return {
        ...animation,
        animation: {
            ...currentAnimation,
            data: currentAnimation.data.set(index, nextColumn)
        }
    }
}
