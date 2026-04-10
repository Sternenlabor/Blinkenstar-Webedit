import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import UUID from 'uuid-js'
import { addAnimation } from 'Actions/animations'

export default function useSharedAnimationImport(): void {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const uid = useSelector((state) => state.uid)

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const sharedPayload = params.get('s')

        if (!sharedPayload) {
            return
        }

        try {
            const sharedAnimation = JSON.parse(atob(decodeURIComponent(sharedPayload)))
            const importedAnimation = {
                ...sharedAnimation,
                id: UUID.create().toString()
            }

            dispatch(addAnimation(importedAnimation, uid))
            navigate(`/${importedAnimation.id}`, { replace: true })
        } catch (error) {
            console.error('Failed to parse shared animation data:', error)
        }
    }, [dispatch, location.search, navigate, uid])
}
