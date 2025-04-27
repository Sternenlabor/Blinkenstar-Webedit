/* @flow */
import React, { useState, useCallback, useEffect, useRef, type Node } from 'react'
import { range } from 'lodash'
import { useTranslation } from 'react-i18next'
import { List } from 'immutable'
import { MAX_ANIMATION_FRAMES } from '../variables'
import Button from '@mui/material/Button'
import Slider from '@mui/material/Slider'
import TextField from '@mui/material/TextField'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ShareIcon from '@mui/icons-material/Share'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline'
import AnimationPreview from './AnimationPreview'
import Frame from './Frame'
import { getFrameColumns } from '../utils'
import type { Animation } from 'Reducer'
import { Typography } from '@mui/material'

const EMPTY_DATA = List(range(8).map(() => 0x00))

const MOUSE_MODE_NOTHING = 'MOUSE_MODE_NOTHING'
const MOUSE_MODE_PAINT = 'MOUSE_MODE_PAINT'
const MOUSE_MODE_ERASE = 'MOUSE_MODE_ERASE'

const style = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'auto',
        overflowY: 'auto',
        padding: 20,
        cursor: 'default'
    },
    buttonWrapper: {
        marginBottom: 15
    },
    textField: {
        flexShrink: 0,
        width: 256,
        marginBottom: 16
    },
    sliderContainer: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 15
    },
    sliderLabel: {
        flex: '1 1 25%',
        marginRight: 10
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

export default function PixelEditor({ animation, onUpdate, onShare }: Props): Node {
    const { t } = useTranslation()
    const [mouseMode, setMouseMode] = useState<string>(MOUSE_MODE_NOTHING)
    const [playing, setPlaying] = useState<boolean>(false)
    const animationRef = useRef(animation)

    useEffect(() => {
        animationRef.current = animation
    }, [animation])

    const handleChange = useCallback(
        (prop: string, e) => {
            onUpdate({ ...animationRef.current, [prop]: e.target.value.substring(0, 200) })
        },
        [onUpdate]
    )

    const handleSpeedChange = useCallback(
        (_, value: number) => {
            onUpdate({ ...animationRef.current, speed: value })
        },
        [onUpdate]
    )

    const handleDelayChange = useCallback(
        (_, value: number) => {
            onUpdate({ ...animationRef.current, delay: value })
        },
        [onUpdate]
    )

    const handleRepeatChange = useCallback(
        (_, value: number) => {
            onUpdate({ ...animationRef.current, repeat: value })
        },
        [onUpdate]
    )

    const handleNextFrame = useCallback(() => {
        const anim = animationRef.current.animation
        if (anim.currentFrame + 1 >= MAX_ANIMATION_FRAMES - 1) return

        let newData = anim.data
        let newFrames = anim.frames
        let newLength = anim.length

        if (anim.currentFrame + 1 >= anim.frames) {
            newData = anim.data.concat(EMPTY_DATA)
            newFrames = anim.frames + 1
            newLength = anim.length + 1
        }

        onUpdate({
            ...animationRef.current,
            animation: {
                ...anim,
                data: newData,
                currentFrame: anim.currentFrame + 1,
                frames: newFrames,
                length: newLength
            }
        })
    }, [onUpdate])

    const handlePreviousFrame = useCallback(() => {
        const anim = animationRef.current.animation
        if (anim.currentFrame === 0) return

        onUpdate({
            ...animationRef.current,
            animation: {
                ...anim,
                currentFrame: anim.currentFrame - 1
            }
        })
    }, [onUpdate])

    const handleDeleteFrame = useCallback(() => {
        const anim = animationRef.current.animation
        const { currentFrame, data, frames, length } = anim

        if (currentFrame === 0 && frames === 1) {
            onUpdate({ ...animationRef.current, animation: { ...anim, data: EMPTY_DATA } })
            return
        }

        const start = 8 * currentFrame
        const newData = data.slice(0, start).concat(data.slice(start + 8))
        const newCurrent = currentFrame === 0 ? 0 : currentFrame - 1

        onUpdate({
            ...animationRef.current,
            animation: {
                ...anim,
                data: newData,
                currentFrame: newCurrent,
                frames: frames - 1,
                length: length - 1
            }
        })
    }, [onUpdate])

    const handleCopyFrame = useCallback(() => {
        const anim = animationRef.current.animation
        const { currentFrame, data, frames, length } = anim
        if (currentFrame + 1 >= MAX_ANIMATION_FRAMES - 1) return

        const start = 8 * currentFrame
        const frameData = data.slice(start, start + 8)
        const newData = data.slice(0, start + 8).concat(frameData, data.slice(start + 8))

        onUpdate({
            ...animationRef.current,
            animation: {
                ...anim,
                data: newData,
                currentFrame: currentFrame + 1,
                frames: frames + 1,
                length: length + 1
            }
        })
    }, [onUpdate])

    const setAnimationPoint = useCallback(
        (y: number, x: number, isOn: boolean) => {
            const anim = animationRef.current.animation
            const index = 8 * anim.currentFrame + x
            const bitIndex = 7 - y

            let column = anim.data.get(index)
            if (isOn) {
                column |= 1 << bitIndex
            } else {
                column &= ~(1 << bitIndex)
            }

            const newData = anim.data.set(index, column)

            onUpdate({
                ...animationRef.current,
                animation: {
                    ...anim,
                    data: newData
                }
            })
        },
        [onUpdate]
    )

    const mouseDown = useCallback(
        (y: number, x: number) => {
            const anim = animationRef.current.animation
            const idx = 8 * anim.currentFrame + x
            const col = anim.data.get(idx)
            const bit = 1 << (7 - y)
            const isOn = Boolean(col & bit)

            setMouseMode(isOn ? MOUSE_MODE_ERASE : MOUSE_MODE_PAINT)
            setAnimationPoint(y, x, !isOn)
        },
        [setAnimationPoint]
    )

    const mouseUp = useCallback(() => {
        setMouseMode(MOUSE_MODE_NOTHING)
    }, [])

    const mouseOver = useCallback(
        (y: number, x: number) => {
            if (mouseMode !== MOUSE_MODE_NOTHING) {
                setAnimationPoint(y, x, mouseMode === MOUSE_MODE_PAINT)
            }
        },
        [mouseMode]
    )

    const cursorStyle = mouseMode === MOUSE_MODE_PAINT ? 'pointer' : mouseMode === MOUSE_MODE_ERASE ? 'crosshair' : 'auto'
    const columns = getFrameColumns(animationRef.current, animationRef.current.animation.currentFrame)

    return (
        <div style={style.wrapper}>
            <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => onShare(animationRef.current)}
                style={{ alignSelf: 'flex-end', marginTop: 10, marginBottom: -20, minHeight: 34 }}
                startIcon={<ShareIcon />}
            >
                {t('pixelEditor.share', 'Share')}
            </Button>

            <div>
                {playing ? (
                    <AnimationPreview animation={animationRef.current} />
                ) : (
                    <Frame
                        columns={columns}
                        cursor={cursorStyle}
                        mouseDownCallback={mouseDown}
                        mouseUpCallback={mouseUp}
                        mouseOverCallback={mouseOver}
                    />
                )}
            </div>

            <div>
                <Button
                    size="small"
                    variant="text"
                    color="primary"
                    onClick={() => setPlaying((p) => !p)}
                    startIcon={playing ? <PauseCircleOutlineIcon /> : <PlayCircleOutlineIcon />}
                >
                    {playing ? t('pixelEditor.pause', 'Pause') : t('pixelEditor.play', 'Play')}
                </Button>
                <span>{` Frame ${animationRef.current.animation.currentFrame + 1} / ${animationRef.current.animation.frames}`}</span>
            </div>

            <div style={style.buttonWrapper}>
                <Button
                    variant="text"
                    color="primary"
                    disabled={playing || animationRef.current.animation.currentFrame === 0}
                    onClick={handlePreviousFrame}
                    startIcon={<SkipPreviousIcon />}
                >
                    {t('pixelEditor.previousFrame', 'Previous')}
                </Button>
                <Button variant="text" color="primary" disabled={playing} onClick={handleDeleteFrame} startIcon={<DeleteForeverIcon />}>
                    {t('pixelEditor.deleteFrame', 'Delete')}
                </Button>
                <Button variant="text" color="primary" disabled={playing} onClick={handleCopyFrame} startIcon={<FileCopyIcon />}>
                    {t('pixelEditor.copyFrame', 'Copy')}
                </Button>
                <Button variant="text" color="primary" disabled={playing} onClick={handleNextFrame} endIcon={<SkipNextIcon />}>
                    {t('pixelEditor.nextFrame', 'Next')}
                </Button>
            </div>

            <TextField
                style={style.textField}
                label={t('pixelEditor.name', 'Name')}
                value={animationRef.current.name}
                onChange={(e) => handleChange('name', e)}
                fullWidth
            />

            <div style={style.sliderContainer}>
                <Typography style={style.sliderLabel}>{t('textEditor.speed', 'Speed')}</Typography>
                <Slider style={style.slider} value={animationRef.current.speed} step={1} min={0} max={15} onChange={handleSpeedChange} />
                <Typography>{animationRef.current.speed}</Typography>
            </div>

            <div style={style.sliderContainer}>
                <Typography style={style.sliderLabel}>{t('textEditor.delay', 'Delay')}</Typography>
                <Slider style={style.slider} value={animationRef.current.delay} step={0.5} min={0} max={7.5} onChange={handleDelayChange} />
                <Typography>{animationRef.current.delay}</Typography>
            </div>

            <div style={style.sliderContainer}>
                <Typography style={style.sliderLabel}>{t('pixelEditor.repeat', 'Repeat')}</Typography>
                <Slider style={style.slider} value={animationRef.current.repeat} step={1} min={0} max={15} onChange={handleRepeatChange} />
                <Typography>{animationRef.current.repeat}</Typography>
            </div>
        </div>
    )
}
