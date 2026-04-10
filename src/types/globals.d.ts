import type { StoreEnhancer } from 'redux'

declare const __DEV__: boolean
declare const __PROD__: boolean
declare const BASE_URL: string

declare module '*.css' {
    const content: string
    export default content
}

declare module '*.svg' {
    const content: string
    export default content
}

declare module 'ios-safe-audio-context' {
    export default function createAudioContext(sampleRate?: number): AudioContext
}

declare module 'react' {
    export type Node = ReactNode
}

declare module 'react-redux' {
    export function useDispatch<TDispatch = any>(): TDispatch
    export function useSelector<TSelected>(selector: (state: import('Reducer').State) => TSelected): TSelected
}

declare module 'redux-actions' {
    export function createAction(...args: any[]): any
    export function handleActions(...args: any[]): any
}

declare global {
    interface Math {
        radians(degrees: number): number
    }

    interface Window {
        __REDUX_DEVTOOLS_EXTENSION__?: () => StoreEnhancer
        intervalHandler?: ReturnType<typeof setInterval>
        lastArray?: Float32Array
        playTone?: (array?: Float32Array) => void
        startTest?: (interval?: number) => void
        stopTest?: () => void
    }
}

export {}
