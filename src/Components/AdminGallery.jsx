/* @flow */
import React, { useEffect, type Node } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import App from './App'
import Gallery from './Gallery'
import AdminGalleryItem from './AdminGalleryItem'
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

type Props = {
    // No props passed; using store and hooks
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

    const toReview = adminGallery
        .valueSeq()
        .filter((a) => !a.originalId && (a.reviewedAt || -1) < (a.modifiedAt || 1))
        .sortBy((a) => a.modifiedAt || a.creationDate)
        .reverse()

    const publicList = gallery
        .valueSeq()
        .sortBy((a) => a.creationDate)
        .reverse()

    const handleAdd = (animation: Animation) => {
        dispatch(addAnimationToGallery(animation))
        dispatch(reviewAnimation(animation, new Date()))
    }

    const handleRemove = (animation: Animation) => {
        dispatch(removeAnimationFromGallery(animation))
        const original = adminGallery.get(animation.originalId)
        if (original) dispatch(reviewAnimation(original, null))
    }

    const handleArchive = (animation: Animation) => {
        dispatch(reviewAnimation(animation, new Date()))
    }

    return (
        <div style={style.canvas}>
            <div style={style.adminCanvas}>
                <h2>{t('admin_gallery.review_title', 'User Animations for Review')}:</h2>
                <div style={style.adminGallery}>
                    {toReview.map((anim) => (
                        <AdminGalleryItem
                            key={anim.id}
                            animation={anim}
                            buttonsDisabled={originalIds.includes(anim.id)}
                            handlePrimary={handleAdd}
                            handleSecondary={handleArchive}
                            primaryAction="add"
                            secondaryAction="archive"
                        />
                    ))}
                </div>
            </div>
            <div style={style.publicCanvas}>
                <h2>{t('admin_gallery.public_title', 'Public Gallery')}</h2>
                <div style={style.publicFrame}>
                    <Gallery gallery={publicList} clickLabel={t('admin_gallery.unpublish')} clickIcon="remove" onClick={handleRemove} />
                </div>
            </div>
        </div>
    )
}

export default AdminGallery
