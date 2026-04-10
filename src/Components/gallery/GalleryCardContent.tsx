import React, { Node } from 'react';
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

type Props = {
    children: Node,
    title: string
};

export default function GalleryCardContent(
    {
        children,
        title
    }: Props
): Node {
    return (
        <Box sx={{ alignItems: 'center', m: 1.5, position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <Typography
                title={title}
                sx={{
                    fontFamily: 'sans-serif',
                    fontSize: 12,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    mb: 0.5,
                    width: 100
                }}
            >
                {title ? <strong>{title}</strong> : <em>Untitled</em>}
            </Typography>
            {children}
        </Box>
    )
}
