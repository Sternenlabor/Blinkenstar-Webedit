/* @flow */
import React, { Node } from 'react';
import Box from '@mui/material/Box'

type Props = {
    children: Node
};

export default function GalleryGrid(
    {
        children
    }: Props
): Node {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                alignContent: 'flex-start',
                width: '100%'
            }}
        >
            {children}
        </Box>
    )
}
