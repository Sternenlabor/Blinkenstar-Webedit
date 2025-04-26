import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { addAnimation } from 'Actions/animations'
import UUID from 'uuid-js'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import Menu from './Menu'
import RightMenu from './RightMenu'
import Divider from '@mui/material/Divider'

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

function App() {
    return (
        <ThemeProvider theme={customTheme}>
            <AppLayout />
        </ThemeProvider>
    )
}

function AppLayout() {
    const { t } = useTranslation()
    const theme = useTheme()
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true })
    const [drawerOpen, setDrawerOpen] = useState(isDesktop)
    const animations = useSelector((state) => state.animations)
    const dispatch = useDispatch() // get dispatch reference&#8203;:contentReference[oaicite:3]{index=3}
    const navigate = useNavigate()
    const location = useLocation()

    // On mount, check for shared-animation query parameter 's'
    useEffect(() => {
        const params = new URLSearchParams(location.search) // useLocation().search contains query string&#8203;:contentReference[oaicite:4]{index=4}
        const sParam = params.get('s')
        if (sParam) {
            try {
                // Decode the shared data (URI-decoded and Base64-decoded)
                const decodedString = atob(decodeURIComponent(sParam))
                const sharedAnim = JSON.parse(decodedString)

                // Assign a new unique ID
                const newId = UUID.create().toString()
                sharedAnim.id = newId

                // Dispatch Redux action to add the new animation
                dispatch(addAnimation(sharedAnim)) // dispatches ADD_ANIMATION

                // Navigate to the new animation’s path (e.g. '/<newId>')
                navigate(`/${newId}`, { replace: true })
            } catch (err) {
                console.error('Failed to parse shared animation data:', err)
            }
        }
    }, []) // empty dependency array ensures this runs once on mount

    // Determine active view based on path
    let activeView = 'webedit'
    if (location.pathname.startsWith('/gallery/admin')) {
        activeView = 'admingallery'
    } else if (location.pathname.startsWith('/gallery')) {
        activeView = 'gallery'
    }

    // Extract current animation ID from path if on webedit view
    let currentAnimationId = ''
    if (activeView === 'webedit') {
        const pathParts = location.pathname.split('/')
        if (pathParts.length > 1 && pathParts[1]) {
            currentAnimationId = pathParts[1]
        }
    }

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen)
    }
    const drawerWidth = 240

    return (
        <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
            <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
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

            <Box component="main" sx={{ flexGrow: 1, ml: drawerOpen ? `${drawerWidth}px` : 0 }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    )
}

export default App
