/* @flow */
import React, { type Node } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'

type Props = {
    cancelLabel: string,
    instructions: string[],
    isOpen: boolean,
    isTransferring: boolean,
    onClose: () => void,
    onConfirm: () => void,
    progress: number,
    statusText: string,
    submitLabel: string,
    title: string
}

export default function TransferDialog({
    cancelLabel,
    instructions,
    isOpen,
    isTransferring,
    onClose,
    onConfirm,
    progress,
    statusText,
    submitLabel,
    title
}: Props): Node {
    return (
        <Dialog open={isOpen} onClose={onClose} aria-labelledby="transfer-dialog-title" disableEscapeKeyDown={isTransferring}>
            <DialogTitle id="transfer-dialog-title">{title}</DialogTitle>
            <DialogContent>
                {instructions.map((instruction, index) => (
                    <Typography key={instruction} component="div" sx={{ mt: index === 0 ? 0 : 0.5 }}>
                        {instruction}
                    </Typography>
                ))}

                {isTransferring ? (
                    <React.Fragment>
                        <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                            {statusText}
                        </Typography>
                        <LinearProgress variant="determinate" value={progress} />
                    </React.Fragment>
                ) : null}
            </DialogContent>
            <DialogActions>
                <Button variant="text" color="secondary" onClick={onClose} startIcon={<CloseIcon />} disabled={isTransferring}>
                    {cancelLabel}
                </Button>
                <Button variant="contained" color="primary" onClick={onConfirm} startIcon={<SendIcon />} disabled={isTransferring}>
                    {submitLabel}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
