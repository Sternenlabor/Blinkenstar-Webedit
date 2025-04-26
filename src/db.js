/* @flow */
import { List, Map } from 'immutable'
import type { Animation } from 'Reducer'

/**
 * Base URL of your LAMP API
 */
export const API_URL = process.env.API_URL || 'http://localhost:8000'

/**
 * Convert a raw JSON doc from your PHP endpoints
 * into our local Redux Animation shape.
 */
export function mapAnimationToLocal(doc: any): Animation {
    const frames = doc.type === 'pixel' ? doc.columns.length / 8 : 0
    const result: any = {
        id: doc.id,
        name: doc.name,
        type: doc.type,
        text: doc.text,
        delay: doc.delay,
        repeat: doc.repeat,
        direction: doc.direction,
        speed: doc.speed,
        animation: {
            data: List(doc.columns || []),
            currentFrame: 0,
            frames,
            length: frames
        }
    }
    if (doc.originalId) result.originalId = doc.originalId
    if (doc.author) result.author = doc.author
    if (doc.creationDate) result.creationDate = doc.creationDate
    if (doc.reviewedAt) result.reviewedAt = doc.reviewedAt
    if (doc.modifiedAt) result.modifiedAt = doc.modifiedAt
    return result
}

/**
 * Convert our local Animation into the JSON shape
 * your PHP backend expects.
 */
export function mapAnimationToRemote(animation: Animation): any {
    const result: any = {
        id: animation.id,
        name: animation.name,
        type: animation.type,
        text: animation.text || '',
        columns: animation.animation.data.toJS(),
        speed: animation.speed,
        delay: animation.delay,
        repeat: animation.repeat,
        direction: animation.direction,
        creationDate: animation.creationDate
    }
    if (animation.originalId) result.originalId = animation.originalId
    if (animation.author) result.author = animation.author
    if (animation.reviewedAt !== undefined) result.reviewedAt = animation.reviewedAt
    if (animation.modifiedAt) result.modifiedAt = animation.modifiedAt
    return result
}

/**
 * Persist one or more animations via your LAMP API.
 */
export async function saveAnimationsToRemote(uid: string, animationsMap: Map<string, Animation>): Promise<void> {
    const payload = {
        uid,
        animations: animationsMap.valueSeq().toArray().map(mapAnimationToRemote)
    }
    await fetch(`${API_URL}/animations.php`, {
        method: 'POST',
        credentials: 'include', // ensure cookies (including auth) are sent
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
}

/**
 * Delete a single animation from the user’s library.
 */
export async function removeAnimationRemote(uid: string, animationId: string): Promise<void> {
    await fetch(`${API_URL}/animations.php`, {
        method: 'DELETE',
        credentials: 'include', // ensure cookies (including auth) are sent
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, id: animationId })
    })
}

/**
 * Fetch all animations for a given user.
 */
export async function fetchRemoteAnimations(uid: string): Promise<Animation[]> {
    const res = await fetch(`${API_URL}/animations.php?uid=${uid}`, {
        credentials: 'include' // ensure cookies (including auth) are sent
    })
    const data = await res.json()
    return data.map(mapAnimationToLocal)
}

/**
 * Fetch the public gallery
 */
export async function fetchPublicGallery(): Promise<Animation[]> {
    const res = await fetch(`${API_URL}/gallery.php`)
    const data = await res.json()
    return data.map(mapAnimationToLocal)
}

/**
 * Publish/unpublish operations
 */
export async function publishToGallery(animation: Animation): Promise<void> {
    await fetch(`${API_URL}/gallery.php`, {
        credentials: 'include', // ensure cookies (including auth) are sent
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapAnimationToRemote(animation))
    })
}
export async function unpublishFromGallery(id: string): Promise<void> {
    await fetch(`${API_URL}/gallery.php`, {
        credentials: 'include', // ensure cookies (including auth) are sent
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    })
}

/**
 * Admin “review” toggle
 */
export async function reviewAnimationRemote(author: string, id: string, reviewedAt: number | null): Promise<void> {
    await fetch(`${API_URL}/review.php`, {
        credentials: 'include', // ensure cookies (including auth) are sent
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, id, reviewedAt })
    })
}

/**
 * Fetch *all* users’ animations for the Admin view
 */
export async function fetchAdminGalleryRemote(): Promise<Animation[]> {
    const res = await fetch(`${API_URL}/admin-gallery.php`, {
        credentials: 'include' // ensure cookies (including auth) are sent
    })
    if (!res.ok) {
        // Log the error (e.g. status and response text) for visibility during development
        const errorText = await res.text()
        console.error(`Failed to load admin gallery (${res.status} ${res.statusText}): ${errorText}`)
        // Return an empty array so downstream code handles it gracefully
        return []
    }
    const data = await res.json()
    return data.map(mapAnimationToLocal)
}
