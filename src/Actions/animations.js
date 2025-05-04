/* @flow */
import { createAction } from 'redux-actions'
import { List, Map } from 'immutable'
import { range } from 'lodash'
import UUID from 'uuid-js'
import type { Animation } from 'Reducer'
import { saveAnimationsToRemote, removeAnimationRemote } from '../db'

const EMPTY_DATA = List(range(8).map(() => 0x00))

/** Create a new animation object (not an action creator) */
export const newAnimation = (type: string, defaultText?: string) => ({
    delay: 0,
    repeat: 0,
    direction: 0,
    id: UUID.create().toString(),
    name: '',
    speed: 13,
    creationDate: Math.floor(Date.now() / 1000),
    type,
    text: defaultText,
    animation: { data: EMPTY_DATA, currentFrame: 0, frames: 1, length: 1 }
})

/** Load all animations from localStorage into the library */
export const loadAnimations = createAction('UPSERT_ANIMATIONS', async () => {
    let animationsMap = Map()
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('animation:')) {
            const item = localStorage.getItem(key)
            if (item) {
                try {
                    const anim: Animation = JSON.parse(item)
                    animationsMap = animationsMap.set(anim.id, anim)
                } catch (e) {
                    console.warn('Failed to parse animation from storage', key, e)
                }
            }
        }
    }
    return animationsMap
})

/** Add a new animation (and persist to PHP if logged in) */
export const addAnimation = createAction('ADD_ANIMATION', async (animation: Animation, uid: string) => {
    // Persist to localStorage with key prefix "animation:"
    localStorage.setItem(`animation:${animation.id}`, JSON.stringify(animation))
    // If user is logged in (has uid), also push to backend
    if (uid) {
        await saveAnimationsToRemote(uid, Map({ [animation.id]: animation }))
    }
    return animation
})

/** Update an existing animation (and persist) */
export const updateAnimation = createAction('UPDATE_ANIMATION', async (animation: Animation, uid: string) => {
    const updated = { ...animation, modifiedAt: Date.now() }
    localStorage.setItem(`animation:${updated.id}`, JSON.stringify(updated))
    if (uid) {
        await saveAnimationsToRemote(uid, Map({ [updated.id]: updated }))
    }
    return updated
})

/** Remove an animation (local + remote) */
export const removeAnimation = createAction('REMOVE_ANIMATION', async (animationId: string, uid: string) => {
    localStorage.removeItem(`animation:${animationId}`)
    if (uid) {
        await removeAnimationRemote(uid, animationId)
    }
    return animationId
})

export const reset = createAction('RESET')
