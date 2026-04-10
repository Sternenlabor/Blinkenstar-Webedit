import React, { useState, Node, useCallback } from 'react';
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import Frame from './Frame'
import AnimationPreview from './AnimationPreview'
import type { Animation } from 'Reducer'
import GalleryCardContent from './gallery/GalleryCardContent'
import { getFrameColumns } from '../utils'

const actionIcons = {
    add: <AddIcon />,
    remove: <RemoveIcon />
}

type Props = {
    animation: Animation,
    size?: "thumb" | "gallery" | "small" | "mid" | "huge",
    offColor?: string,
    clickIcon?: "add" | "remove",
    clickLabel?: string,
    onClick?: ((animation: Animation) => unknown)
};

function GalleryItem(
    {
        animation,
        size = 'gallery',
        offColor = 'black',
        clickIcon = 'add',
        clickLabel = '',
        onClick
    }: Props
): Node {
    const [playing, setPlaying] = useState(false)

    const enter = useCallback(() => setPlaying(true), [])
    const leave = useCallback(() => setPlaying(false), [])

    const handleClick = useCallback(() => {
        if (onClick) onClick(animation)
        setPlaying(false)
    }, [onClick, animation])

    const frameCols = getFrameColumns(animation, animation.animation.currentFrame)

    return (
        <GalleryCardContent title={animation.name || ''}>
            <Box onMouseEnter={enter} onMouseLeave={leave}>
                {!playing ? (
                    <Frame columns={frameCols} onClick={() => setPlaying(true)} size={size} offColor={offColor} style={{ opacity: 0.5 }} />
                ) : (
                    <AnimationPreview animation={animation} key={animation.id} size={size} offColor={offColor} onClick={handleClick} />
                )}
            </Box>

            <Button size="small" variant="outlined" color="primary" onClick={handleClick} sx={{ mt: 1.25, width: '100%' }} startIcon={actionIcons[clickIcon]}>
                {clickLabel}
            </Button>
        </GalleryCardContent>
    )
}

export default React.memo<Props>(GalleryItem)
