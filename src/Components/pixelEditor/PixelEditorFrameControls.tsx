/* @flow */
import React, { Node } from 'react';
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import type { Animation } from 'Reducer'
import EditorActionRow from '../editor/EditorActionRow'

type Props = {
    animation: Animation,
    onCopy: (() => void),
    onDelete: (() => void),
    onNext: (() => void),
    onPrevious: (() => void),
    onTogglePlaying: (() => void),
    playing: boolean
};

export default function PixelEditorFrameControls(
    {
        animation,
        onCopy,
        onDelete,
        onNext,
        onPrevious,
        onTogglePlaying,
        playing
    }: Props
): Node {
    const { t } = useTranslation()
    const currentFrame = animation.animation.currentFrame
    const frameCount = animation.animation.frames

    return (
        <React.Fragment>
            <EditorActionRow>
                <Button
                    size="small"
                    variant="text"
                    color="primary"
                    onClick={onTogglePlaying}
                    startIcon={playing ? <PauseCircleOutlineIcon /> : <PlayCircleOutlineIcon />}
                >
                    {playing ? t('pixelEditor.pause', 'Pause') : t('pixelEditor.play', 'Play')}
                </Button>
                <Typography sx={{ alignSelf: 'center' }}>{`Frame ${currentFrame + 1} / ${frameCount}`}</Typography>
            </EditorActionRow>

            <EditorActionRow>
                <Button variant="text" color="primary" disabled={playing || currentFrame === 0} onClick={onPrevious} startIcon={<SkipPreviousIcon />}>
                    {t('pixelEditor.previousFrame', 'Previous')}
                </Button>
                <Button variant="text" color="primary" disabled={playing} onClick={onDelete} startIcon={<DeleteForeverIcon />}>
                    {t('pixelEditor.deleteFrame', 'Delete')}
                </Button>
                <Button variant="text" color="primary" disabled={playing} onClick={onCopy} startIcon={<FileCopyIcon />}>
                    {t('pixelEditor.copyFrame', 'Copy')}
                </Button>
                <Button variant="text" color="primary" disabled={playing} onClick={onNext} endIcon={<SkipNextIcon />}>
                    {t('pixelEditor.nextFrame', 'Next')}
                </Button>
            </EditorActionRow>
        </React.Fragment>
    )
}
