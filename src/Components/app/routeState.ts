
export type AppView = "webedit" | "gallery" | "admingallery";

export function getActiveView(pathname: string): AppView {
    if (pathname.startsWith('/gallery/admin')) {
        return 'admingallery'
    }

    if (pathname.startsWith('/gallery')) {
        return 'gallery'
    }

    return 'webedit'
}

export function getCurrentAnimationId(pathname: string, activeView: AppView): string {
    if (activeView !== 'webedit') {
        return ''
    }

    const [, animationId = ''] = pathname.split('/')
    return animationId
}
