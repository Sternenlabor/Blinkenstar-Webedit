/* @flow */
import React from 'react';
import { connect } from 'react-redux';
import { t } from 'i18next';
import Radium from 'radium';
import type { Map } from 'immutable';
// Updated imports from @material-ui/core and @material-ui/icons
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import AnimationInMenu from './AnimationInMenu';
import { newAnimation, addAnimation, removeAnimation, reset } from 'Actions/animations';
import type { Animation } from 'Reducer';
import { INITIAL_ANIMATION_TEXT } from '../variables';

type Props = {
  animations?: Map<string, Animation>,
  addAnimation: typeof addAnimation,
  removeAnimation: typeof removeAnimation,
  reset: typeof reset,
  navigate: Function,
  active?: string,
  admin?: boolean,
  uid?: string,
  currentAnimationId?: string,
};

const style = {
  wrap: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  list: {
    width: '100%',
  },
  reset: {
    width: '100%',
    marginTop: '30px',
    minHeight: '34px',
    color: '#da1616'
  }
};

class Menu extends React.Component<Props> {
  constructor(props) {
    super(props);
    const { animations } = this.props;
    if (animations.toList().size === 0) {
      this.props.addAnimation(newAnimation('text', INITIAL_ANIMATION_TEXT));
    }
  }

  handleRemove = (animationId) => {
    this.props.removeAnimation(animationId, this.props.uid);
  }
  
  handleReset = () => {
    if (confirm(t('menu.newWarning'))) {
      this.props.reset();
      this.props.navigate('/');
    }
  };

  addTextAnimation = () => {
    const { payload } = this.props.addAnimation(newAnimation('text'));
    this.props.navigate(`/${payload.id}`);
  };
  addPixelAnimation = () => {
    const { payload } = this.props.addAnimation(newAnimation('pixel'));
    this.props.navigate(`/${payload.id}`);
  };

  render() {
    const { animations, active, admin } = this.props;

    return (
      <Paper style={style.wrap}>
        <List style={style.list}>
          <ListItem button onClick={this.addTextAnimation}>
            <ListItemAvatar>
              <Avatar>
                <AddIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={t('menu.addText')} />
          </ListItem>
          <ListItem button onClick={this.addPixelAnimation}>
            <ListItemAvatar>
              <Avatar>
                <AddIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={t('menu.addAnimation')} />
          </ListItem>
          <ListItem button onClick={() => this.props.navigate('/gallery')}
            style={(active === 'gallery') ? { backgroundColor: '#e0e0e0' } : {}}
          >
            <ListItemAvatar>
              <Avatar>
                <PhotoLibraryIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={t('menu.gallery')} />
          </ListItem>
          {admin && 
            <ListItem button onClick={() => this.props.navigate('/gallery/admin')}
              style={(active === 'admingallery') ? { backgroundColor: '#e0e0e0' } : {}}
            >
              <ListItemAvatar>
                <Avatar>
                  <PhotoLibraryIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={t('menu.admin_gallery')} />
            </ListItem>
          }
          <Divider />
          {animations
            .map(animation => (
              <AnimationInMenu
                selected={active === 'webedit' && animation.id === this.props.currentAnimationId}
                key={animation.id}
                animation={animation}
                onClick={() => { this.props.navigate(`/${animation.id}`) }}
                onRemove={this.handleRemove}
              />
            ))
            .toList()
            .toArray()}
          <Divider />
          { !this.props.uid && 
            <Button
              size="small"
              style={style.reset}
              onClick={this.handleReset}
            >
              { t('menu.clear_library') }
            </Button>
          }
        </List>
      </Paper>
    );
  }
}

export default connect(
  state => ({
    uid: state.uid,
    admin: state.admin,
    animations: state.animations,
  }),
  { addAnimation, removeAnimation, reset }
)(Radium(Menu));
