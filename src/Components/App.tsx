/* @flow */
import React, { useEffect, useState, Node } from 'react';
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Outlet, useLocation } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import MenuIcon from '@mui/icons-material/Menu'
import Menu from './Menu'
import RightMenu from './RightMenu'
import { getActiveView, getCurrentAnimationId } from './app/routeState'
import type { AppView } from './app/routeState'
import useSharedAnimationImport from './app/useSharedAnimationImport'

// Custom MUI theme...
const customTheme = createTheme({
    palette: { primary: { main: '#99c430', contrastText: '#fff' }, secondary: { main: '#eb6308' } },
    typography: {
        fontFamily: '"Jura", "Roboto", "Helvetica", "Arial", sans-serif',
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 700,
        h6: {
            fontFamily: '"Jura", "Roboto", "Helvetica", "Arial", sans-serif',
            fontWeight: 900,
            textTransform: 'uppercase'
        }
    }
})

function App(): Node {
    return (
        <ThemeProvider theme={customTheme}>
            <AppLayout />
        </ThemeProvider>
    )
}

function AppLayout(): Node {
    useSharedAnimationImport()

    const { t } = useTranslation()
    const theme = useTheme()
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true })
    const [drawerOpen, setDrawerOpen] = useState<boolean>(isDesktop)
    const animations = useSelector((state) => state.animations)
    const location = useLocation()

    useEffect(() => {
        setDrawerOpen(isDesktop)
    }, [isDesktop])

    const activeView: AppView = getActiveView(location.pathname)
    const currentAnimationId = getCurrentAnimationId(location.pathname, activeView)
    const drawerWidth = 240

    return (
        <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
            <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={() => setDrawerOpen((open) => !open)}
                        sx={{ mr: 2 }}
                    >
                        <Badge badgeContent={animations.size} color="secondary" overlap="rectangular">
                            <MenuIcon />
                        </Badge>
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {t('headerTitle')}
                    </Typography>
                    <RightMenu />
                </Toolbar>
            </AppBar>

            <Drawer
                variant="persistent"
                open={drawerOpen}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        top: { xs: theme.spacing(7), sm: theme.spacing(8) }
                    }
                }}
            >
                <Menu active={activeView} currentAnimationId={currentAnimationId} />
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, ml: drawerOpen ? `${drawerWidth}px` : 0, minWidth: 0 }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    )
}

export default App
