/* @flow */
import { useCallback, useState } from 'react'
import type { Animation } from 'Reducer'
import { getPixelState, setPixelState } from './frameState'

type MouseMode = 'idle' | 'paint' | 'erase'

type DrawingState = {
    cursor: string,
    mouseDown: (row: number, column: number) => void,
    mouseOver: (row: number, column: number) => void,
    mouseUp: () => void
}

export default function usePixelEditorDrawing(animation: Animation, onUpdate: (Animation) => mixed): DrawingState {
    const [mouseMode, setMouseMode] = useState<MouseMode>('idle')

    const applyPixel = useCallback(
        (row: number, column: number, isOn: boolean) => {
            onUpdate(setPixelState(animation, row, column, isOn))
        },
        [animation, onUpdate]
    )

    const mouseDown = useCallback(
        (row: number, column: number) => {
            const isOn = getPixelState(animation, row, column)
            const nextMode: MouseMode = isOn ? 'erase' : 'paint'

            setMouseMode(nextMode)
            applyPixel(row, column, !isOn)
        },
        [animation, applyPixel]
    )

    const mouseOver = useCallback(
        (row: number, column: number) => {
            if (mouseMode === 'idle') {
                return
            }

            applyPixel(row, column, mouseMode === 'paint')
        },
        [applyPixel, mouseMode]
    )

    const mouseUp = useCallback(() => {
        setMouseMode('idle')
    }, [])

    const cursor = mouseMode === 'paint' ? 'pointer' : mouseMode === 'erase' ? 'crosshair' : 'auto'

    return { cursor, mouseDown, mouseOver, mouseUp }
}
