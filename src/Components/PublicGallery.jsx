/* @flow */
import React, { useState, useEffect, useCallback, type Node } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import UUID from 'uuid-js'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Gallery from './Gallery'
import { addAnimation } from 'Actions/animations'
import { loadGallery } from 'Actions/gallery'
import type { Animation } from 'Reducer'
import { Typography } from '@mui/material'

const style = {
    canvas: { padding: 20 },
    loading: { textAlign: 'center' }
}

export default function PublicGallery(): Node {
    const dispatch = useDispatch()
    const { t } = useTranslation()
    const uid = useSelector((state) => state.uid)
    const gallery = useSelector((state) => state.gallery)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        let isActive = true

        if (gallery.size === 0) {
            Promise.resolve(dispatch(loadGallery())).finally(() => {
                if (isActive) {
                    setLoading(false)
                }
            })
        } else {
            setLoading(false)
        }

        return () => {
            isActive = false
        }
    }, [dispatch, gallery.size])

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

    const items: Animation[] = gallery
        .valueSeq()
        .sortBy((anim) => anim.creationDate)
        .reverse()
        .toArray()

    return (
        <Box sx={style.canvas}>
            {loading ? (
                <Box sx={style.loading}>
                    <Typography variant="h5">{t('gallery.loading', 'Loading...')}</Typography>
                </Box>
            ) : items.length === 0 ? (
                <Box sx={style.loading}>
                    <Typography variant="h5">{t('gallery.no_animations', 'No animations available yet')}</Typography>
                </Box>
            ) : (
                <Gallery gallery={items} clickLabel={t('gallery.copy_animation', 'Copy to library')} onClick={copyToLibrary} />
            )}
        </Box>
    )
}
