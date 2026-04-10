import React, { useState, useEffect, useRef, useCallback, Node } from 'react';
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, Button, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { login, signup } from 'Actions/auth'
import { API_URL } from '../db'

type Props = {
    isOpen: boolean,
    onClose: (() => void)
};

export default function AuthDialog(
    {
        isOpen,
        onClose
    }: Props
): Node {
    const dispatch = useDispatch()
    const { t } = useTranslation()
    const mountedRef = useRef<boolean>(false)

    const [view, setView] = useState<'login' | 'signup' | 'reset'>('login')
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [error, setError] = useState<string>('')

    useEffect(() => {
        if (isOpen) {
            setView('login')
            setEmail('')
            setPassword('')
            setError('')
        }
    }, [isOpen])

    useEffect(() => {
        mountedRef.current = true
        return () => {
            mountedRef.current = false
        }
    }, [])

    const setViewAndClearError = useCallback((nextView: "login" | "signup" | "reset") => {
        setView(nextView)
        setError('')
    }, [])

    const setErrorIfMounted = useCallback((nextError: string) => {
        if (mountedRef.current) {
            setError(nextError)
        }
    }, [])

    const runAuthRequest = useCallback(
        async (request: (() => Promise<any>), fallbackMessage: string): Promise<boolean> => {
            setError('')

            try {
                const action = await request()
                if (// Auto generated from flowToTs. Please clean me!
                action === null || action === undefined ? undefined : action.error) {
                    const message = // Auto generated from flowToTs. Please clean me!
                    (action.payload === null || action.payload === undefined ? undefined : action.payload.message) || // Auto generated from flowToTs. Please clean me!
                    (action.payload === null || action.payload === undefined ? undefined : action.payload.error) || fallbackMessage
                    setErrorIfMounted(message)
                    return false
                }

                return true
            } catch (error) {
                setErrorIfMounted(error instanceof Error ? error.message : fallbackMessage)
                return false
            }
        },
        [setErrorIfMounted]
    )

    const handleLogin = async (e: React.MouseEvent) => {
        e.preventDefault()
        setError('')

        const didLogin = await runAuthRequest(() => dispatch(login(email, password)), t('auth_dialog.login_failed', 'Login failed'))
        if (didLogin) {
            onClose()
        }
    }

    const handleSignup = async () => {
        const didSignup = await runAuthRequest(() => dispatch(signup(email, password)), t('auth_dialog.signup_failed', 'Signup failed'))
        if (didSignup) {
            onClose()
        }
    }

    const handleReset = async () => {
        setError('')
        try {
            const res = await fetch(`${API_URL}/reset_password.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || t('auth_dialog.reset_failed', 'Password reset failed'))
            }
            alert(t('auth_dialog.resetlink_sent_notification'))
            onClose()
        } catch (error) {
            setErrorIfMounted(error instanceof Error ? error.message : t('auth_dialog.reset_failed', 'Password reset failed'))
        }
    }

    const submitButton = {
        login: (
            <Button variant="contained" color="primary" onClick={handleLogin}>
                {t('auth_dialog.login')}
            </Button>
        ),
        signup: (
            <Button variant="contained" color="primary" onClick={handleSignup}>
                {t('auth_dialog.signup')}
            </Button>
        ),
        reset: (
            <Button variant="contained" color="primary" onClick={handleReset}>
                {t('auth_dialog.reset')}
            </Button>
        )
    }[view]

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth>
            <DialogTitle>
                {t('auth_dialog.title')}
                <IconButton aria-label={t('share_dialog.close')} onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <TextField
                    id="email"
                    label={t('auth_dialog.email')}
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value)
                        setError('')
                    }}
                    autoFocus
                    fullWidth
                    margin="normal"
                />

                {view !== 'reset' && (
                    <TextField
                        id="password"
                        label={t('auth_dialog.password')}
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value)
                            setError('')
                        }}
                        fullWidth
                        margin="normal"
                    />
                )}

                {view === 'login' && (
                    <DialogContentText sx={{ fontSize: '0.8rem', mt: 2 }}>
                        {t('auth_dialog.account_missing')}{' '}
                        <Button variant="text" size="small" onClick={() => setViewAndClearError('signup')} sx={{ textTransform: 'none', p: 0, ml: 1 }}>
                            <strong>{t('auth_dialog.create_account')}</strong>
                        </Button>
                        <br />
                        <Button variant="text" size="small" onClick={() => setViewAndClearError('reset')} sx={{ textTransform: 'none', p: 0, mt: 1 }}>
                            {t('auth_dialog.forgot_pwd')}
                        </Button>
                    </DialogContentText>
                )}

                {error && <DialogContentText sx={{ color: 'error.main', mt: 2 }}>{error}</DialogContentText>}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>{t('share_dialog.close')}</Button>
                {submitButton}
            </DialogActions>
        </Dialog>
    )
}
