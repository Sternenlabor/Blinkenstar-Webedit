import React, { ChangeEvent, useCallback, useEffect, useRef, useState, Node } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Paper, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Divider, Button, Avatar } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import UUID from 'uuid-js'
import AnimationInMenu from './AnimationInMenu'
import { newAnimation, addAnimation, removeAnimation, reorderAnimations, reset } from 'Actions/animations'
import { syncLibrary } from '../Actions/auth'
import { INITIAL_ANIMATION_TEXT } from '../variables'
import type { Animation } from 'Reducer'
import { getDisplayAnimations, shouldSeedPlaceholderLibrary } from './menu/menuLibrary'
import { parseAnimationJson } from '../animationJsonTransfer'
import { moveAnimation } from '../animationOrder'

type Props = {
    active: string,
    currentAnimationId: string
};

const styles = {
    wrap: { alignItems: 'center', display: 'flex', flexDirection: 'column' },
    list: { width: '100%' },
    reset: { width: '100%', marginTop: '30px', minHeight: '34px', color: '#da1616' }
}

type MenuActionItemProps = {
    icon: React.ReactNode,
    label: string,
    onClick: (() => void),
    selected?: boolean
};

function MenuActionItem(
    {
        icon,
        label,
        onClick,
        selected = false
    }: MenuActionItemProps
): Node {
    return (
        <ListItem disablePadding>
            <ListItemButton onClick={onClick} selected={selected}>
                <ListItemAvatar>
                    <Avatar>{icon}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={label} />
            </ListItemButton>
        </ListItem>
    )
}

export default function Menu(
    {
        active,
        currentAnimationId
    }: Props
): Node {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const syncedUserRef = useRef<string | null>(null)
    const uploadInputRef = useRef<HTMLInputElement | null>(null)
    const animationItemRefs = useRef<Map<string, HTMLLIElement>>(new Map())
    const dragOrderRef = useRef<Animation[]>([])
    const dragChangedRef = useRef(false)
    const [draggingId, setDraggingId] = useState<string | null>(null)
    const [dragOrder, setDragOrder] = useState<Animation[] | null>(null)

    const animations = useSelector((state) => state.animations)
    const uid = useSelector((state) => state.uid)
    const admin = useSelector((state) => state.admin)

    useEffect(() => {
        if (shouldSeedPlaceholderLibrary(animations, uid)) {
            const anim = newAnimation('text', INITIAL_ANIMATION_TEXT)
            dispatch(addAnimation(anim, uid))
        }
    }, [animations, dispatch, uid])

    useEffect(() => {
        if (!uid) {
            syncedUserRef.current = null
            return
        }

        if (syncedUserRef.current !== uid) {
            syncedUserRef.current = uid
            dispatch(syncLibrary(uid, animations))
        }
    }, [animations, dispatch, uid])

    const displayAnimations: Animation[] = getDisplayAnimations(animations, uid)
    const renderedAnimations = dragOrder || displayAnimations

    const handleRemove = useCallback(
        (animationId: string) => {
            dispatch(removeAnimation(animationId, uid))
        },
        [dispatch, uid]
    )

    const handleReset = useCallback(() => {
        if (window.confirm(t('menu.newWarning'))) {
            dispatch(reset())
            navigate('/')
        }
    }, [dispatch, navigate, t])

    const handleCreateAnimation = useCallback(
        (type: "text" | "pixel") => {
            const animation = newAnimation(type)
            dispatch(addAnimation(animation, uid))
            navigate(`/${animation.id}`)
        },
        [dispatch, navigate, uid]
    )

    const handleUploadClick = useCallback(() => {
        uploadInputRef.current?.click()
    }, [])

    const handleUploadFileChange = useCallback(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files && event.target.files[0]

            if (!file) {
                return
            }

            try {
                const importedAnimation = parseAnimationJson(await file.text(), () => UUID.create().toString())
                dispatch(addAnimation(importedAnimation, uid))
                navigate(`/${importedAnimation.id}`)
            } catch (error) {
                window.alert(t('animation_file.upload_error'))
            } finally {
                event.target.value = ''
            }
        },
        [dispatch, navigate, t, uid]
    )

    const setAnimationItemRef = useCallback((animationId: string, element: HTMLLIElement | null) => {
        if (element) {
            animationItemRefs.current.set(animationId, element)
            return
        }

        animationItemRefs.current.delete(animationId)
    }, [])

    const getDragTargetIndex = useCallback((clientY: number, currentOrder: Animation[]): number => {
        for (let index = 0; index < currentOrder.length; index++) {
            const element = animationItemRefs.current.get(currentOrder[index].id)

            if (!element) {
                continue
            }

            const rect = element.getBoundingClientRect()
            if (clientY < rect.top + rect.height / 2) {
                return index
            }
        }

        return currentOrder.length - 1
    }, [])

    const handleDragPointerDown = useCallback(
        (animationId: string) => (event: React.PointerEvent<HTMLButtonElement>) => {
            if (event.pointerType === 'mouse' && event.button !== 0) {
                return
            }

            event.preventDefault()
            event.stopPropagation()
            event.currentTarget.setPointerCapture(event.pointerId)
            dragOrderRef.current = displayAnimations
            dragChangedRef.current = false
            setDragOrder(displayAnimations)
            setDraggingId(animationId)
        },
        [displayAnimations]
    )

    const handleDragPointerMove = useCallback(
        (event: React.PointerEvent<HTMLButtonElement>) => {
            if (!draggingId) {
                return
            }

            event.preventDefault()
            event.stopPropagation()

            const currentOrder = dragOrderRef.current
            const fromIndex = currentOrder.findIndex((animation) => animation.id === draggingId)
            const toIndex = getDragTargetIndex(event.clientY, currentOrder)

            if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
                return
            }

            const nextOrder = moveAnimation(currentOrder, fromIndex, toIndex)
            dragOrderRef.current = nextOrder
            dragChangedRef.current = true
            setDragOrder(nextOrder)
        },
        [draggingId, getDragTargetIndex]
    )

    const finishDrag = useCallback(
        (event: React.PointerEvent<HTMLButtonElement>) => {
            if (!draggingId) {
                return
            }

            event.preventDefault()
            event.stopPropagation()

            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId)
            }

            const nextOrder = dragOrderRef.current
            const changed = dragChangedRef.current
            dragOrderRef.current = []
            dragChangedRef.current = false
            setDraggingId(null)
            setDragOrder(null)

            if (changed) {
                dispatch(reorderAnimations(nextOrder))
            }
        },
        [dispatch, draggingId]
    )

    return (
        <Paper sx={styles.wrap} elevation={0}>
            <input ref={uploadInputRef} type="file" accept="application/json,.json" hidden onChange={handleUploadFileChange} />
            <List sx={{ ...styles.list, userSelect: draggingId ? 'none' : undefined }}>
                <MenuActionItem icon={<AddIcon />} label={t('menu.addText')} onClick={() => handleCreateAnimation('text')} />
                <MenuActionItem icon={<AddIcon />} label={t('menu.addAnimation')} onClick={() => handleCreateAnimation('pixel')} />
                <MenuActionItem icon={<UploadFileIcon />} label={t('animation_file.upload')} onClick={handleUploadClick} />
                <MenuActionItem
                    icon={<PhotoLibraryIcon />}
                    label={t('menu.gallery')}
                    onClick={() => navigate('/gallery')}
                    selected={active === 'gallery'}
                />

                {admin && (
                    <MenuActionItem
                        icon={<PhotoLibraryIcon />}
                        label={t('menu.admin_gallery')}
                        onClick={() => navigate('/gallery/admin')}
                        selected={active === 'admingallery'}
                    />
                )}

                <Divider />

                {renderedAnimations.map((animation) => (
                    <React.Fragment key={animation.id}>
                        <AnimationInMenu
                            animation={animation}
                            selected={active === 'webedit' && animation.id === currentAnimationId}
                            onClick={() => navigate(`/${animation.id}`)}
                            onRemove={handleRemove}
                            dragging={animation.id === draggingId}
                            dragHandleLabel={t('menu.reorder_animation')}
                            itemRef={(element) => setAnimationItemRef(animation.id, element)}
                            onDragPointerDown={handleDragPointerDown(animation.id)}
                            onDragPointerMove={handleDragPointerMove}
                            onDragPointerUp={finishDrag}
                            onDragPointerCancel={finishDrag}
                        />
                        <Divider />
                    </React.Fragment>
                ))}

                {!uid && (
                    <Button size="small" sx={styles.reset} onClick={handleReset}>
                        {t('menu.clear_library')}
                    </Button>
                )}
            </List>
        </Paper>
    )
}
