/* @flow */
import { createAction } from 'redux-actions'
import UUID from 'uuid-js'
import type { Animation } from 'Reducer'
import { fetchPublicGallery, publishToGallery, unpublishFromGallery, fetchAdminGalleryRemote, reviewAnimationRemote } from '../db'

/** Load public gallery */
export const loadGallery = createAction('UPSERT_GALLERY_ANIMATIONS', async () => {
    return await fetchPublicGallery()
})

/** Publish one to public gallery */
export const addAnimationToGallery = createAction('UPSERT_GALLERY_ANIMATIONS', async (animation: Animation) => {
    const clone: Animation = {
        ...animation,
        id: UUID.create().toString(),
        creationDate: Math.floor(Date.now() / 1000),
        modifiedAt: null,
        originalId: animation.id
    }
    await publishToGallery(clone)
    return [clone]
})

/** Unpublish one */
export const removeAnimationFromGallery = createAction('REMOVE_GALLERY_ANIMATION', async (animation: Animation) => {
    await unpublishFromGallery(animation.id)
    return animation.id
})

export const resetGallery = createAction('RESET_GALLERY')

/** Load all users’ submissions for admin */
export const loadAdminGallery = createAction('UPSERT_ADMIN_GALLERY_ANIMATIONS', async () => {
    return await fetchAdminGalleryRemote()
})

/** Mark reviewed/unreviewed */
export const reviewAnimation = createAction('UPSERT_ADMIN_GALLERY_ANIMATIONS', async (animation: Animation, reviewedAt: ?number) => {
    await reviewAnimationRemote(animation.author || '', animation.id, reviewedAt == null ? null : reviewedAt)
    return [{ ...animation, reviewedAt }]
})
