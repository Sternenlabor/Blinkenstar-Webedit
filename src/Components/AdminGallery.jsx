/* @flow */
import React, { useEffect, type Node } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Gallery from './Gallery'
import AdminGalleryItem from './AdminGalleryItem'
import GalleryGrid from './gallery/GalleryGrid'
import { loadGallery, loadAdminGallery, addAnimationToGallery, removeAnimationFromGallery, reviewAnimation } from '../Actions/gallery'
import type { Animation } from 'Reducer'
import { Map } from 'immutable'

const style = {
    canvas: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        alignContent: 'flex-start',
        height: '100%',
        width: '100%',
        padding: '20px'
    },
    adminGallery: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        alignContent: 'flex-start',
        height: '100%',
        width: '100%'
    },
    adminCanvas: { width: '50%', padding: '20px', margin: '20px' },
    publicCanvas: { width: '50%', padding: '20px', margin: '20px' },
    publicFrame: {
        border: '1px solid #d5d5d5',
        backgroundColor: '#d5d5d526',
        borderRadius: '3px',
        padding: '15px'
    }
}

function AdminGallery(): Node {
    const { t } = useTranslation()

    const uid: ?string = useSelector((state) => state.uid)
    const admin: boolean = useSelector((state) => state.admin)
    const gallery: Map<string, Animation> = useSelector((state) => state.gallery)
    const adminGallery: Map<string, Animation> = useSelector((state) => state.adminGallery)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        if (uid) {
            if (admin) {
                dispatch(loadAdminGallery())
                dispatch(loadGallery())
            } else {
                navigate('/gallery')
            }
        }
    }, [uid, admin, dispatch, navigate])

    const originalIds: string[] = gallery
        .valueSeq()
        .map((a) => a.originalId)
        .toJS()

    const toReview: Animation[] = adminGallery
        .valueSeq()
        .filter((a) => !a.originalId && (a.reviewedAt || -1) < (a.modifiedAt || 1))
        .sortBy((a) => a.modifiedAt || a.creationDate)
        .reverse()
        .toArray()

    const publicList: Animation[] = gallery
        .valueSeq()
        .sortBy((a) => a.creationDate)
        .reverse()
        .toArray()

    const handleAdd = (animation: Animation) => {
        dispatch(addAnimationToGallery(animation))
        dispatch(reviewAnimation(animation, Date.now()))
    }

    const handleRemove = (animation: Animation) => {
        dispatch(removeAnimationFromGallery(animation))
        const original = adminGallery.get(animation.originalId)
        if (original) dispatch(reviewAnimation(original, null))
    }

    const handleArchive = (animation: Animation) => {
        dispatch(reviewAnimation(animation, Date.now()))
    }

    return (
        <Box sx={style.canvas}>
            <Box sx={style.adminCanvas}>
                <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
                    {t('admin_gallery.review_title')}
                </Typography>
                <GalleryGrid>
                    {toReview.map((animation) => (
                        <AdminGalleryItem
                            key={animation.id}
                            animation={animation}
                            buttonsDisabled={originalIds.includes(animation.id)}
                            handlePrimary={handleAdd}
                            handleSecondary={handleArchive}
                            primaryAction="add"
                            secondaryAction="archive"
                        />
                    ))}
                </GalleryGrid>
            </Box>
            <Box sx={style.publicCanvas}>
                <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
                    {t('admin_gallery.public_title')}
                </Typography>
                <Paper sx={style.publicFrame} elevation={0}>
                    <Gallery gallery={publicList} clickLabel={t('admin_gallery.unpublish')} clickIcon="remove" onClick={handleRemove} />
                </Paper>
            </Box>
        </Box>
    )
}

export default AdminGallery
