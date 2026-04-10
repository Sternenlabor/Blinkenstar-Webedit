/* @flow */
import React, { useCallback, useState, type Node } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import ArchiveIcon from '@mui/icons-material/Archive'
import RemoveIcon from '@mui/icons-material/Remove'
import type { Animation } from 'Reducer'
import AnimationPreview from './AnimationPreview'
import Frame from './Frame'
import GalleryCardContent from './gallery/GalleryCardContent'
import { getFrameColumns } from '../utils'

type ActionName = 'add' | 'archive' | 'remove'

type Props = {
    animation: Animation,
    buttonsDisabled?: boolean,
    handlePrimary: (Animation) => mixed,
    handleSecondary?: (Animation) => mixed,
    primaryAction: ActionName,
    secondaryAction?: ActionName
}

const actionIcons = {
    add: <AddIcon />,
    archive: <ArchiveIcon />,
    remove: <RemoveIcon />
}

function getActionLabel(t: (string, string) => string, action: ActionName): string {
    if (action === 'add') {
        return t('admin_gallery.publish', 'Publish')
    }

    if (action === 'archive') {
        return t('admin_gallery.archive', 'Archive')
    }

    return t('admin_gallery.unpublish', 'Remove')
}

export default function AdminGalleryItem({
    animation,
    buttonsDisabled = false,
    handlePrimary,
    handleSecondary,
    primaryAction,
    secondaryAction
}: Props): Node {
    const { t } = useTranslation()
    const [playing, setPlaying] = useState<boolean>(false)

    const handlePrimaryClick = useCallback(() => {
        handlePrimary(animation)
        setPlaying(false)
    }, [animation, handlePrimary])

    const handleSecondaryClick = useCallback(() => {
        if (handleSecondary) {
            handleSecondary(animation)
            setPlaying(false)
        }
    }, [animation, handleSecondary])

    const previewColumns = getFrameColumns(animation, animation.animation.currentFrame)
    const title = animation.name || animation.text || ''

    return (
        <GalleryCardContent title={title}>
            <Box onMouseEnter={() => setPlaying(true)} onMouseLeave={() => setPlaying(false)}>
                {playing ? (
                    <AnimationPreview animation={animation} size="gallery" style={{ opacity: 1 }} offColor="black" />
                ) : (
                    <Frame columns={previewColumns} size="gallery" offColor="black" style={{ opacity: 0.5 }} onClick={() => setPlaying(true)} />
                )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1.5, width: '100%' }}>
                <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={handlePrimaryClick}
                    startIcon={actionIcons[primaryAction]}
                    disabled={buttonsDisabled}
                >
                    {getActionLabel(t, primaryAction)}
                </Button>

                {secondaryAction && handleSecondary ? (
                    <Button
                        size="small"
                        variant="text"
                        color="primary"
                        onClick={handleSecondaryClick}
                        startIcon={actionIcons[secondaryAction]}
                    >
                        {getActionLabel(t, secondaryAction)}
                    </Button>
                ) : null}
            </Box>
        </GalleryCardContent>
    )
}
