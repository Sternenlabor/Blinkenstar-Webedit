/* @flow */
import React from 'react'
import { Map } from 'immutable'
import GalleryItem from './GalleryItem'

const style = {
    gallery: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        alignContent: 'flex-start',
        height: '100%',
        width: '100%'
    }
}

type Props = {
    gallery: Map<string, Animation>,
    clickIcon: string,
    clickLabel: string,
    onClick?: (Array<Animation>) => mixed
}

function Gallery({ gallery, clickIcon, clickLabel, onClick }: Props): React.Node {
    return (
        <div style={style.gallery}>
            {gallery.valueSeq().map((animation) => (
                <GalleryItem
                    key={animation.id}
                    animation={animation}
                    size="gallery"
                    clickIcon={clickIcon}
                    clickLabel={clickLabel}
                    onClick={onClick}
                />
            ))}
        </div>
    )
}

Gallery.defaultProps = {
    gallery: new Map()
}

export default Gallery
