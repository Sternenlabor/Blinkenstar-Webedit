/* @flow */
import React, { useState, useEffect, type Node } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Snackbar, Alert } from '@mui/material'
import { Link, Share, Close } from '@mui/icons-material'

type Props = {
    animation?: Animation,
    close: () => mixed
}

export default function ShareWidget({ animation, close }: Props): Node {
    const { t } = useTranslation()
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false)
    const [snackbarMessage, setSnackbarMessage] = useState<string>('')
    const [supportsSharing, setSupportsSharing] = useState<boolean>(false)

    useEffect(() => {
        setSupportsSharing(!!navigator.share)
    }, [])

    if (!animation) return null

    // Generate URL using URL API and current location
    const generateShareUrl = () => {
        const shareString = btoa(JSON.stringify(animation))
        const url = new URL(window.location.href)

        // Reset existing query parameters and set new share parameter
        url.search = ''
        url.searchParams.set('s', shareString)

        return url.toString()
    }

    const url = generateShareUrl()

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url)
            showFeedback(t('share_dialog.copied', 'Copied to clipboard!'))
        } catch (err) {
            showFeedback(t('share_dialog.copy_error', 'Failed to copy!'))
        }
    }

    const handleShare = async () => {
        try {
            await navigator.share({
                title: t('share_dialog.title'),
                text: t('share_dialog.share_text'),
                url: url
            })
        } catch (err) {
            // Sharing was canceled
        }
    }

    const showFeedback = (message: string) => {
        setSnackbarMessage(message)
        setSnackbarOpen(true)
    }

    return (
        <>
            <Dialog open onClose={close} fullWidth maxWidth="sm">
                <DialogTitle>{t('share_dialog.title')}</DialogTitle>

                <DialogContent>
                    <Stack spacing={2} py={1}>
                        <p>{t('share_dialog.instructions')}</p>

                        <Stack direction="row" spacing={2}>
                            {supportsSharing && (
                                <Button variant="contained" startIcon={<Share />} onClick={handleShare} fullWidth>
                                    {t('share_dialog.share')}
                                </Button>
                            )}

                            <Button variant="contained" startIcon={<Link />} onClick={handleCopy} fullWidth>
                                {t('share_dialog.copy_link')}
                            </Button>
                        </Stack>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={close} startIcon={<Close />} color="inherit">
                        {t('share_dialog.close')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
                <Alert severity="success" onClose={() => setSnackbarOpen(false)} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    )
}
