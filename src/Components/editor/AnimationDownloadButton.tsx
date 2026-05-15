import React, { useCallback, Node } from 'react'
import Button from '@mui/material/Button'
import DownloadIcon from '@mui/icons-material/Download'
import type { Animation } from 'Reducer'
import { buildAnimationJsonFileName, serializeAnimationToJson } from '../../animationJsonTransfer'

type Props = {
    animation: Animation
    label: string
}

export default function AnimationDownloadButton({ animation, label }: Props): Node {
    const handleDownload = useCallback(() => {
        const blob = new Blob([serializeAnimationToJson(animation)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.download = buildAnimationJsonFileName(animation)
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
    }, [animation])

    return (
        <Button size="small" variant="outlined" color="primary" onClick={handleDownload} startIcon={<DownloadIcon />}>
            {label}
        </Button>
    )
}
