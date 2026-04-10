/* @flow */
import React, { useState, useCallback, Node, ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import font from 'font'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import ShareIcon from '@mui/icons-material/Share'
import { Typography } from '@mui/material'
import type { Animation } from 'Reducer'
import AnimationPreview from './AnimationPreview'
import EditorPanel from './editor/EditorPanel'
import EditorSliderRow from './editor/EditorSliderRow'
import editorSpacing from './editor/editorSpacing'

const style = {
    sliderLabel: {
        flex: '1 1 25%',
        marginRight: 10
    }
}

type Props = {
    animation: Animation
    onUpdate: (animation: Animation) => unknown
    onShare: (animation: Animation) => unknown
}

export default function TextEditor({ animation, onUpdate, onShare }: Props): Node {
    const { t } = useTranslation()
    const [livePreview, setLivePreview] = useState<boolean>(true)

    const deUmlaut = useCallback((value: string): string => {
        return value
            .replace(/ä/g, 'ae')
            .replace(/ö/g, 'oe')
            .replace(/ü/g, 'ue')
            .replace(/Ä/g, 'Ae')
            .replace(/Ö/g, 'Oe')
            .replace(/Ü/g, 'Ue')
            .replace(/ß/g, 'ss')
    }, [])

    const handleChange = useCallback(
        (prop: string, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            let value = deUmlaut(e.target.value)
            value = value
                .split('')
                .filter((c) => font[c.charCodeAt(0)])
                .join('')
                .substring(0, 200)
            onUpdate({ ...animation, [prop]: value })
        },
        [animation, onUpdate, deUmlaut]
    )

    const handleSpeedChange = useCallback(
        (_: any, value: number | number[]) => {
            const v = Array.isArray(value) ? value[0] : value
            onUpdate({ ...animation, speed: v })
        },
        [animation, onUpdate]
    )

    const handleDelayChange = useCallback(
        (_: any, value: number | number[]) => {
            const v = Array.isArray(value) ? value[0] : value
            onUpdate({ ...animation, delay: v })
        },
        [animation, onUpdate]
    )

    const handleRepeatChange = useCallback(
        (_: any, value: number | number[]) => {
            const v = Array.isArray(value) ? value[0] : value
            onUpdate({ ...animation, repeat: v })
        },
        [animation, onUpdate]
    )

    const handleDirectionChange = useCallback(
        (_: any, checked: boolean) => {
            onUpdate({ ...animation, direction: checked ? 1 : 0 })
        },
        [animation, onUpdate]
    )

    const handlePreviewChange = useCallback((_: any, checked: boolean) => {
        setLivePreview(checked)
    }, [])

    return (
        <EditorPanel>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: -1 }}>
                <Button size="small" variant="outlined" color="primary" onClick={() => onShare(animation)} startIcon={<ShareIcon />}>
                    {t('textEditor.share', 'Share')}
                </Button>
            </Box>

            <AnimationPreview animation={animation} />

            <Divider sx={{ my: 2, background: 'transparent' }} />

            <TextField
                sx={editorSpacing.fieldSx}
                id="text"
                label={t('textEditor.textPlaceholder')}
                placeholder={t('textEditor.textPlaceholder')}
                value={animation.text || ''}
                onChange={(e) => handleChange('text', e)}
            />

            <TextField
                sx={editorSpacing.fieldSx}
                id="name"
                label={t('textEditor.name')}
                placeholder={t('textEditor.name')}
                value={animation.name}
                onChange={(e) => handleChange('name', e)}
            />

            <EditorSliderRow label={t('textEditor.speed')} max={15} min={0} onChange={handleSpeedChange} step={1} value={animation.speed} />

            <EditorSliderRow
                label={t('textEditor.delay')}
                max={7.5}
                min={0}
                onChange={handleDelayChange}
                step={0.5}
                value={animation.delay}
            />

            <EditorSliderRow
                label={t('textEditor.repeat')}
                max={15}
                min={0}
                onChange={handleRepeatChange}
                step={1}
                value={animation.repeat}
            />

            <Box sx={editorSpacing.toggleRowSx}>
                <Typography sx={style.sliderLabel}>{t('textEditor.rtl')}</Typography>
                <Switch checked={Boolean(animation.direction)} onChange={handleDirectionChange} />
            </Box>

            <Box sx={editorSpacing.toggleRowSx}>
                <Typography sx={style.sliderLabel}>{t('textEditor.livePreview')}</Typography>
                <Switch checked={livePreview} onChange={handlePreviewChange} />
            </Box>
        </EditorPanel>
    )
}
