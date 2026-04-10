// @flow
import React, { type Node } from 'react'
import { List } from 'immutable'

type Props = {
    columns: List<List<boolean>>,
    cursor?: string,
    style?: { [string]: any },
    size?: 'thumb' | 'gallery' | 'small' | 'mid' | 'huge',
    offColor?: string,
    onClick?: (e: SyntheticMouseEvent<>) => mixed,
    mouseUpCallback?: () => mixed,
    mouseDownCallback?: (row: number, col: number) => mixed,
    mouseOverCallback?: (row: number, col: number) => mixed
}

const baseStyle = {
    flexShrink: 0,
    display: 'block',
    // avoid dragging the whole preview in Firefox
    userSelect: 'none',
    MozUserSelect: 'none',
    WebkitUserSelect: 'none',
    borderRadius: '4px',
    overflow: 'hidden',
    width: 'min-content'
}

const sizes = {
    thumb: 2,
    gallery: 5,
    small: 10,
    mid: 15,
    huge: 20
}

type DotColumnProps = {
    data: List<boolean>,
    columnIndex: number,
    radius: number,
    offColor: string,
    cursor: string,
    onMouseDown?: (r: number, c: number) => mixed,
    onMouseUp?: (r: number, c: number) => mixed,
    onMouseOver?: (r: number, c: number) => mixed
}

function DotColumn({ data, columnIndex, radius, offColor, cursor, onMouseDown, onMouseUp, onMouseOver }: DotColumnProps): Node {
    return (
        <g>
            {data.map((on, r) => (
                <circle
                    key={r}
                    r={radius}
                    cx={columnIndex * radius * 2.5 + radius * 1.5}
                    cy={r * radius * 2.5 + radius * 1.5}
                    fill={on ? 'red' : offColor}
                    style={{ cursor }}
                    onMouseDown={onMouseDown ? () => onMouseDown(r, columnIndex) : undefined}
                    onMouseUp={onMouseUp ? () => onMouseUp(r, columnIndex) : undefined}
                    onMouseOver={onMouseOver ? () => onMouseOver(r, columnIndex) : undefined}
                />
            ))}
        </g>
    )
}

function Frame({
    columns,
    cursor,
    style = {},
    size = 'small',
    offColor = 'slategrey',
    onClick,
    mouseUpCallback,
    mouseDownCallback,
    mouseOverCallback
}: Props): Node {
    const radius = sizes[size] || sizes.small
    const dim = radius * 2.5
    const width = 8 * dim + radius * 0.5
    const mergedStyle = { ...baseStyle, ...style }
    const resolvedCursor = cursor || (mouseDownCallback ? 'pointer' : 'default')

    return (
        <div style={mergedStyle} onClick={onClick} onMouseUp={mouseUpCallback} onMouseLeave={mouseUpCallback} draggable="false">
            <svg width={width} height={width} style={{ display: 'block' }}>
                <rect width={width} height={width} fill="black" />
                {columns.map((col, i) => (
                    <DotColumn
                        key={i}
                        data={col}
                        columnIndex={i}
                        radius={radius}
                        offColor={offColor}
                        cursor={resolvedCursor}
                        onMouseDown={mouseDownCallback}
                        onMouseUp={mouseUpCallback}
                        onMouseOver={mouseOverCallback}
                    />
                ))}
            </svg>
        </div>
    )
}

export default React.memo<Props>(Frame)
