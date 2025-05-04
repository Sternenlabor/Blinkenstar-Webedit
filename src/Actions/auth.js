/* @flow */
import { createAction } from 'redux-actions'
import { Map } from 'immutable'
import { API_URL, fetchRemoteAnimations, saveAnimationsToRemote } from '../db'
import { INITIAL_ANIMATION_TEXT } from '../variables'

/** Log in */
export const login = createAction('LOGIN', async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/login.php`, {
        credentials: 'include', // ← send & receive cookies
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    return data
})

/** Sign up */
export const signup = createAction('LOGIN', async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/signup.php`, {
        credentials: 'include', // ← send & receive cookies
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Signup failed')
    return data
})

export const logout = createAction('LOGOUT', async () => {
    const res = await fetch(`${API_URL}/logout.php`, {
        method: 'POST',
        credentials: 'include'
    })
    if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Logout failed')
    }
    return {}
})

/** Mark user as already‐logged in (session restore) */
export const loggedIn = createAction('LOGIN', async (user: { uid: string, email: string, admin: boolean }) => {
    const res = await fetch(`${API_URL}/user.php?uid=${user.uid}`, {
        credentials: 'include' // ← send & receive cookies
    })
    if (!res.ok) throw new Error('Fetch user info failed')
    const data = await res.json()
    // You might choose to merge or replace user fields based on the fetch result
    return { uid: user.uid, email: user.email, admin: data.admin ?? user.admin }
})

/** Sync localStorage ↔ remote library */
export const syncLibrary = createAction('UPSERT_ANIMATIONS', async (uid: string, localLib: Map<string, Animation>) => {
    // 1) Fetch all from backend
    let remoteArray = await fetchRemoteAnimations(uid)
    // 2) Save remote animations to localStorage
    remoteArray.forEach((anim) => localStorage.setItem(`animation:${anim.id}`, JSON.stringify(anim)))
    // 3) Find unsynced local animations and push them
    const unsynced = localLib.filterNot((a, id) => remoteArray.some((r) => r.id === id)).filterNot((a) => a.text === INITIAL_ANIMATION_TEXT)
    if (unsynced.size) {
        await saveAnimationsToRemote(uid, unsynced)
        // 4) Re-fetch remote to include newly pushed animations
        remoteArray = await fetchRemoteAnimations(uid)
        remoteArray.forEach((anim) => localStorage.setItem(`animation:${anim.id}`, JSON.stringify(anim)))
    }
    return remoteArray
})

/** After a fresh signup, save initial library */
export const signedUp = createAction('LOGIN', (uid: string, localLib: Map<string, Animation>) => {
    const toSave = localLib.filterNot((a) => a.text === INITIAL_ANIMATION_TEXT)
    // fire‐and‐forget
    saveAnimationsToRemote(uid, toSave)
    return { uid, admin: false }
})
