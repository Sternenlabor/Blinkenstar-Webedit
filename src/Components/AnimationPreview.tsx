/* @flow */
import React, { useState, useEffect, useRef, Node } from 'react';
import { numFrames, lastFrameIndex, getFrameColumns } from '../utils'
import Frame from './Frame'
import type { Animation } from 'Reducer'

type Props = {
    animation: Animation,
    size?: "thumb" | "gallery" | "small" | "mid" | "huge",
    offColor?: string,
    style?: unknown,
    onClick?: (() => void)
};

function getMillisecondsPerFrame(speed: number = 1): number {
    return 2.048 * (250 - 16 * speed)
}

function AnimationPreview(
    {
        animation,
        size,
        offColor,
        style,
        onClick
    }: Props
): Node {
    const [currentFrame, setCurrentFrame] = useState<number>(0)
    const rAF = useRef<number>(0)

    useEffect(() => {
        const framesCount = numFrames(animation)
        if (framesCount === 0) {
            setCurrentFrame(0)
            return undefined
        }

        let frame = 0
        const { direction = false, delay = 0, speed = 1 } = animation
        const step = direction ? -1 : 1
        const msPerFrame = getMillisecondsPerFrame(speed)
        const lastFrame = lastFrameIndex(animation)
        let nextTime = performance.now()

        setCurrentFrame(frame)

        const loop = (now) => {
            if (now >= nextTime) {
                frame = (frame + step + framesCount) % framesCount
                setCurrentFrame(frame)

                const offset = frame === lastFrame && delay > 0 ? delay * 1000 : msPerFrame
                nextTime = now + offset
            }
            rAF.current = requestAnimationFrame(loop)
        }

        rAF.current = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(rAF.current)
    }, [animation])

    const columns = getFrameColumns(animation, currentFrame)
    return <Frame columns={columns} size={size} offColor={offColor} style={style} onClick={onClick} />
}

export default React.memo<Props>(AnimationPreview)
