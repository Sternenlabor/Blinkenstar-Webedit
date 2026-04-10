/* @flow */
import { useCallback, useState } from 'react'
import { Map } from 'immutable';
import type { Animation } from 'Reducer'
import transfer from 'Services/flash'

type TransferDialogState = {
    closeTransferDialog: (() => void),
    confirmTransfer: (() => void),
    isTransferring: boolean,
    openTransferDialog: (() => void),
    transferOpen: boolean,
    transferProgress: number
};

export default function useTransferDialog(animations: Map<string, Animation>): TransferDialogState {
    const [transferOpen, setTransferOpen] = useState<boolean>(false)
    const [transferProgress, setTransferProgress] = useState<number>(0)
    const [isTransferring, setIsTransferring] = useState<boolean>(false)

    const openTransferDialog = useCallback(() => {
        if (animations.size > 0) {
            setTransferProgress(0)
            setTransferOpen(true)
        }
    }, [animations.size])

    const closeTransferDialog = useCallback(() => {
        if (isTransferring) {
            return
        }

        setTransferOpen(false)
        setTransferProgress(0)
    }, [isTransferring])

    const confirmTransfer = useCallback(() => {
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

    return {
        closeTransferDialog,
        confirmTransfer,
        isTransferring,
        openTransferDialog,
        transferOpen,
        transferProgress
    }
}
