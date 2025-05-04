/* @flow */
import React, { type Node } from 'react'
import ListItem from '@mui/material/ListItem'
import IconButton from '@mui/material/IconButton'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import AnimationPreview from './AnimationPreview'
import { Typography } from '@mui/material'

const style = {
    itemText: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        lineHeight: 1.1
    },
    avatarWrapper: {
        position: 'absolute',
        top: 8,
        left: 16
    },
    listItem: {
        position: 'relative',
        padding: '20px 16px 20px 72px', // Reduced right padding
        color: 'buttontext'
    },
    listItemSelected: {
        backgroundColor: '#e0e0e0',
        position: 'relative',
        padding: '20px 16px 20px 72px' // Reduced right padding
    }
}

type Props = {
    animation: Animation,
    selected: boolean,
    onRemove: (string) => void,
    onClick?: () => void
}

function AnimationInMenu({ animation, selected, onRemove, onClick }: Props): Node {
    const handleRemove = (e: SyntheticMouseEvent<>) => {
        e.stopPropagation()
        onRemove(animation.id)
    }

    return (
        <ListItem
            onClick={onClick}
            style={selected ? style.listItemSelected : style.listItem}
            secondaryAction={
                <IconButton
                    onClick={handleRemove}
                    edge="end" // Ensures proper spacing
                >
                    <DeleteForeverIcon />
                </IconButton>
            }
        >
            <div style={style.avatarWrapper}>
                <AnimationPreview animation={animation} size="thumb" offColor="black" />
            </div>
            <Typography sx={style.itemText}>{animation.name || animation.text || '\u00A0'}</Typography>
        </ListItem>
    )
}

export default AnimationInMenu
