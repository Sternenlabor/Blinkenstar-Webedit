// @flow
import { handleActions } from 'redux-actions'
import { Map, List } from 'immutable'

export type Animation = {
    id: string,
    delay?: number,
    repeat?: number,
    direction?: 0 | 1,
    name: string,
    speed?: number,
    text: string,
    creationDate: number,
    type: 'text' | 'pixel',
    animation: {
        length: number,
        currentFrame: number,
        frames: number,
        data: List<number>
    },
    author?: string,
    reviewedAt?: number,
    modifiedAt?: number,
    originalId?: string
}

export type State = {
    uid: string,
    email: string,
    admin: boolean,
    animations: Map<string, Animation>,
    gallery: Map<string, Animation>,
    adminGallery: Map<string, Animation>
}

// Previously animations where stored in one, big localStore value which was
// updated for each edit. (incl de-/serialization of the entire data-structure).
// The new model saves each animation as its own entry, using a key-prefix.
// Since old users migth still have animations in their localStore using the old
// format, we're migrating them here so nothing gets lost.
const legacyAnimations = localStorage.getItem('animations')
if (legacyAnimations) {
    try {
        Map(JSON.parse(legacyAnimations)).map((animation) => {
            localStorage.setItem(`animation:${animation.id}`, JSON.stringify(animation))
        })
        localStorage.removeItem('animations')
    } catch (e) {
        console.log('error migrating old animations:', e)
    }
}

const initialAnimations = Object.keys(localStorage).reduce((animations, key) => {
    if (!key.startsWith('animation:')) {
        return animations
    }
    try {
        const tmp = JSON.parse(localStorage[key])
        tmp.animation.data = List(tmp.animation.data)
        return animations.set(key.slice(10, key.length), tmp)
    } catch (e) {
        return animations
    }
}, Map())

const initialState: State = {
    uid: '',
    email: '',
    admin: false,
    animations: initialAnimations,
    gallery: Map(),
    adminGallery: Map()
}

export default handleActions(
    {
        // Local Library
        ADD_ANIMATION: (state: State, { payload }) => {
            const animations = state.animations.set(payload.id, payload)

            return {
                ...state,
                animations
            }
        },
        UPDATE_ANIMATION: (state: State, { payload }) => {
            const animations = state.animations.set(payload.id, payload)

            return {
                ...state,
                animations
            }
        },
        UPSERT_ANIMATIONS: (state: State, { payload }) => {
            let animations = state.animations
            payload.map((animation) => {
                animations = animations.set(animation.id, animation)
            })

            return {
                ...state,
                animations
            }
        },
        REMOVE_ANIMATION: (state: State, { payload }) => {
            if (!state.animations.has(payload)) {
                return state
            }
            const animations = state.animations.remove(payload)

            return {
                ...state,
                animations
            }
        },

        // Public Gallery
        UPSERT_GALLERY_ANIMATIONS: (state: State, { payload }) => {
            let gallery = state.gallery
            payload.map((animation) => {
                gallery = gallery.set(animation.id, animation)
            })

            return {
                ...state,
                gallery
            }
        },
        REMOVE_GALLERY_ANIMATION: (state: State, { payload }) => {
            if (!state.gallery.has(payload)) {
                return state
            }
            const gallery = state.gallery.remove(payload)

            return {
                ...state,
                gallery
            }
        },
        RESET_GALLERY: (state: State) => {
            return {
                ...state,
                gallery: new Map()
            }
        },

        // Admin Gallery
        UPSERT_ADMIN_GALLERY_ANIMATIONS: (state: State, { payload }) => {
            let gallery = state.adminGallery
            // Only iterate if payload is a proper array
            if (Array.isArray(payload)) {
                payload.forEach((animation) => {
                    gallery = gallery.set(animation.id, animation)
                })
            } else {
                console.warn('UPSERT_ADMIN_GALLERY_ANIMATIONS: expected array but got', payload)
                // Optionally, handle non-array payloads (e.g. skip or reset)
            }
            return {
                ...state,
                adminGallery: gallery
            }
        },

        // Authentication
        LOGIN: (state: State, { payload }) => ({
            ...state,
            uid: payload.uid,
            email: payload.email,
            admin: payload.admin
        }),

        LOGOUT: () => {
            localStorage.clear()
            return {
                uid: '',
                email: '',
                admin: false,
                animations: new Map(),
                gallery: new Map(),
                adminGallery: new Map()
            }
        },

        RESET: () => {
            localStorage.clear()
            return {
                uid: '',
                email: '',
                admin: false,
                animations: new Map(),
                gallery: new Map(),
                adminGallery: new Map()
            }
        }
    },
    initialState
)
