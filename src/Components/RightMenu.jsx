/* @flow */
import React, { useState, useCallback, type Node } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { range } from 'lodash'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import SendIcon from '@mui/icons-material/Send'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import AuthDialog from './AuthDialog'
import TransferDialog from './rightMenu/TransferDialog'
import useTransferDialog from './rightMenu/useTransferDialog'
import { logout } from 'Actions/auth'

const style = {
    button: {
        margin: '0 4px'
    }
}

export default function RightMenu(): Node {
    const dispatch = useDispatch()
    const { t } = useTranslation()
    const animations = useSelector((state) => state.animations)
    const uid = useSelector((state) => state.uid)
    const email = useSelector((state) => state.email)
    const [authOpen, setAuthOpen] = useState<boolean>(false)
    const { closeTransferDialog, confirmTransfer, isTransferring, openTransferDialog, transferOpen, transferProgress } = useTransferDialog(animations)

    const transferStatus = t('transfer_dialog.transferring_status', { progress: Math.round(transferProgress) })

    const handleLogout = useCallback(() => {
        dispatch(logout())
    }, [dispatch])

    const flashInstructions = range(4).map((index) => `${index + 1}. ${t(`transfer_dialog.instructions${index}`)}`)

    return (
        <Stack direction="row" spacing={1} sx={{ alignSelf: 'center' }}>
            <Button onClick={openTransferDialog} size="small" variant="contained" color="primary" style={style.button} startIcon={<SendIcon />}>
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

            <TransferDialog
                cancelLabel={t('transfer_dialog.cancel')}
                instructions={flashInstructions}
                isOpen={transferOpen}
                isTransferring={isTransferring}
                onClose={closeTransferDialog}
                onConfirm={confirmTransfer}
                progress={transferProgress}
                statusText={transferStatus}
                submitLabel={t('transfer_dialog.transfer')}
                title={t('transfer_dialog.title')}
            />

            <AuthDialog isOpen={authOpen} onClose={() => setAuthOpen(false)} />
        </Stack>
    )
}
