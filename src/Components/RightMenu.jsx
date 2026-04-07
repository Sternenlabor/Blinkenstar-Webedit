/* @flow */
import React, { useState, useCallback, type Node } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { range } from 'lodash'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import SendIcon from '@mui/icons-material/Send'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import CloseIcon from '@mui/icons-material/Close'
import AuthDialog from './AuthDialog'
import { logout } from 'Actions/auth'
import transfer from 'Services/flash'

const style = {
    wrap: {
        alignSelf: 'center',
        display: 'flex',
        justifyContent: 'space-between'
    },
    button: {
        margin: '0 4px'
    },
    instructionList: {
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        padding: 0
    },
    progressWrap: {
        marginTop: 16
    }
}

export default function RightMenu(): Node {
    const dispatch = useDispatch()
    const { t } = useTranslation()
    const animations = useSelector((state) => state.animations)
    const uid = useSelector((state) => state.uid)
    const email = useSelector((state) => state.email)

    const [transferOpen, setTransferOpen] = useState<boolean>(false)
    const [transferProgress, setTransferProgress] = useState<number>(0)
    const [isTransferring, setIsTransferring] = useState<boolean>(false)
    const [authOpen, setAuthOpen] = useState<boolean>(false)

    const handleTransfer = useCallback(() => {
        if (animations.size > 0) {
            setTransferProgress(0)
            setTransferOpen(true)
        }
    }, [animations.size])

    const handleCancelTransfer = useCallback(() => {
        if (isTransferring) {
            return
        }
        setTransferOpen(false)
        setTransferProgress(0)
    }, [isTransferring])

    const handleConfirmTransfer = useCallback(() => {
        setIsTransferring(true)
        setTransferProgress(0)

        const didStart = transfer(animations, {
            onProgress: (progress) => {
                setTransferProgress(progress)
            },
            onComplete: () => {
                setTransferProgress(100)
                setIsTransferring(false)
                setTransferOpen(false)
            },
            onError: () => {
                setIsTransferring(false)
                setTransferProgress(0)
            }
        })

        if (!didStart) {
            setIsTransferring(false)
            setTransferProgress(0)
        }
    }, [animations])

    const transferStatus = t('transfer_dialog.transferring_status', { progress: Math.round(transferProgress) })

    const handleLogout = useCallback(() => {
        dispatch(logout())
    }, [dispatch])

    const flashInstructions = range(4).map((i) => <div key={i}>{`${i + 1}. ${t(`transfer_dialog.instructions${i}`)}`}</div>)

    return (
        <div style={style.wrap}>
            <Button onClick={handleTransfer} size="small" variant="contained" color="primary" style={style.button} startIcon={<SendIcon />}>
                {t('menu.transfer')}
            </Button>

            {uid ? (
                <Button
                    onClick={handleLogout}
                    size="small"
                    variant="contained"
                    color="primary"
                    style={style.button}
                    startIcon={<ExitToAppIcon />}
                >
                    {`${t('menu.logout')} ${email}`}
                </Button>
            ) : (
                <Button onClick={() => setAuthOpen(true)} size="small" variant="contained" color="primary" style={style.button}>
                    {t('menu.login')}
                </Button>
            )}

            <Dialog
                open={transferOpen}
                onClose={handleCancelTransfer}
                aria-labelledby="transfer-dialog-title"
                disableEscapeKeyDown={isTransferring}
            >
                <DialogTitle id="transfer-dialog-title">{t('transfer_dialog.title')}</DialogTitle>
                <DialogContent>
                    <div style={style.instructionList}>{flashInstructions}</div>
                    {isTransferring ? (
                        <div style={style.progressWrap}>
                            <Typography variant="body2" gutterBottom>
                                {transferStatus}
                            </Typography>
                            <LinearProgress variant="determinate" value={transferProgress} />
                        </div>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button variant="text" color="secondary" onClick={handleCancelTransfer} startIcon={<CloseIcon />} disabled={isTransferring}>
                        {t('transfer_dialog.cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleConfirmTransfer}
                        startIcon={<SendIcon />}
                        style={{ marginLeft: 8 }}
                        disabled={isTransferring}
                    >
                        {t('transfer_dialog.transfer')}
                    </Button>
                </DialogActions>
            </Dialog>

            <AuthDialog isOpen={authOpen} onClose={() => setAuthOpen(false)} />
        </div>
    )
}
