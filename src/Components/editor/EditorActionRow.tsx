/* @flow */
import React, { Node } from 'react'
import Stack from '@mui/material/Stack'

type Props = {
    children: Node
}

export default function EditorActionRow({ children }: Props): Node {
    return (
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }} useFlexGap>
            {children}
        </Stack>
    )
}
