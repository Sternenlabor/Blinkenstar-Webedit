/* @flow */
import React, { type Node } from 'react'
import ListItem from '@mui/material/ListItem'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import IconButton from '@mui/material/IconButton'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import AnimationPreview from './AnimationPreview'

const style = {
    itemText: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
    },
    avatarWrapper: {
        position: 'absolute',
        top: 8,
        left: 16
    },
    listItem: {
        position: 'relative',
        padding: '20px 56px 20px 72px',
        fontFamily: '"Jura", "Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 400,
        fontSize: '1rem',
        lineHeight: 1.1,
        color: 'buttontext'
    },
    listItemSelected: {
        backgroundColor: '#e0e0e0',
        position: 'relative',
        padding: '20px 56px 20px 72px',
        fontFamily: '"Jura", "Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 400,
        fontSize: '1rem',
        lineHeight: 1.1
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
        <ListItem onClick={onClick} style={selected ? style.listItemSelected : style.listItem}>
            <div style={style.avatarWrapper}>
                <AnimationPreview animation={animation} size="thumb" offColor="black" />
            </div>
            <div style={style.itemText}>{animation.name || animation.text || '\u00A0'}</div>
            <ListItemSecondaryAction style={{ right: 0 }}>
                <IconButton onClick={handleRemove}>
                    <DeleteForeverIcon />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    )
}

export default AnimationInMenu
