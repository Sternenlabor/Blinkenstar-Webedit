/* @flow */
import React, { useState, type Node } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import LinkIcon from '@mui/icons-material/Link'
import CloseIcon from '@mui/icons-material/Close'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import type { Animation } from 'Reducer'

type Props = {
    animation?: Animation,
    close: () => mixed
}

export default function ShareWidget({ animation, close }: Props): Node {
    const { t } = useTranslation()
    const [copied, setCopied] = useState<boolean>(false)

    if (!animation) return null

    const shareString = encodeURIComponent(btoa(JSON.stringify(animation)))
    const url = `${HOST}${BASE_URL}/?s=${shareString}`

    return (
        <Dialog open onClose={close}>
            <div style={{ padding: 16 }}>
                <h2>{t('share_dialog.title')}</h2>
                <p>{t('share_dialog.instructions')}</p>

                <CopyToClipboard text={url} onCopy={() => setCopied(true)}>
                    <Button variant="contained" color="primary" startIcon={<LinkIcon />} autoFocus>
                        {t('share_dialog.link')}
                    </Button>
                </CopyToClipboard>

                {copied && <div style={{ marginTop: 8 }}>{t('share_dialog.copied', 'Copied!')}</div>}

                <div style={{ marginTop: 16 }}>
                    <Button variant="text" color="primary" onClick={close} startIcon={<CloseIcon />}>
                        {t('share_dialog.close')}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}
