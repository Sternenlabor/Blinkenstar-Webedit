/* @flow */
import React, { useState, useCallback, type Node } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import App from './App'
import TextEditor from './TextEditor'
import PixelEditor from './PixelEditor'
import ShareWidget from './ShareWidget'
import { updateAnimation } from 'Actions/animations'
import type { Animation } from '../Reducer'

type Params = { animationId?: string }

export default function Webedit(): Node {
    const dispatch = useDispatch()
    const animations = useSelector((state) => state.animations)
    const uid = useSelector((state) => state.uid)
    const { animationId } = useParams<Params>()
    const [sharing, setSharing] = useState<?Animation>(null)

    const handleUpdate = useCallback((anim: Animation) => dispatch(updateAnimation(anim, uid)), [dispatch, uid])

    const handleShare = useCallback((anim: Animation) => setSharing(anim), [])

    const animation: ?Animation = animationId ? animations.get(animationId) : animations.first()

    return (
        <React.Fragment>
            {animation ? (
                animation.type === 'text' ? (
                    <TextEditor animation={animation} onUpdate={handleUpdate} onShare={handleShare} />
                ) : (
                    <PixelEditor animation={animation} onUpdate={handleUpdate} onShare={handleShare} />
                )
            ) : null}

            <ShareWidget animation={sharing} close={() => setSharing(null)} />
        </React.Fragment>
    )
}
