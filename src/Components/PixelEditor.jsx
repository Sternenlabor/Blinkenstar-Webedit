/* @flow */
import React, { useState, useCallback, type Node } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import ShareIcon from '@mui/icons-material/Share'
import { getFrameColumns } from '../utils'
import type { Animation } from 'Reducer'
import EditorPanel from './editor/EditorPanel'
import EditorSliderRow from './editor/EditorSliderRow'
import PixelEditorCanvas from './pixelEditor/PixelEditorCanvas'
import PixelEditorFrameControls from './pixelEditor/PixelEditorFrameControls'
import {
    copyFrame,
    deleteFrame,
    nextFrame,
    previousFrame,
    setAnimationDelay,
    setAnimationName,
    setAnimationRepeat,
    setAnimationSpeed
} from './pixelEditor/frameState'
import usePixelEditorDrawing from './pixelEditor/usePixelEditorDrawing'

const style = {
    textField: {
        flexShrink: 0,
        width: 256,
        marginBottom: 16
    }
}

type Props = {
    animation: Animation,
    onUpdate: (Animation) => mixed,
    onShare: (Animation) => mixed
}

export default function PixelEditor({ animation, onUpdate, onShare }: Props): Node {
    const { t } = useTranslation()
    const [playing, setPlaying] = useState<boolean>(false)
    const { cursor, mouseDown, mouseOver, mouseUp } = usePixelEditorDrawing(animation, onUpdate)

    const handleChange = useCallback(
        (prop: string, e) => {
            if (prop === 'name') {
                onUpdate(setAnimationName(animation, e.target.value))
            }
        },
        [animation, onUpdate]
    )

    const handleSpeedChange = useCallback(
        (_: any, value: number | number[]) => {
            onUpdate(setAnimationSpeed(animation, Array.isArray(value) ? value[0] : value))
        },
        [animation, onUpdate]
    )

    const handleDelayChange = useCallback(
        (_: any, value: number | number[]) => {
            onUpdate(setAnimationDelay(animation, Array.isArray(value) ? value[0] : value))
        },
        [animation, onUpdate]
    )

    const handleRepeatChange = useCallback(
        (_: any, value: number | number[]) => {
            onUpdate(setAnimationRepeat(animation, Array.isArray(value) ? value[0] : value))
        },
        [animation, onUpdate]
    )

    const columns = getFrameColumns(animation, animation.animation.currentFrame)

    return (
        <EditorPanel>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: -1 }}>
                <Button size="small" variant="outlined" color="primary" onClick={() => onShare(animation)} startIcon={<ShareIcon />}>
                    {t('pixelEditor.share', 'Share')}
                </Button>
            </Box>

            <PixelEditorCanvas
                animation={animation}
                columns={columns}
                cursor={cursor}
                mouseDown={mouseDown}
                mouseOver={mouseOver}
                mouseUp={mouseUp}
                playing={playing}
            />

            <PixelEditorFrameControls
                animation={animation}
                onCopy={() => onUpdate(copyFrame(animation))}
                onDelete={() => onUpdate(deleteFrame(animation))}
                onNext={() => onUpdate(nextFrame(animation))}
                onPrevious={() => onUpdate(previousFrame(animation))}
                onTogglePlaying={() => setPlaying((current) => !current)}
                playing={playing}
            />

            <TextField
                sx={style.textField}
                label={t('pixelEditor.name', 'Name')}
                value={animation.name}
                onChange={(e) => handleChange('name', e)}
                fullWidth
            />

            <EditorSliderRow label={t('textEditor.speed', 'Speed')} max={15} min={0} onChange={handleSpeedChange} step={1} value={animation.speed} />

            <EditorSliderRow label={t('textEditor.delay', 'Delay')} max={7.5} min={0} onChange={handleDelayChange} step={0.5} value={animation.delay} />

            <EditorSliderRow label={t('pixelEditor.repeat', 'Repeat')} max={15} min={0} onChange={handleRepeatChange} step={1} value={animation.repeat} />
        </EditorPanel>
    )
}
