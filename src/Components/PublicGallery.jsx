/* @flow */
import React, { useState, useEffect, useCallback, type Node } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import UUID from 'uuid-js'
import { useTranslation } from 'react-i18next'
import App from './App'
import Gallery from './Gallery'
import { addAnimation } from 'Actions/animations'
import { loadGallery } from 'Actions/gallery'
import type { Animation } from 'Reducer'
import { Map } from 'immutable'

const style = {
    canvas: { padding: 20 },
    loading: { textAlign: 'center', fontFamily: 'Roboto, sans-serif' }
}

export default function PublicGallery(): Node {
    const dispatch = useDispatch()
    const { t } = useTranslation()
    const uid = useSelector((state) => state.uid)
    const gallery = useSelector((state) => state.gallery)
    const [loading, setLoading] = useState<boolean>(true)

    // Load gallery on mount or when gallery is empty
    useEffect(() => {
        if (gallery.size === 0) {
            dispatch(loadGallery()).finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [dispatch, gallery.size])

    // In case gallery fills after mount
    useEffect(() => {
        if (gallery.size > 0 && loading) {
            setLoading(false)
        }
    }, [gallery.size, loading])

    const copyToLibrary = useCallback(
        (animation: Animation) => {
            const cleaned = {
                ...animation,
                id: UUID.create().toString(),
                author: undefined,
                animation: { ...animation.animation }
            }
            dispatch(addAnimation(cleaned, uid))
        },
        [dispatch, uid]
    )

    // Prepare items for display
    const items = gallery
        .valueSeq()
        .sortBy((anim) => anim.creationDate)
        .reverse()

    return (
        <div style={style.canvas}>
            {loading ? (
                <div style={style.loading}>
                    <h3>{t('gallery.loading', 'Loading...')}</h3>
                </div>
            ) : items.size === 0 ? (
                <div style={style.loading}>
                    <h3>{t('gallery.no_animations', 'No animations available yet')}</h3>
                </div>
            ) : (
                <Gallery gallery={items} clickLabel={t('gallery.copy_animation', 'Copy to library')} onClick={copyToLibrary} />
            )}
        </div>
    )
}
