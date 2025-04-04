/* @flow */
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import reduxPromise from 'redux-promise';
import { applyMiddleware, compose, createStore } from 'redux';
import { Style, StyleRoot } from 'radium';
import GlobalCSS from 'Components/Global.CSS.js';
import './db';
import './i18n';
import './vendor';
import { FirebaseAuthProvider, } from '@react-firebase/auth';
import firebase from 'firebase';
import reducer from 'Reducer';
import routes from './routes';
import { List } from 'immutable';
import sampleAnimations from './sample_animations.json';
import { saveAnimationsToRemote } from './db';

export const store = (global.store = compose(
  applyMiddleware(reduxPromise),
  window.devToolsExtension ? window.devToolsExtension() : f => f
)(createStore)(reducer));

/* eslint-disable */
if (module.hot) {
  // Enable Webpack hot module replacement for reducers
  // $FlowFixMe
  module.hot.accept('../Reducer', () => {
    const nextRootReducer = require('../Reducer/index').default;
    store.replaceReducer(nextRootReducer);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // $FlowFixMe
  ReactDOM.render(
      <StyleRoot>
        <Style rules={GlobalCSS} />
        <FirebaseAuthProvider firebase={firebase} >
          <Provider store={store}>
            { routes }
          </Provider>
        </FirebaseAuthProvider>
      </StyleRoot>
    , document.querySelector('#app'));
});

window.importSamples = async function () {
  try {
    // Fetch the JSON file containing sample animations.
    const samples = sampleAnimations;
    
    // Convert animations and use List from Immutable.js
    const animations = Object.values(samples).map(animation => {
      animation.animation.data = List(animation.animation.data);
      return animation;
    });
    
    const uid = firebase.auth().currentUser ? firebase.auth().currentUser.uid : 'default-user';
    saveAnimationsToRemote(uid, animations);
    
    console.log('Sample animations imported successfully.');
  } catch (error) {
    console.error('Error importing sample animations:', error);
  }
};