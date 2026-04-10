/* @flow */
import React from 'react'
import type { Animation } from 'Reducer'
import GalleryItem from './GalleryItem'
import GalleryGrid from './gallery/GalleryGrid'

type Props = {
    gallery: Animation[],
    clickIcon?: "add" | "remove",
    clickLabel: string,
    onClick?: ((animation: Animation) => unknown)
};

function Gallery(
    {
        gallery,
        clickIcon,
        clickLabel,
        onClick
    }: Props
): React.ReactNode {
    return (
        <GalleryGrid>
            {gallery.map((animation) => (
                <GalleryItem key={animation.id} animation={animation} size="gallery" clickIcon={clickIcon} clickLabel={clickLabel} onClick={onClick} />
            ))}
        </GalleryGrid>
    )
}

Gallery.defaultProps = {
    gallery: []
}

export default Gallery
