import React, { Node } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import AnimationPreview from './AnimationPreview'
import type { Animation } from 'Reducer'

const style = {
    preview: { display: 'flex', marginRight: 16 },
    actions: { display: 'flex', alignItems: 'center', gap: 0.5 },
    dragHandle: { cursor: 'grab', touchAction: 'none', color: 'text.secondary' },
    dragging: { opacity: 0.72, backgroundColor: 'action.selected' }
}

type Props = {
    animation: Animation
    selected: boolean
    onRemove: (arg0: string) => void
    onClick?: () => void
    dragging?: boolean
    deleteLabel: string
    dragHandleLabel: string
    itemRef?: (element: HTMLLIElement | null) => void
    onDragPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void
    onDragPointerMove: (event: React.PointerEvent<HTMLButtonElement>) => void
    onDragPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => void
    onDragPointerCancel: (event: React.PointerEvent<HTMLButtonElement>) => void
}

function AnimationInMenu({
    animation,
    selected,
    onRemove,
    onClick,
    dragging = false,
    deleteLabel,
    dragHandleLabel,
    itemRef,
    onDragPointerDown,
    onDragPointerMove,
    onDragPointerUp,
    onDragPointerCancel
}: Props): Node {
    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        onRemove(animation.id)
    }

    return (
        <ListItem
            ref={itemRef}
            disablePadding
            sx={dragging ? style.dragging : undefined}
            secondaryAction={
                <Box sx={style.actions}>
                    <IconButton
                        aria-label={dragHandleLabel}
                        onClick={(event) => event.stopPropagation()}
                        onPointerCancel={onDragPointerCancel}
                        onPointerDown={onDragPointerDown}
                        onPointerMove={onDragPointerMove}
                        onPointerUp={onDragPointerUp}
                        sx={style.dragHandle}
                    >
                        <DragIndicatorIcon />
                    </IconButton>
                    <IconButton
                        aria-label={deleteLabel}
                        title={deleteLabel}
                        onClick={handleRemove}
                        onPointerDown={(event) => event.stopPropagation()}
                    >
                        <DeleteForeverIcon />
                    </IconButton>
                </Box>
            }
        >
            <ListItemButton onClick={onClick} selected={selected} sx={{ py: 2, pr: 12 }}>
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
