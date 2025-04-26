/* @flow */
import './i18n'
import React from 'react'
import ReactDOM from 'react-dom/client'
import i18n from './i18n'
import { I18nextProvider } from 'react-i18next'
import { Provider } from 'react-redux'
import reduxPromise from 'redux-promise'
import { applyMiddleware, compose, createStore } from 'redux'
import { API_URL } from './db'
import './vendor'

import reducer from 'Reducer'
import { loggedIn } from './Actions/auth'

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from 'Components/App'
import Webedit from 'Components/Webedit'
import PublicGallery from 'Components/PublicGallery'
import AdminGallery from 'Components/AdminGallery'

// Create Redux store with middleware and DevTools
export const store = createStore(
    reducer,
    compose(applyMiddleware(reduxPromise), window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : (f) => f)
)

// Initialize app: check session then render
const initializeApp = async () => {
    try {
        const res = await fetch(`${API_URL}/user.php`, { credentials: 'include' })
        if (res.ok) {
            const user = await res.json()
            if (user && user.uid) {
                store.dispatch(loggedIn(user))
            }
        }
    } catch (err) {
        console.warn('Could not check user session:', err)
    }

    const root = ReactDOM.createRoot(document.getElementById('app'))
    root.render(
        <Provider store={store}>
            <BrowserRouter>
                <I18nextProvider i18n={i18n}>
                    <Routes>
                        <Route path="/" element={<App />}>
                            <Route index element={<Webedit />} />
                            <Route path=":animationId" element={<Webedit />} />
                            <Route path="gallery" element={<PublicGallery />} />
                            <Route path="gallery/admin" element={<AdminGallery />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Route>
                    </Routes>
                </I18nextProvider>
            </BrowserRouter>
        </Provider>
    )
}

document.addEventListener('DOMContentLoaded', initializeApp)
