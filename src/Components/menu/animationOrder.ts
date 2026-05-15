type OrderedItem = {
    sortOrder?: number
}

function hasExplicitSortOrder(item: OrderedItem): boolean {
    return typeof item.sortOrder === 'number' && Number.isFinite(item.sortOrder)
}

export function sortAnimationsForMenu<T extends OrderedItem>(animations: T[]): T[] {
    return animations
        .map((animation, index) => ({ animation, index }))
        .sort((left, right) => {
            const leftHasOrder = hasExplicitSortOrder(left.animation)
            const rightHasOrder = hasExplicitSortOrder(right.animation)

            if (leftHasOrder && rightHasOrder) {
                return left.animation.sortOrder - right.animation.sortOrder || left.index - right.index
            }

            if (leftHasOrder) {
                return -1
            }

            if (rightHasOrder) {
                return 1
            }

            return left.index - right.index
        })
        .map(({ animation }) => animation)
}

export function moveAnimation<T>(animations: T[], fromIndex: number, toIndex: number): T[] {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= animations.length || toIndex >= animations.length) {
        return animations
    }

    const moved = animations.slice()
    const [animation] = moved.splice(fromIndex, 1)
    moved.splice(toIndex, 0, animation)
    return moved
}

export function applyAnimationSortOrder<T extends OrderedItem>(animations: T[]): T[] {
    return animations.map((animation, sortOrder) => ({
        ...animation,
        sortOrder
    }))
}
