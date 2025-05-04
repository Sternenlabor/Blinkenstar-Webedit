/* @flow */
import React, { useState, type Node, useCallback } from 'react'
import Frame from './Frame'
import AnimationPreview from './AnimationPreview'
import { getFrameColumns } from '../utils'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

const style = {
    galleryItem: { alignItems: 'center', margin: '15px', position: 'relative' },
    title: {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        marginBottom: '4px',
        width: '100px'
    },
    frame: {
        /*boxShadow: '7px 6px 2px lightgrey',*/
    },
    actionButton: { marginTop: '10px', width: '100%' }
}

const actionIcons = {
    add: <AddIcon />,
    remove: <RemoveIcon />
}

type Props = {
    animation: Animation,
    size?: string,
    offColor?: string,
    clickIcon?: 'add' | 'remove',
    clickLabel?: string,
    onClick?: (Animation) => mixed
}

function GalleryItem({ animation, size = 'gallery', offColor = 'black', clickIcon = 'add', clickLabel = '', onClick }: Props): Node {
    const [playing, setPlaying] = useState(false)

    const enter = useCallback(() => setPlaying(true), [])
    const leave = useCallback(() => setPlaying(false), [])

    const handleClick = useCallback(() => {
        if (onClick) onClick(animation)
        setPlaying(false)
    }, [onClick, animation])

    const frameCols = getFrameColumns(animation, animation.animation.currentFrame)

    return (
        <div style={style.galleryItem} onMouseEnter={enter} onMouseLeave={leave}>
            <div style={style.title} title={animation.name || ''}>
                {animation.name ? <b>{animation.name}</b> : <em>Untitled</em>}
            </div>

            {!playing ? (
                <Frame
                    columns={frameCols}
                    onClick={() => setPlaying(true)}
                    size={size}
                    offColor={offColor}
                    style={{ ...style.frame, opacity: 0.5 }}
                />
            ) : (
                <AnimationPreview
                    animation={animation}
                    key={animation.id}
                    size={size}
                    style={style.frame}
                    offColor={offColor}
                    onClick={handleClick}
                />
            )}

            <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={handleClick}
                style={style.actionButton}
                startIcon={actionIcons[clickIcon]}
            >
                {clickLabel}
            </Button>
        </div>
    )
}

export default React.memo<Props>(GalleryItem)
