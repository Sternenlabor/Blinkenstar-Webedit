/* @flow */
import React, { useState, useCallback, type Node } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { range } from 'lodash'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import SendIcon from '@mui/icons-material/Send'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import CloseIcon from '@mui/icons-material/Close'
import AuthDialog from './AuthDialog'
import { loggedOut } from 'Actions/auth'
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
    }
}

export default function RightMenu(): Node {
    const dispatch = useDispatch()
    const { t } = useTranslation()
    const animations = useSelector((state) => state.animations)
    const uid = useSelector((state) => state.uid)
    const email = useSelector((state) => state.email)

    const [transferOpen, setTransferOpen] = useState<boolean>(false)
    const [authOpen, setAuthOpen] = useState<boolean>(false)

    const handleTransfer = useCallback(() => {
        if (animations.size > 0) {
            setTransferOpen(true)
        }
    }, [animations.size])

    const handleCancelTransfer = useCallback(() => {
        setTransferOpen(false)
    }, [])

    const handleConfirmTransfer = useCallback(() => {
        setTransferOpen(false)
        transfer(animations)
    }, [])

    const handleLogout = useCallback(() => {
        dispatch(loggedOut())
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

            <Dialog open={transferOpen} onClose={handleCancelTransfer} aria-labelledby="transfer-dialog-title">
                <div style={{ padding: 16 }}>
                    <div style={style.instructionList}>{flashInstructions}</div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                        <Button variant="text" color="secondary" onClick={handleCancelTransfer} startIcon={<CloseIcon />}>
                            {t('transfer_dialog.cancel')}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleConfirmTransfer}
                            startIcon={<SendIcon />}
                            style={{ marginLeft: 8 }}
                        >
                            {t('transfer_dialog.transfer')}
                        </Button>
                    </div>
                </div>
            </Dialog>

            <AuthDialog isOpen={authOpen} onClose={() => setAuthOpen(false)} />
        </div>
    )
}
