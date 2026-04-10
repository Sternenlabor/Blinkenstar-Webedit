/* @flow */
import React, { type Node } from 'react'
import Box from '@mui/material/Box'

type Props = {
    children: Node
}

export default function EditorPanel({ children }: Props): Node {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                overflowX: 'auto',
                overflowY: 'auto',
                p: 2.5
            }}
        >
            {children}
        </Box>
    )
}
