/* @flow */
import React, { useState, useCallback, type Node, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import font from 'font'
import Divider from '@mui/material/Divider'
import Slider from '@mui/material/Slider'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import ShareIcon from '@mui/icons-material/Share'
import type { Animation } from 'Reducer'
import AnimationPreview from './AnimationPreview'

const style = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'auto',
        overflowY: 'auto',
        padding: 20
    },
    textField: {
        flexShrink: 0,
        width: 256,
        marginBottom: 16
    },
    sliderContainer: {
        display: 'flex',
        alignItems: 'center',
        marginTop: 15
    },
    sliderLabel: {
        flex: '1 1 25%',
        marginRight: 10,
        fontFamily: 'Roboto, sans-serif'
    },
    slider: {
        flex: '1 1 75%',
        marginLeft: 15,
        marginRight: 15
    }
}

type Props = {
    animation: Animation,
    onUpdate: (Animation) => mixed,
    onShare: (Animation) => mixed
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
        (prop: string, e: ChangeEvent<HTMLInputElement>) => {
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
        <div style={style.wrapper}>
            <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => onShare(animation)}
                style={{ alignSelf: 'flex-end', marginTop: 10, marginBottom: -20, minHeight: 34 }}
                startIcon={<ShareIcon />}
            >
                {t('textEditor.share', 'Share')}
            </Button>

            {/* always show preview; switch state is retained but not applied */}
            <AnimationPreview animation={animation} />

            <Divider style={{ margin: '16px 0', background: 'transparent' }} />

            <TextField
                style={style.textField}
                id="text"
                label={t('textEditor.textPlaceholder')}
                placeholder={t('textEditor.textPlaceholder')}
                value={animation.text || ''}
                onChange={(e) => handleChange('text', e)}
            />

            <TextField
                style={style.textField}
                id="name"
                label={t('textEditor.name')}
                placeholder={t('textEditor.name')}
                value={animation.name}
                onChange={(e) => handleChange('name', e)}
            />

            <div style={style.sliderContainer}>
                <span style={style.sliderLabel}>{t('textEditor.speed')}</span>
                <Slider style={style.slider} value={animation.speed} step={1} min={0} max={15} onChange={handleSpeedChange} />
                {animation.speed}
            </div>

            <div style={style.sliderContainer}>
                <span style={style.sliderLabel}>{t('textEditor.delay')}</span>
                <Slider style={style.slider} value={animation.delay} step={0.5} min={0} max={7.5} onChange={handleDelayChange} />
                {animation.delay}
            </div>

            <div style={style.sliderContainer}>
                <span style={style.sliderLabel}>{t('textEditor.repeat')}</span>
                <Slider style={style.slider} value={animation.repeat} step={1} min={0} max={15} onChange={handleRepeatChange} />
                {animation.repeat}
            </div>

            <div style={style.sliderContainer}>
                <span style={style.sliderLabel}>{t('textEditor.rtl')}</span>
                <Switch checked={Boolean(animation.direction)} onChange={handleDirectionChange} />
            </div>

            <div style={style.sliderContainer}>
                <span style={style.sliderLabel}>{t('textEditor.livePreview')}</span>
                <Switch checked={livePreview} onChange={handlePreviewChange} />
            </div>
        </div>
    )
}
