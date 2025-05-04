/* @flow */
import React, { useEffect, useCallback, type Node } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Paper, List, ListItem, ListItemAvatar, ListItemText, Divider, Button, Avatar } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import AnimationInMenu from './AnimationInMenu'
import { newAnimation, addAnimation, removeAnimation, reset } from 'Actions/animations'
import { syncLibrary } from '../Actions/auth'
import { INITIAL_ANIMATION_TEXT } from '../variables'
import type { Animation } from 'Reducer'

type Props = {
    active: string,
    currentAnimationId: string
}

const styles = {
    wrap: { alignItems: 'center', display: 'flex', flexDirection: 'column' },
    list: { width: '100%' },
    listItem: { backgroundColor: 'transparent', border: 'none' },
    listItemActive: { backgroundColor: '#E0E0E0', border: 'none' },
    reset: { width: '100%', marginTop: '30px', minHeight: '34px', color: '#da1616' }
}

export default function Menu({ active, currentAnimationId }: Props): Node {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { t } = useTranslation()

    // Pull our pieces of state
    const animations = useSelector((state) => state.animations) // Map<string, Animation>
    const uid = useSelector((state) => state.uid) // '' or user id
    const admin = useSelector((state) => state.admin) // boolean

    // On mount: inject a default only for unauthenticated, then sync if logged in
    useEffect(() => {
        if (animations.size === 0 && !uid) {
            const anim = newAnimation('text', INITIAL_ANIMATION_TEXT)
            dispatch(addAnimation(anim, uid))
        }
        if (uid) {
            dispatch(syncLibrary(uid, animations))
        }
    }, [animations.size, dispatch, uid])

    // Build an array of all animations
    const animArray: Animation[] = animations.valueSeq().toArray()
    // Detect if any of these came from the server (they’ll have a user_id field)
    const hasRemote = Boolean(uid && animArray.some((a: any) => a.user_id != null))
    // Filter out only our in-memory placeholder (text===INITIAL_ANIMATION_TEXT && no user_id)
    const displayAnims: Animation[] = hasRemote
        ? animArray.filter((a: any) => !(a.type === 'text' && a.text === INITIAL_ANIMATION_TEXT && a.user_id == null))
        : animArray

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

    const addTextAnimation = useCallback(() => {
        const anim = newAnimation('text')
        dispatch(addAnimation(anim, uid))
        navigate(`/${anim.id}`)
    }, [dispatch, navigate, uid])

    const addPixelAnimation = useCallback(() => {
        const anim = newAnimation('pixel')
        dispatch(addAnimation(anim, uid))
        navigate(`/${anim.id}`)
    }, [dispatch, navigate, uid])

    return (
        <Paper style={styles.wrap} elevation={0}>
            <List style={styles.list}>
                <ListItem component="button" onClick={addTextAnimation} style={styles.listItem}>
                    <ListItemAvatar>
                        <Avatar>
                            <AddIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={t('menu.addText')} />
                </ListItem>

                <ListItem component="button" onClick={addPixelAnimation} style={styles.listItem}>
                    <ListItemAvatar>
                        <Avatar>
                            <AddIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={t('menu.addAnimation')} />
                </ListItem>

                <ListItem
                    component="button"
                    onClick={() => navigate('/gallery')}
                    style={active === 'gallery' ? styles.listItemActive : styles.listItem}
                >
                    <ListItemAvatar>
                        <Avatar>
                            <PhotoLibraryIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={t('menu.gallery')} />
                </ListItem>

                {admin && (
                    <ListItem
                        component="button"
                        onClick={() => navigate('/gallery/admin')}
                        style={active === 'admingallery' ? styles.listItemActive : styles.listItem}
                    >
                        <ListItemAvatar>
                            <Avatar>
                                <PhotoLibraryIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={t('menu.admin_gallery')} />
                    </ListItem>
                )}

                <Divider />

                {displayAnims.map((anim) => (
                    <React.Fragment key={anim.id}>
                        <AnimationInMenu
                            animation={anim}
                            selected={active === 'webedit' && anim.id === currentAnimationId}
                            onClick={() => navigate(`/${anim.id}`)}
                            onRemove={handleRemove}
                        />
                        <Divider />
                    </React.Fragment>
                ))}

                {!uid && (
                    <Button size="small" style={styles.reset} onClick={handleReset}>
                        {t('menu.clear_library')}
                    </Button>
                )}
            </List>
        </Paper>
    )
}
