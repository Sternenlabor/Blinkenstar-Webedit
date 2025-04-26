/* @flow */
import React, { useState, useEffect, useRef, type Node } from 'react'
import { numFrames, lastFrameIndex, getFrameColumns } from '../utils'
import Frame from './Frame'

type Props = {
    animation: Animation,
    size?: string,
    offColor?: string,
    style?: mixed,
    onClick?: () => void
}

function AnimationPreview({ animation, size, offColor, style, onClick }: Props): Node {
    const [currentFrame, setCurrentFrame] = useState<number>(0)
    const rAF = useRef<number>(0)

    useEffect(() => {
        const framesCount = numFrames(animation)
        if (framesCount === 0) return

        // Local frame counter to avoid stale closure
        let frame = currentFrame
        const { direction = false, delay = 0, speed = 1 } = animation

        // Calculate milliseconds per frame
        const msPerFrame = 1000 / (1 / (0.002048 * (250 - 16 * speed)))
        let nextTime = Date.now()

        const loop = () => {
            const now = Date.now()
            if (now >= nextTime) {
                // Advance or rewind frame
                frame = (frame + (direction ? -1 : 1) + framesCount) % framesCount
                setCurrentFrame(frame)

                // If last frame and delay set, pause
                const offset = frame === lastFrameIndex(animation) && delay > 0 ? delay * 1000 : msPerFrame
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
