/* @flow */
import React, { type Node } from 'react'
import type { List } from 'immutable'
import type { Animation } from 'Reducer'
import AnimationPreview from '../AnimationPreview'
import Frame from '../Frame'

type Props = {
    animation: Animation,
    columns: List<List<boolean>>,
    cursor: string,
    mouseDown: (row: number, column: number) => void,
    mouseOver: (row: number, column: number) => void,
    mouseUp: () => void,
    playing: boolean
}

export default function PixelEditorCanvas({ animation, columns, cursor, mouseDown, mouseOver, mouseUp, playing }: Props): Node {
    if (playing) {
        return <AnimationPreview animation={animation} />
    }

    return <Frame columns={columns} cursor={cursor} mouseDownCallback={mouseDown} mouseUpCallback={mouseUp} mouseOverCallback={mouseOver} />
}
