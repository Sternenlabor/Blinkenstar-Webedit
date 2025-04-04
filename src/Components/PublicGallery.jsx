/* @flow */
import React from 'react';
import { connect } from 'react-redux';
import UUID from 'uuid-js';
import { t } from 'i18next';
import Radium from 'radium';
import { Map } from 'immutable';

import App from './App';
import Gallery from './Gallery';
import { addAnimation } from '../Actions/animations';
import { loadGallery } from '../Actions/gallery';

const style = {
  canvas: {
    padding: '20px',
  },
  loading: {
    textAlign: 'center'
  }
};

type Props = {
  width: number,
  gallery: Map<string, Animation>,
};

class PublicGallery extends React.Component<Props> {
  static defaultProps = {
    gallery: new Map()
  };

  componentDidMount() {
    if (this.props.gallery.size === 0) {
      this.props.loadGallery();
    }
  }

  copyAnimationToLibrary = (animation) => {
    const cleaned = Object.assign({}, animation, {
      id: UUID.create().toString(),
      author: undefined,
      animation: { ...animation.animation }
    });

    this.props.addAnimation(cleaned, this.props.uid);
  }

  render() {
    const gallery = this.props.gallery.valueSeq().sortBy(a => a.creationDate).reverse();

    return (
      <App activeView="gallery" {...this.props}>
        <div style={style.canvas}>
          { gallery.size === 0 
            ? <div style={style.loading}><h3>Loading...</h3></div>
            : <Gallery 
                gallery={gallery} 
                clickLabel={ t('gallery.copy_animation') }
                onClick={this.copyAnimationToLibrary}
              />
          }
        </div>
      </App>
    );
  }
}

export default connect(
  state => ({ 
    uid: state.uid,
    gallery: state.gallery 
  }), 
  { addAnimation, loadGallery }
)(PublicGallery);
