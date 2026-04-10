import React, { useCallback, useEffect, useRef, Node } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Paper, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Divider, Button, Avatar } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import AnimationInMenu from './AnimationInMenu'
import { newAnimation, addAnimation, removeAnimation, reset } from 'Actions/animations'
import { syncLibrary } from '../Actions/auth'
import { INITIAL_ANIMATION_TEXT } from '../variables'
import type { Animation } from 'Reducer'
import { getDisplayAnimations, shouldSeedPlaceholderLibrary } from './menu/menuLibrary'

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

    return (
        <Paper sx={styles.wrap} elevation={0}>
            <List sx={styles.list}>
                <MenuActionItem icon={<AddIcon />} label={t('menu.addText')} onClick={() => handleCreateAnimation('text')} />
                <MenuActionItem icon={<AddIcon />} label={t('menu.addAnimation')} onClick={() => handleCreateAnimation('pixel')} />
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

                {displayAnimations.map((animation) => (
                    <React.Fragment key={animation.id}>
                        <AnimationInMenu
                            animation={animation}
                            selected={active === 'webedit' && animation.id === currentAnimationId}
                            onClick={() => navigate(`/${animation.id}`)}
                            onRemove={handleRemove}
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
