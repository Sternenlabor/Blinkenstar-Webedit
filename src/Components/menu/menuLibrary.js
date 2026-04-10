/* @flow */
import type { Map } from 'immutable'
import type { Animation } from 'Reducer'
import { INITIAL_ANIMATION_TEXT } from '../../variables'

type RemoteAnimation = Animation & {
    user_id?: string
}

export function shouldSeedPlaceholderLibrary(animations: Map<string, Animation>, uid: ?string): boolean {
    return animations.size === 0 && !uid
}

export function getDisplayAnimations(animations: Map<string, Animation>, uid: ?string): Animation[] {
    const animationList: RemoteAnimation[] = animations.valueSeq().toArray()
    const hasRemoteAnimations = Boolean(uid && animationList.some((animation) => animation.user_id != null))

    if (!hasRemoteAnimations) {
        return animationList
    }

    return animationList.filter(
        (animation) => !(animation.type === 'text' && animation.text === INITIAL_ANIMATION_TEXT && animation.user_id == null)
    )
}
