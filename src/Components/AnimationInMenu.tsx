import React, { Node } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import AnimationPreview from './AnimationPreview'
import type { Animation } from 'Reducer'

const style = {
    preview: { display: 'flex', marginRight: 16 }
}

type Props = {
    animation: Animation
    selected: boolean
    onRemove: (arg0: string) => void
    onClick?: () => void
}

function AnimationInMenu({ animation, selected, onRemove, onClick }: Props): Node {
    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        onRemove(animation.id)
    }

    return (
        <ListItem
            disablePadding
            secondaryAction={
                <IconButton onClick={handleRemove} edge="end">
                    <DeleteForeverIcon />
                </IconButton>
            }
        >
            <ListItemButton onClick={onClick} selected={selected} sx={{ py: 2, pr: 8 }}>
                <Box style={style.preview}>
                    <AnimationPreview animation={animation} size="thumb" offColor="black" />
                </Box>
                <ListItemText
                    primary={animation.name || animation.text || '\u00A0'}
                    slotProps={{ primary: { noWrap: true, sx: { lineHeight: 1.1 } } }}
                />
            </ListItemButton>
        </ListItem>
    )
}

export default AnimationInMenu
